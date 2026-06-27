import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SubmissionStatus } from '@prisma/client';
import {
  courseData,
  drawQuizQuestions,
  findCycle,
  flattenCycles,
  isCycleUnlocked,
  type LearnerProgress,
} from '@inside/content';
import type { QuizAnswerInput } from '@inside/schemas';
import crypto from 'node:crypto';
import type { AuthContext } from '../auth/auth.types';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class LmsService {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  private db(): PrismaService {
    if (!this.prisma) throw new ServiceUnavailableException('Banco de dados indisponível');
    return this.prisma;
  }

  getCourse() {
    return courseData;
  }

  getCycle(cycleCode: string) {
    const cycle = findCycle(cycleCode);
    if (!cycle) throw new NotFoundException('Ciclo não encontrado');
    return cycle;
  }

  async enroll(courseId: string, auth: AuthContext) {
    const prisma = this.db();
    const version = await prisma.courseVersion.findFirst({
      where: { tenantId: auth.activeTenantId, courseId, course: { deletedAt: null } },
      orderBy: { createdAt: 'desc' },
    });
    if (!version) throw new NotFoundException('Curso não encontrado neste tenant');

    return prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.upsert({
        where: {
          tenantId_userId_courseVersionId: {
            tenantId: auth.activeTenantId,
            userId: auth.userId,
            courseVersionId: version.id,
          },
        },
        update: { status: 'active', deletedAt: null },
        create: {
          tenantId: auth.activeTenantId,
          userId: auth.userId,
          courseVersionId: version.id,
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'enrollment.upserted',
          entity: 'Enrollment',
          entityId: enrollment.id,
          metadata: { courseId },
        },
      });
      return enrollment;
    });
  }

  getEnrollments(auth: AuthContext) {
    return this.db().enrollment.findMany({
      where: { tenantId: auth.activeTenantId, userId: auth.userId, deletedAt: null },
      include: { courseVersion: { include: { course: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProgress(auth: AuthContext) {
    const progress = await this.getLearnerProgress(auth);
    const cycles = flattenCycles();
    return {
      ...progress,
      totalCycles: cycles.length,
      percentage: cycles.length ? Math.round((progress.completedCycles.length / cycles.length) * 100) : 0,
      unlockedCycles: cycles.filter((cycle) => isCycleUnlocked(cycle.code, progress)).map((cycle) => cycle.code),
      pendingCycles: cycles.filter((cycle) => !progress.completedCycles.includes(cycle.code)).map((cycle) => cycle.code),
    };
  }

  async getLearnerProgress(auth: AuthContext): Promise<LearnerProgress> {
    const prisma = this.db();
    const [completions, submissions, attempts] = await Promise.all([
      prisma.cycleCompletion.findMany({
        where: { tenantId: auth.activeTenantId, userId: auth.userId },
        include: { cycle: true },
      }),
      prisma.submission.findMany({
        where: { tenantId: auth.activeTenantId, userId: auth.userId, status: { not: SubmissionStatus.DRAFT } },
      }),
      prisma.quizAttempt.findMany({
        where: { tenantId: auth.activeTenantId, userId: auth.userId, status: 'SUBMITTED' },
        include: { cycle: true },
      }),
    ]);
    const scored = [
      ...attempts.map((attempt) => attempt.score),
      ...submissions.flatMap((submission) => (submission.score === null ? [] : [submission.score])),
    ];
    const projectScores = Object.fromEntries(
      submissions
        .filter((submission) => submission.projectId && submission.status === SubmissionStatus.APPROVED)
        .map((submission) => [submission.projectId!, submission.score ?? 0]),
    );
    const challenge = submissions.find(
      (submission) => submission.challengeId && submission.status === SubmissionStatus.APPROVED,
    );
    return {
      completedCycles: completions.map(({ cycle }) => cycle.code),
      submittedActivities: submissions.flatMap(({ activityId }) => (activityId ? [activityId] : [])),
      passedQuizzes: attempts
        .filter(({ passed }) => passed)
        .map(({ cycle }) => findCycle(cycle.code)?.quiz.id)
        .filter((quizId): quizId is string => Boolean(quizId)),
      projectScores,
      finalChallengeScore: challenge?.score ?? undefined,
      averageScore: scored.length ? Math.round(scored.reduce((total, score) => total + score, 0) / scored.length) : 0,
    };
  }

  private async requireEnrollment(auth: AuthContext, cycleId: string) {
    const enrollment = await this.db().enrollment.findFirst({
      where: {
        tenantId: auth.activeTenantId,
        userId: auth.userId,
        status: 'active',
        deletedAt: null,
        courseVersion: { modules: { some: { cycles: { some: { id: cycleId, tenantId: auth.activeTenantId } } } } },
      },
    });
    if (!enrollment) throw new ForbiddenException('Matrícula ativa necessária');
    return enrollment;
  }

  async completeCycle(cycleIdOrCode: string, auth: AuthContext) {
    const prisma = this.db();
    const cycle = await prisma.cycle.findFirst({
      where: {
        tenantId: auth.activeTenantId,
        OR: [{ id: cycleIdOrCode }, { code: cycleIdOrCode }],
      },
    });
    if (!cycle) throw new NotFoundException('Ciclo não encontrado');
    await this.requireEnrollment(auth, cycle.id);
    const contentCycle = this.getCycle(cycle.code);
    const progress = await this.getLearnerProgress(auth);
    if (!isCycleUnlocked(cycle.code, progress)) throw new ForbiddenException('Ciclo bloqueado por pré-requisitos');
    if (!progress.passedQuizzes.includes(contentCycle.quiz.id)) throw new ForbiddenException('Quiz obrigatório ainda não aprovado');
    if (!progress.submittedActivities.includes(contentCycle.activity.id)) {
      throw new ForbiddenException('Atividade obrigatória ainda não entregue');
    }

    return prisma.$transaction(async (tx) => {
      const completion = await tx.cycleCompletion.upsert({
        where: {
          tenantId_userId_cycleId: {
            tenantId: auth.activeTenantId,
            userId: auth.userId,
            cycleId: cycle.id,
          },
        },
        update: {},
        create: { tenantId: auth.activeTenantId, userId: auth.userId, cycleId: cycle.id },
      });
      await tx.progressEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          userId: auth.userId,
          cycleId: cycle.id,
          eventType: 'cycle_completed',
          metadata: {},
        },
      });
      return completion;
    });
  }

  async createQuizAttempt(quizId: string, auth: AuthContext) {
    const contentCycle = flattenCycles().find((cycle) => cycle.quiz.id === quizId);
    if (!contentCycle) throw new NotFoundException('Quiz não encontrado');
    const cycle = await this.db().cycle.findFirst({
      where: { tenantId: auth.activeTenantId, code: contentCycle.code },
    });
    if (!cycle) throw new NotFoundException('Quiz não disponível neste tenant');
    await this.requireEnrollment(auth, cycle.id);
    const progress = await this.getLearnerProgress(auth);
    if (!isCycleUnlocked(contentCycle.code, progress)) throw new ForbiddenException('Quiz bloqueado');

    const attempts = await this.db().quizAttempt.count({
      where: { tenantId: auth.activeTenantId, userId: auth.userId, cycleId: cycle.id },
    });
    if (attempts >= 3) throw new ForbiddenException('Limite de 3 tentativas atingido');
    const seed = crypto.randomBytes(16).toString('hex');
    const attempt = await this.db().quizAttempt.create({
      data: {
        tenantId: auth.activeTenantId,
        userId: auth.userId,
        cycleId: cycle.id,
        seed,
        score: 0,
        passed: false,
      },
    });
    return {
      id: attempt.id,
      quizId,
      questions: this.safeQuestions(contentCycle.code, seed),
      attemptNumber: attempts + 1,
      maxAttempts: 3,
    };
  }

  private safeQuestions(cycleCode: string, seed: string) {
    return drawQuizQuestions(cycleCode, seed).map(
      ({ correctOptionId: _correctOptionId, explanation: _explanation, ...question }) => question,
    );
  }

  async saveQuizAnswer(attemptId: string, input: QuizAnswerInput, auth: AuthContext) {
    const prisma = this.db();
    const attempt = await prisma.quizAttempt.findFirst({
      where: { id: attemptId, tenantId: auth.activeTenantId, userId: auth.userId },
      include: { cycle: true },
    });
    if (!attempt) throw new NotFoundException('Tentativa não encontrada');
    if (attempt.status !== 'IN_PROGRESS') throw new ConflictException('Tentativa já submetida');
    const selectedQuestions = drawQuizQuestions(attempt.cycle.code, attempt.seed);
    const question = selectedQuestions.find(({ id }) => id === input.questionId);
    const option = question?.options.find(({ id }) => id === input.selectedOptionId);
    if (!question || !option) throw new ForbiddenException('Questão ou alternativa não pertence à tentativa');

    return prisma.quizAttemptAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId: input.questionId } },
      update: { selectedOptionId: input.selectedOptionId, correct: question.correctOptionId === input.selectedOptionId },
      create: {
        tenantId: auth.activeTenantId,
        attemptId,
        questionId: input.questionId,
        selectedOptionId: input.selectedOptionId,
        correct: question.correctOptionId === input.selectedOptionId,
      },
      select: { questionId: true, selectedOptionId: true, updatedAt: true },
    });
  }

  async submitQuizAttempt(attemptId: string, auth: AuthContext) {
    const prisma = this.db();
    const attempt = await prisma.quizAttempt.findFirst({
      where: { id: attemptId, tenantId: auth.activeTenantId, userId: auth.userId },
      include: { cycle: true, answers: true },
    });
    if (!attempt) throw new NotFoundException('Tentativa não encontrada');
    if (attempt.status !== 'IN_PROGRESS') throw new ConflictException('Tentativa já submetida');
    const contentCycle = this.getCycle(attempt.cycle.code);
    const questions = drawQuizQuestions(attempt.cycle.code, attempt.seed);
    if (attempt.answers.length !== questions.length) throw new ConflictException('Responda todas as questões antes de enviar');
    const score = Math.round((attempt.answers.filter(({ correct }) => correct).length / questions.length) * 100);
    const passed = score >= contentCycle.quiz.passingScore;

    return prisma.$transaction(async (tx) => {
      const submitted = await tx.quizAttempt.update({
        where: { id: attempt.id },
        data: { status: 'SUBMITTED', submittedAt: new Date(), score, passed },
        select: { id: true, score: true, passed: true, submittedAt: true },
      });
      await tx.progressEvent.create({
        data: {
          tenantId: auth.activeTenantId,
          userId: auth.userId,
          cycleId: attempt.cycleId,
          eventType: passed ? 'quiz_passed' : 'quiz_failed',
          metadata: { score, attemptId },
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'quiz.submitted',
          entity: 'QuizAttempt',
          entityId: attempt.id,
          metadata: { score, passed },
        },
      });
      return submitted;
    });
  }

  async getQuizAttempt(attemptId: string, auth: AuthContext) {
    const attempt = await this.db().quizAttempt.findFirst({
      where: { id: attemptId, tenantId: auth.activeTenantId, userId: auth.userId },
      include: { cycle: true, answers: { select: { questionId: true, selectedOptionId: true } } },
    });
    if (!attempt) throw new NotFoundException('Tentativa não encontrada');
    return {
      id: attempt.id,
      status: attempt.status,
      score: attempt.status === 'SUBMITTED' ? attempt.score : undefined,
      passed: attempt.status === 'SUBMITTED' ? attempt.passed : undefined,
      questions: this.safeQuestions(attempt.cycle.code, attempt.seed),
      answers: attempt.answers,
    };
  }

  getQuizAttempts(auth: AuthContext) {
    return this.db().quizAttempt.findMany({
      where: { tenantId: auth.activeTenantId, userId: auth.userId },
      select: { id: true, cycleId: true, status: true, score: true, passed: true, createdAt: true, submittedAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
