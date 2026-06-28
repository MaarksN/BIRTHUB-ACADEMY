import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  excellenceCompetencies,
  excellenceItems,
  excellencePillars,
  getExcellenceReadinessScore,
} from '@inside/content';
import { Prisma } from '@prisma/client';
import crypto from 'node:crypto';
import type { AuthContext } from '../auth/auth.types';
import type {
  AiTutorRequest,
  LearningPlanRequest,
  QualityScoreRequest,
  SupportTicketInput,
} from '@inside/schemas';
import { PrismaService } from '../common/prisma.service';

const toJson = (value: unknown) => value as Prisma.InputJsonValue;

interface StoredExcellenceItem {
  id: string;
  tenantId: string;
  number: number;
  slug: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  outcomes: Prisma.JsonValue;
  metrics: Prisma.JsonValue;
  acceptanceCriteria: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredCompetency {
  id: string;
  tenantId: string;
  code: string;
  courseId: string | null;
  title: string;
  description: string;
  level: string;
  evidence: Prisma.JsonValue;
  relatedCycles: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredLearningPlan {
  id: string;
  tenantId: string;
  userId: string;
  goal: string;
  weeklyHours: number;
  currentLevel: string;
  targetDate: Date | null;
  intensity: string;
  focusCompetencies: Prisma.JsonValue;
  milestones: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredTutorInteraction {
  id: string;
  tenantId: string;
  userId: string;
  mode: string;
  cycleCode: string | null;
  redactedPrompt: string;
  answer: string | null;
  nextQuestions: Prisma.JsonValue;
  riskFlags: Prisma.JsonValue;
  consentToStore: boolean;
  provider: string;
  fallbackUsed: boolean;
  createdAt: Date;
}

interface StoredCourseQualityScore {
  id: string;
  tenantId: string;
  courseId: string;
  userId: string;
  score: number;
  status: string;
  details: Prisma.JsonValue;
  recommendations: Prisma.JsonValue;
  createdAt: Date;
}

interface StoredSupportTicket {
  id: string;
  tenantId: string;
  userId: string;
  category: string;
  subject: string;
  description: string;
  severity: string;
  status: string;
  sla: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
}

@Injectable()
export class ExcellenceService {
  private readonly logger = new Logger(ExcellenceService.name);

  constructor(private readonly prisma: PrismaService) {}

  private publicTenantId() {
    return process.env.PUBLIC_EXCELLENCE_TENANT_ID ?? process.env.PUBLIC_TENANT_ID ?? 'default';
  }

  private stringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
  }

  private iso(value: Date | string | null) {
    return value instanceof Date ? value.toISOString() : value;
  }

  private mapItem(item: StoredExcellenceItem) {
    return {
      id: item.id,
      tenantId: item.tenantId,
      number: String(item.number),
      title: item.title,
      slug: item.slug,
      category: item.category,
      priority: item.priority,
      status: item.status,
      outcomes: this.stringArray(item.outcomes),
      metrics: this.stringArray(item.metrics),
      acceptanceCriteria: this.stringArray(item.acceptanceCriteria),
      updatedAt: this.iso(item.updatedAt),
    };
  }

  private mapStaticItem(item: (typeof excellenceItems)[number], tenantId: string) {
    return {
      id: `${tenantId}-excellence-${item.number}`,
      tenantId,
      number: item.number,
      title: item.title,
      slug: item.slug,
      category: item.category,
      priority: item.priority,
      status: item.priority === 'P1.5' ? 'implementation_ready' : 'planned',
      outcomes: [`Excelência operacional para ${item.title}`],
      metrics: ['adoção', 'qualidade', 'segurança', 'impacto no aluno'],
      acceptanceCriteria: [
        'tenant derivado da sessão quando autenticado',
        'auditoria registrada em mutações protegidas',
        'documentação e testes associados',
      ],
      updatedAt: null,
    };
  }

  private mapCompetency(competency: StoredCompetency) {
    return {
      id: competency.code,
      title: competency.title,
      description: competency.description,
      level: competency.level,
      evidence: this.stringArray(competency.evidence),
      relatedCycles: this.stringArray(competency.relatedCycles),
      courseId: competency.courseId,
      updatedAt: this.iso(competency.updatedAt),
    };
  }

  private mapStaticCompetency(competency: (typeof excellenceCompetencies)[number], tenantId: string) {
    return {
      id: competency.id,
      tenantId,
      title: competency.title,
      description: competency.description,
      level: competency.level,
      evidence: competency.evidence,
      relatedCycles: competency.relatedCycles,
      courseId: 'inside-sales-ia-automacao',
      updatedAt: null,
    };
  }

  private shouldUseStaticCatalogFallback(error: unknown) {
    const name = error instanceof Error ? error.constructor.name : '';
    const message = error instanceof Error ? error.message : String(error);
    return error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientRustPanicError ||
      error instanceof Prisma.PrismaClientUnknownRequestError ||
      name.startsWith('PrismaClient') ||
      message.includes('DATABASE_URL');
  }

  private logStaticCatalogFallback(source: string, errorOrReason: unknown) {
    const reason = errorOrReason instanceof Error ? errorOrReason.message : String(errorOrReason);
    this.logger.warn(`${source}_static_catalog_fallback reason=${reason}`);
  }

  private mapLearningPlan(plan: StoredLearningPlan) {
    return {
      id: plan.id,
      tenantId: plan.tenantId,
      userId: plan.userId,
      goal: plan.goal,
      intensity: plan.intensity,
      weeklyHours: plan.weeklyHours,
      currentLevel: plan.currentLevel,
      targetDate: this.iso(plan.targetDate),
      milestones: plan.milestones,
      recommendedFocus: plan.focusCompetencies,
      createdAt: this.iso(plan.createdAt),
      updatedAt: this.iso(plan.updatedAt),
    };
  }

  private mapTutorInteraction(interaction: StoredTutorInteraction) {
    return {
      id: interaction.id,
      tenantId: interaction.tenantId,
      userId: interaction.userId,
      mode: interaction.mode,
      cycleCode: interaction.cycleCode,
      redactedPrompt: interaction.redactedPrompt,
      answer: interaction.answer,
      nextQuestions: interaction.nextQuestions,
      riskFlags: interaction.riskFlags,
      consentToStore: interaction.consentToStore,
      provider: interaction.provider,
      fallbackUsed: interaction.fallbackUsed,
      createdAt: this.iso(interaction.createdAt),
    };
  }

  private mapQualityScore(score: StoredCourseQualityScore) {
    return {
      id: score.id,
      tenantId: score.tenantId,
      courseId: score.courseId,
      userId: score.userId,
      score: score.score,
      status: score.status,
      details: score.details,
      recommendations: score.recommendations,
      createdAt: this.iso(score.createdAt),
    };
  }

  private mapSupportTicket(ticket: StoredSupportTicket) {
    return {
      id: ticket.id,
      tenantId: ticket.tenantId,
      userId: ticket.userId,
      category: ticket.category,
      subject: ticket.subject,
      description: ticket.description,
      severity: ticket.severity,
      status: ticket.status,
      sla: ticket.sla,
      createdAt: this.iso(ticket.createdAt),
      updatedAt: this.iso(ticket.updatedAt),
      closedAt: this.iso(ticket.closedAt),
    };
  }

  private redactPrompt(prompt: string) {
    return prompt
      .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[EMAIL]')
      .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[DOCUMENTO]')
      .replace(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, '[DOCUMENTO]')
      .replace(/(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}/g, '[TELEFONE]')
      .slice(0, 5000);
  }

  private hashPrompt(prompt: string) {
    return crypto.createHash('sha256').update(prompt).digest('hex');
  }

  private tutorRiskFlags(input: AiTutorRequest) {
    return [
      'não inserir dados pessoais desnecessários',
      'validar resposta com material do curso',
      input.allowAssessmentAnswer ? 'resposta final de avaliação deve ser revisada pela política acadêmica' : 'resposta final de avaliação bloqueada',
    ];
  }

  private tutorNextQuestions(input: AiTutorRequest) {
    const cycleText = input.cycleCode ? ` no ciclo ${input.cycleCode}` : '';
    return [
      `Qual conceito central você precisa dominar${cycleText}?`,
      'Que evidência prática mostraria que você realmente aprendeu?',
      'Qual parte da sua resposta ainda precisa de exemplo, métrica ou justificativa?',
    ];
  }

  private localTutorAnswer(input: AiTutorRequest) {
    const guardrail = input.allowAssessmentAnswer
      ? 'Posso apoiar o raciocínio, mas decisões avaliativas continuam exigindo critério humano e rubrica.'
      : 'Não vou entregar resposta final de avaliação ativa; vou orientar por perguntas, exemplos e revisão.';

    return [
      '[MODO LOCAL]',
      guardrail,
      `Modo solicitado: ${input.mode}.`,
      'Comece declarando o objetivo, liste as evidências disponíveis e compare sua resposta com a rubrica do curso.',
      'Depois escreva uma versão curta, revise lacunas e transforme a dúvida em uma próxima ação mensurável.',
    ].join(' ');
  }

  private async callTutorProvider(input: AiTutorRequest) {
    const apiKey = process.env.EXCELLENCE_TUTOR_API_KEY ?? process.env.AI_PROVIDER_API_KEY;
    const url = process.env.EXCELLENCE_TUTOR_URL ?? process.env.AI_PROVIDER_URL;
    if (!apiKey || !url) throw new BadRequestException('Adapter de tutor IA não configurado');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.EXCELLENCE_TUTOR_MODEL ?? process.env.AI_PROVIDER_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'Você é um tutor educacional. Não entregue respostas finais de avaliações; conduza por explicação, perguntas e rubrica.',
          },
          { role: 'user', content: input.prompt },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) throw new BadRequestException('Provedor de tutor IA indisponível');
    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null) throw new BadRequestException('Resposta inválida do tutor IA');
    const record = data as Record<string, unknown>;
    const choices = Array.isArray(record.choices) ? record.choices : [];
    const first = choices[0] as Record<string, unknown> | undefined;
    const message = first?.message as Record<string, unknown> | undefined;
    if (typeof message?.content !== 'string') throw new BadRequestException('Resposta sem conteúdo do tutor IA');
    return message.content;
  }

  async listItems(tenantId = this.publicTenantId()) {
    let items: StoredExcellenceItem[] = [];
    try {
      items = await this.prisma.excellenceItem.findMany({
        where: { tenantId },
        orderBy: { number: 'asc' },
      });
    } catch (error) {
      if (!this.shouldUseStaticCatalogFallback(error)) throw error;
      this.logStaticCatalogFallback('excellence_items', error);
    }
    if (items.length === 0) {
      this.logStaticCatalogFallback('excellence_items', 'empty_catalog');
      const staticItems = excellenceItems.map((item) => this.mapStaticItem(item, tenantId));
      return {
        total: staticItems.length,
        items: staticItems,
      };
    }
    return {
      total: items.length,
      items: items.map((item) => this.mapItem(item)),
    };
  }

  async getItem(slugOrNumber: string, tenantId = this.publicTenantId()) {
    const numeric = /^\d+$/.test(slugOrNumber) ? Number(slugOrNumber) : null;
    try {
      const item = await this.prisma.excellenceItem.findFirst({
        where: {
          tenantId,
          OR: [{ slug: slugOrNumber }, ...(numeric === null ? [] : [{ number: numeric }])],
        },
      });
      if (item) return this.mapItem(item);
      this.logStaticCatalogFallback('excellence_item', 'item_not_persisted');
    } catch (error) {
      if (!this.shouldUseStaticCatalogFallback(error)) throw error;
      this.logStaticCatalogFallback('excellence_item', error);
    }
    const staticItem = excellenceItems.find((item) => item.slug === slugOrNumber || item.number === slugOrNumber);
    if (!staticItem) throw new NotFoundException('Item de excelência não encontrado');
    return this.mapStaticItem(staticItem, tenantId);
  }

  async getRoadmap(tenantId = this.publicTenantId()) {
    const { items } = await this.listItems(tenantId);
    const p15 = items.filter((item) => item.priority === 'P1.5');
    const p2 = items.filter((item) => item.priority === 'P2');
    const p3 = items.filter((item) => item.priority === 'P3');

    return {
      phases: [
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
      readiness: {
        ...getExcellenceReadinessScore([]),
        total: items.length,
        pending: items.length,
      },
    };
  }

  async listCompetencies(tenantId = this.publicTenantId()) {
    let competencies: StoredCompetency[] = [];
    try {
      competencies = await this.prisma.competency.findMany({
        where: { tenantId },
        orderBy: [{ level: 'asc' }, { title: 'asc' }],
      });
    } catch (error) {
      if (!this.shouldUseStaticCatalogFallback(error)) throw error;
      this.logStaticCatalogFallback('competencies', error);
    }
    if (competencies.length === 0) {
      this.logStaticCatalogFallback('competencies', 'empty_catalog');
      const staticCompetencies = excellenceCompetencies.map((competency) => this.mapStaticCompetency(competency, tenantId));
      return {
        total: staticCompetencies.length,
        competencies: staticCompetencies,
      };
    }
    return {
      total: competencies.length,
      competencies: competencies.map((competency) => this.mapCompetency(competency)),
    };
  }

  listPillars() {
    return {
      total: excellencePillars.length,
      pillars: excellencePillars,
    };
  }

  async createLearningPlan(input: LearningPlanRequest, auth: AuthContext) {
    const competencies = await this.prisma.competency.findMany({
      where: { tenantId: auth.activeTenantId },
      orderBy: [{ level: 'asc' }, { title: 'asc' }],
    });
    const validCompetencies = new Set(competencies.map((competency) => competency.code));
    const invalid = input.focusCompetencies.filter((competency) => !validCompetencies.has(competency));
    if (invalid.length > 0) throw new BadRequestException(`Competências inválidas: ${invalid.join(', ')}`);

    const weeklyHours = input.weeklyHours;
    const intensity = weeklyHours >= 10 ? 'intensivo' : weeklyHours >= 5 ? 'normal' : 'leve';
    const recommendedFocus = input.focusCompetencies.length > 0
      ? input.focusCompetencies
      : competencies.slice(0, 3).map((competency) => competency.code);
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

    const plan = await this.prisma.$transaction(async (tx) => {
      const created = await tx.learningPlan.create({
        data: {
          tenantId: auth.activeTenantId,
          userId: auth.userId,
          goal: input.goal,
          weeklyHours,
          currentLevel: input.currentLevel,
          targetDate: input.targetDate ? new Date(input.targetDate) : null,
          intensity,
          focusCompetencies: toJson(recommendedFocus),
          milestones: toJson(milestones),
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'excellence.learning_plan.created',
          entity: 'LearningPlan',
          entityId: created.id,
          metadata: toJson({ weeklyHours, currentLevel: input.currentLevel, focusCompetencies: recommendedFocus }),
        },
      });
      return created;
    });
    this.logger.log(`learning_plan_created tenant=${auth.activeTenantId} user=${auth.userId} id=${plan.id}`);
    return this.mapLearningPlan(plan);
  }

  async listLearningPlans(auth: AuthContext) {
    const plans = await this.prisma.learningPlan.findMany({
      where: { tenantId: auth.activeTenantId, userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return { total: plans.length, plans: plans.map((plan) => this.mapLearningPlan(plan)) };
  }

  async createTutorResponse(input: AiTutorRequest, auth: AuthContext) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dailyUsage = await this.prisma.tutorInteraction.count({
      where: { tenantId: auth.activeTenantId, userId: auth.userId, createdAt: { gte: dayStart } },
    });
    const dailyLimit = Number(process.env.EXCELLENCE_TUTOR_DAILY_LIMIT ?? process.env.AI_DAILY_USER_LIMIT ?? 20);
    if (dailyUsage >= dailyLimit) {
      throw new HttpException('Limite diário de tutor IA atingido', HttpStatus.TOO_MANY_REQUESTS);
    }

    const requestedProvider = process.env.EXCELLENCE_TUTOR_PROVIDER ?? process.env.AI_PROVIDER ?? 'local';
    let provider = requestedProvider === 'provider' ? 'provider' : 'local';
    let fallbackUsed = false;
    let answer: string;
    try {
      answer = provider === 'provider' ? await this.callTutorProvider(input) : this.localTutorAnswer(input);
    } catch (error) {
      provider = 'local';
      fallbackUsed = true;
      answer = this.localTutorAnswer(input);
      this.logger.warn(`tutor_provider_fallback tenant=${auth.activeTenantId} user=${auth.userId} cause=${error instanceof Error ? error.message : 'unknown'}`);
    }

    const nextQuestions = this.tutorNextQuestions(input);
    const riskFlags = this.tutorRiskFlags(input);
    const redactedPrompt = input.consentToStore ? this.redactPrompt(input.prompt) : '[NAO ARMAZENADO SEM CONSENTIMENTO]';

    const interaction = await this.prisma.$transaction(async (tx) => {
      if (input.consentToStore) {
        await tx.consent.create({
          data: {
            tenantId: auth.activeTenantId,
            userId: auth.userId,
            version: 'excellence-ai-v1',
            purpose: 'excellence_tutor_storage',
            accepted: true,
            acceptedAt: new Date(),
          },
        });
      }
      const created = await tx.tutorInteraction.create({
        data: {
          tenantId: auth.activeTenantId,
          userId: auth.userId,
          mode: input.mode,
          cycleCode: input.cycleCode ?? null,
          promptHash: this.hashPrompt(input.prompt),
          redactedPrompt,
          answer: input.consentToStore ? answer : null,
          nextQuestions: toJson(nextQuestions),
          riskFlags: toJson(riskFlags),
          consentToStore: input.consentToStore,
          provider,
          fallbackUsed,
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'excellence.tutor_interaction.created',
          entity: 'TutorInteraction',
          entityId: created.id,
          metadata: toJson({ mode: input.mode, cycleCode: input.cycleCode ?? null, provider, fallbackUsed }),
        },
      });
      return created;
    });

    this.logger.log(`tutor_interaction_created tenant=${auth.activeTenantId} user=${auth.userId} id=${interaction.id}`);
    return {
      ...this.mapTutorInteraction(interaction),
      answer,
      stored: input.consentToStore,
      remainingToday: Math.max(0, dailyLimit - dailyUsage - 1),
    };
  }

  async listTutorHistory(auth: AuthContext) {
    const interactions = await this.prisma.tutorInteraction.findMany({
      where: { tenantId: auth.activeTenantId, userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return { total: interactions.length, interactions: interactions.map((interaction) => this.mapTutorInteraction(interaction)) };
  }

  async calculateQualityScore(input: QualityScoreRequest, auth: AuthContext) {
    const course = await this.prisma.course.findFirst({
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
    const recommendations: string[] = [];
    if (input.pedagogicalAlignment < 80) recommendations.push('Revisar alinhamento entre objetivos, aulas, atividades e avaliações.');
    if (input.assessmentQuality < 80) recommendations.push('Reforçar rubricas, questões por competência e avaliação prática.');
    if (input.accessibility < 80) recommendations.push('Executar auditoria WCAG 2.2 AA nas telas principais.');
    if (input.careerImpact < 80) recommendations.push('Adicionar evidências de portfólio, simulações e carreira.');

    const qualityScore = await this.prisma.$transaction(async (tx) => {
      const created = await tx.courseQualityScore.create({
        data: {
          tenantId: auth.activeTenantId,
          userId: auth.userId,
          courseId: input.courseId,
          score,
          status,
          details: toJson(input),
          recommendations: toJson(recommendations),
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'excellence.quality_score.created',
          entity: 'CourseQualityScore',
          entityId: created.id,
          metadata: toJson({ courseId: input.courseId, score, status }),
        },
      });
      return created;
    });
    this.logger.log(`quality_score_created tenant=${auth.activeTenantId} user=${auth.userId} id=${qualityScore.id}`);
    return this.mapQualityScore(qualityScore);
  }

  async listQualityScores(auth: AuthContext) {
    const scores = await this.prisma.courseQualityScore.findMany({
      where: { tenantId: auth.activeTenantId, userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return { total: scores.length, scores: scores.map((score) => this.mapQualityScore(score)) };
  }

  async createSupportTicket(input: SupportTicketInput, auth: AuthContext) {
    const sla = input.severity === 'critical' ? '8h úteis' : input.severity === 'high' ? '12h úteis' : '24h úteis';
    const ticket = await this.prisma.$transaction(async (tx) => {
      const created = await tx.supportTicket.create({
        data: {
          tenantId: auth.activeTenantId,
          userId: auth.userId,
          category: input.category,
          subject: input.subject,
          description: input.description,
          severity: input.severity,
          status: 'open',
          sla,
        },
      });
      await tx.auditLog.create({
        data: {
          tenantId: auth.activeTenantId,
          actorId: auth.userId,
          action: 'excellence.support_ticket.created',
          entity: 'SupportTicket',
          entityId: created.id,
          metadata: toJson({ category: input.category, severity: input.severity }),
        },
      });
      return created;
    });
    this.logger.log(`support_ticket_created tenant=${auth.activeTenantId} user=${auth.userId} id=${ticket.id}`);
    return this.mapSupportTicket(ticket);
  }

  async listSupportTickets(auth: AuthContext) {
    const tickets = await this.prisma.supportTicket.findMany({
      where: { tenantId: auth.activeTenantId, userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return { total: tickets.length, tickets: tickets.map((ticket) => this.mapSupportTicket(ticket)) };
  }
}
