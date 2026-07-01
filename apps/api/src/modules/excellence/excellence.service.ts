import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import crypto from 'node:crypto';
import {
  excellenceItems,
  excellenceCompetencies,
  excellencePillars,
  getExcellenceItem,
  getExcellenceReadinessScore,
} from '@inside/content';
import type { AuthContext } from '../auth/auth.types';
import type {
  AiTutorRequest,
  LearningPlanRequest,
  QualityScoreRequest,
  SupportTicketInput,
} from '@inside/schemas';
import { PrismaService } from '../common/prisma.service';

const json = (value: unknown) => value as Prisma.InputJsonValue;

@Injectable()
export class ExcellenceService {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  private db(): PrismaService {
    if (!this.prisma) throw new ServiceUnavailableException('Banco de dados indisponível');
    return this.prisma;
  }

  listItems() {
    return {
      total: excellenceItems.length,
      items: excellenceItems,
    };
  }

  getItem(slugOrNumber: string) {
    const item = getExcellenceItem(slugOrNumber);
    if (!item) throw new NotFoundException('Item de excelência não encontrado');
    return item;
  }

  getRoadmap() {
    const p0 = excellenceItems.filter((item) => item.priority === 'P0');
    const p1 = excellenceItems.filter((item) => item.priority === 'P1');
    const p15 = excellenceItems.filter((item) => item.priority === 'P1.5');
    const p2 = excellenceItems.filter((item) => item.priority === 'P2');
    const p3 = excellenceItems.filter((item) => item.priority === 'P3');

    return {
      phases: [
        {
          id: 'p0',
          title: 'Fundação segura da plataforma',
          priority: 'P0',
          items: p0,
          objective: 'Consolidar autenticação, sessão, multi-tenant e modelo de dados.',
        },
        {
          id: 'p1',
          title: 'Jornada acadêmica real',
          priority: 'P1',
          items: p1,
          objective: 'Operar matrícula, progresso, quiz, submissões, certificados e integração web/API.',
        },
        {
          id: 'p1-5',
          title: 'Base premium de aprendizagem',
          priority: 'P1.5',
          items: p15,
          objective: 'Elevar pedagogia, IA educacional, avaliação e laboratórios práticos.',
        },
        {
          id: 'p2',
          title: 'Escala acadêmica e experiência',
          priority: 'P2',
          items: p2,
          objective: 'Criar comunidade, mentoria, carreira, acessibilidade, analytics e governança.',
        },
        {
          id: 'p3',
          title: 'Escala global e comercial',
          priority: 'P3',
          items: p3,
          objective: 'Preparar white-label, integrações, internacionalização e growth avançado.',
        },
      ],
      readiness: getExcellenceReadinessScore([]),
    };
  }

  listCompetencies() {
    return {
      total: excellenceCompetencies.length,
      competencies: excellenceCompetencies,
    };
  }

  listPillars() {
    return {
      total: excellencePillars.length,
      pillars: excellencePillars,
    };
  }

