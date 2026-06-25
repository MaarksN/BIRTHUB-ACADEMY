import { Injectable, ForbiddenException, NotFoundException, Optional } from '@nestjs/common';
import { courseData, drawQuizQuestions, findCycle, isCycleUnlocked, type LearnerProgress } from '@inside/content';
import type { ProgressEventInput } from '@inside/schemas';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class LmsService {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  getCourse() {
    return courseData;
  }

  getCycle(cycleCode: string) {
    const cycle = findCycle(cycleCode);
    if (!cycle) throw new NotFoundException('Ciclo não encontrado');
    return cycle;
  }

  startQuiz(cycleCode: string, attemptSeed: string, progress: LearnerProgress) {
    const cycle = this.getCycle(cycleCode);
    if (!isCycleUnlocked(cycleCode, progress)) {
      throw new ForbiddenException('Ciclo bloqueado por regra de progressão');
    }
    return {
      quizId: cycle.quiz.id,
      cycleCode,
      questions: drawQuizQuestions(cycleCode, attemptSeed).map(
        ({ correctOptionId: _correctOptionId, explanation: _explanation, ...safeQuestion }) => safeQuestion,
      ),
    };
  }

  async recordProgressEvent(input: ProgressEventInput) {
    const cycle = this.getCycle(input.cycleCode);
    if (!this.prisma || !process.env.DATABASE_URL) {
      return {
        persisted: false,
        reason: 'DATABASE_URL ausente; evento validado, mas não gravado.',
        event: { ...input, cycleId: cycle.id },
      };
    }

    const event = await this.prisma.progressEvent.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        cycleId: cycle.id,
        eventType: input.eventType,
        metadata: input.metadata as any,
      },
    });
    return { persisted: true, event };
  }
}