  listLearningPlans(auth: AuthContext) {
    return this.db().learningPlan.findMany({
      where: { tenantId: auth.activeTenantId, userId: auth.userId },
      select: {
        id: true,
        goal: true,
        weeklyHours: true,
        currentLevel: true,
        targetDate: true,
        focusCompetencies: true,
        intensity: true,
        milestones: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLearningPlan(input: LearningPlanRequest, auth: AuthContext) {
    const prisma = this.db();
    const weeklyHours = input.weeklyHours;
    const intensity = weeklyHours >= 10 ? 'intensivo' : weeklyHours >= 5 ? 'normal' : 'leve';
    const recommendedFocus = input.focusCompetencies.length > 0
      ? input.focusCompetencies
      : excellenceCompetencies.slice(0, 3).map((competency) => competency.id);
    const milestones = [
      {
        week: 1,
        title: 'Diagnóstico e nivelamento',
        tasks: ['realizar diagnóstico inicial', 'revisar fundamentos', 'definir meta semanal'],
      },
      {
        week: 2,
        title: 'Prática guiada',
        tasks: ['executar laboratório prático', 'submeter atividade', 'receber feedback'],
      },
      {
        week: 3,
        title: 'Evidência profissional',
        tasks: ['organizar portfólio', 'simular entrevista', 'corrigir lacunas'],
      },
    ];

    return prisma.$transaction(async (tx) => {
      await tx.learningPlan.updateMany({
        where: { tenantId: auth.activeTenantId, userId: auth.userId, status: 'active' },
        data: { status: 'archived' },
      });
      const plan = await tx.learningPlan.create({
        data: {
          tenantId: auth.activeTenantId,
          userId: auth.userId,
          goal: input.goal,
          weeklyHours,
          currentLevel: input.currentLevel,
          targetDate: input.targetDate ? new Date(input.targetDate) : null,
          focusCompetencies: json(recommendedFocus),
          intensity,
          milestones: json(milestones),
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'excellence.learning_plan.created',
          entity: 'LearningPlan',
          entityId: plan.id,
          metadata: { weeklyHours, intensity },
        },
      });
      return {
        id: plan.id,
        userId: auth.userId,
        tenantId: auth.activeTenantId,
        goal: plan.goal,
        intensity: plan.intensity,
        weeklyHours: plan.weeklyHours,
        milestones: plan.milestones,
        recommendedFocus: plan.focusCompetencies,
        generatedAt: plan.createdAt.toISOString(),
      };
    });
  }

  async createTutorResponse(input: AiTutorRequest, auth: AuthContext) {
    const prisma = this.db();
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dailyUsage = await prisma.aIInteractionLog.count({
      where: { tenantId: auth.activeTenantId, userId: auth.userId, createdAt: { gte: dayStart } },
    });
    const dailyLimit = Number(process.env.AI_DAILY_USER_LIMIT ?? 20);
    if (dailyUsage >= dailyLimit) {
      throw new HttpException('Limite diário de IA atingido', HttpStatus.TOO_MANY_REQUESTS);
    }

    const assessmentWarning = input.allowAssessmentAnswer
      ? 'Atenção: respostas finais de avaliações ativas devem continuar bloqueadas pela política acadêmica.'
      : 'Não vou entregar resposta final de avaliação ativa; vou conduzir por explicação e perguntas.';
    const answer = [
      assessmentWarning,
      'Vamos transformar sua dúvida em aprendizado. Primeiro, identifique o objetivo da tarefa e a evidência esperada.',
      'Depois, compare sua resposta com a rubrica: clareza, aplicação prática, justificativa e próximos passos.',
      'Por fim, escreva uma versão revisada e marque onde você aplicou cada critério.',
    ].join(' ');
    const nextQuestions = [
      'Qual parte do conceito você consegue explicar com suas próprias palavras?',
      'Que evidência prática provaria que você domina isso?',
      'Onde sua resposta ainda está fraca segundo a rubrica?',
    ];
    const redactedPrompt = input.consentToStore
      ? input.prompt.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[EMAIL]').slice(0, 5000)
      : '[NÃO ARMAZENADO SEM CONSENTIMENTO]';

    return prisma.$transaction(async (tx) => {
      const log = await tx.aIInteractionLog.create({
        data: {
          tenantId: auth.activeTenantId,
          userId: auth.userId,
          mode: `pedagogical:${input.mode}`,
          promptHash: crypto.createHash('sha256').update(input.prompt).digest('hex'),
          redactedPrompt,
          response: input.consentToStore ? answer : null,
          consentToStore: input.consentToStore,
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'excellence.ai_tutor.used',
          entity: 'AIInteractionLog',
          entityId: log.id,
          metadata: { mode: input.mode, cycleCode: input.cycleCode ?? null, stored: input.consentToStore },
        },
      });
      return {
        id: log.id,
        userId: auth.userId,
        tenantId: auth.activeTenantId,
        mode: input.mode,
        cycleCode: input.cycleCode ?? null,
        consentToStore: input.consentToStore,
        answer,
        nextQuestions,
        stored: input.consentToStore,
        remainingToday: Math.max(0, dailyLimit - dailyUsage - 1),
        generatedAt: log.createdAt.toISOString(),
      };
    });
  }

  listQualityScores(courseId: string, auth: AuthContext) {
    this.requireQualityAccess(auth);
    return this.db().courseQualityScore.findMany({
      where: { tenantId: auth.activeTenantId, courseId, course: { tenantId: auth.activeTenantId, deletedAt: null } },
      select: {
        id: true,
        courseId: true,
        score: true,
        status: true,
        details: true,
        recommendations: true,
        createdById: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async calculateQualityScore(input: QualityScoreRequest, auth: AuthContext) {
    this.requireQualityAccess(auth);
    const prisma = this.db();
    const course = await prisma.course.findFirst({
      where: { id: input.courseId, tenantId: auth.activeTenantId, deletedAt: null },
      select: { id: true },
    });
    if (!course) throw new NotFoundException('Curso não encontrado neste tenant');

    const weights = {
      pedagogicalAlignment: 0.25,
      assessmentQuality: 0.2,
      accessibility: 0.15,
      learnerExperience: 0.15,
      careerImpact: 0.15,
      contentFreshness: 0.1,
    };

    const score = Math.round(
      input.pedagogicalAlignment * weights.pedagogicalAlignment +
      input.assessmentQuality * weights.assessmentQuality +
      input.accessibility * weights.accessibility +
      input.learnerExperience * weights.learnerExperience +
      input.careerImpact * weights.careerImpact +
      input.contentFreshness * weights.contentFreshness,
    );

    const status = score >= 85 ? 'excelente' : score >= 70 ? 'bom' : score >= 55 ? 'atenção' : 'crítico';
    const recommendations = [
      input.pedagogicalAlignment < 80 ? 'Revisar alinhamento entre objetivos, aulas, atividades e avaliações.' : null,
      input.assessmentQuality < 80 ? 'Reforçar rubricas, questões por competência e avaliação prática.' : null,
      input.accessibility < 80 ? 'Executar auditoria WCAG 2.2 AA nas telas principais.' : null,
      input.careerImpact < 80 ? 'Adicionar evidências de portfólio, simulações e carreira.' : null,
    ].filter((value): value is string => Boolean(value));

    return prisma.$transaction(async (tx) => {
      const qualityScore = await tx.courseQualityScore.create({
        data: {
          tenantId: auth.activeTenantId,
          courseId: course.id,
          score,
          status,
          details: json(input),
          recommendations: json(recommendations),
          createdById: auth.userId,
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'excellence.quality_score.created',
          entity: 'CourseQualityScore',
          entityId: qualityScore.id,
          metadata: { courseId: course.id, score, status },
        },
      });
      return {
        id: qualityScore.id,
        tenantId: auth.activeTenantId,
        courseId: course.id,
        score,
        status,
        recommendations,
        calculatedAt: qualityScore.createdAt.toISOString(),
      };
    });
  }

  listSupportTickets(auth: AuthContext) {
    return this.db().supportTicket.findMany({
      where: { tenantId: auth.activeTenantId, userId: auth.userId },
      select: {
        id: true,
        category: true,
        subject: true,
        description: true,
        severity: true,
        status: true,
        slaDueAt: true,
        resolvedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSupportTicket(input: SupportTicketInput, auth: AuthContext) {
    const prisma = this.db();
    const slaHours = input.severity === 'critical' ? 8 : 24;
    const slaDueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    return prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.create({
        data: {
          tenantId: auth.activeTenantId,
          userId: auth.userId,
          category: input.category,
          subject: input.subject,
          description: input.description,
          severity: input.severity,
          slaDueAt,
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'excellence.support_ticket.created',
          entity: 'SupportTicket',
          entityId: ticket.id,
          metadata: { category: ticket.category, severity: ticket.severity, slaDueAt: ticket.slaDueAt },
        },
      });
      return {
        id: ticket.id,
        tenantId: auth.activeTenantId,
        userId: auth.userId,
        status: ticket.status,
        sla: `${slaHours}h`,
        slaDueAt: ticket.slaDueAt.toISOString(),
        category: ticket.category,
        subject: ticket.subject,
        description: ticket.description,
        severity: ticket.severity,
        createdAt: ticket.createdAt.toISOString(),
      };
    });
  }

  private requireQualityAccess(auth: AuthContext) {
    if (!auth.roles.some((role) => role === 'OWNER' || role === 'ADMIN' || role === 'INSTRUCTOR')) {
      throw new ForbiddenException('Apenas gestão acadêmica pode registrar score de qualidade');
    }
  }
}
