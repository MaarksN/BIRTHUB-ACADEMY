import { describe, expect, it, vi } from 'vitest';
import { excellenceCompetencies, excellenceItems } from '@inside/content';
import type { PrismaService } from '../common/prisma.service';
import type { AuthContext } from '../auth/auth.types';
import { ExcellenceService } from './excellence.service';

const auth: AuthContext = {
  sessionId: 'session_test',
  userId: 'user_test',
  name: 'Aluno Teste',
  email: 'aluno@inside.local',
  activeTenantId: 'tenant-a',
  roles: ['STUDENT'],
  memberships: [{ tenantId: 'tenant-a', role: 'STUDENT', permissions: [] }],
};

const now = new Date('2026-06-27T12:00:00.000Z');

const storedItems = excellenceItems.map((item) => ({
  id: `tenant-a-excellence-${item.number}`,
  tenantId: 'tenant-a',
  number: Number(item.number),
  slug: item.slug,
  title: item.title,
  category: item.category,
  priority: item.priority,
  status: item.priority === 'P1.5' ? 'implementation_ready' : 'planned',
  outcomes: [],
  metrics: [],
  acceptanceCriteria: [],
  createdAt: now,
  updatedAt: now,
}));

const storedCompetencies = excellenceCompetencies.map((competency) => ({
  id: `tenant-a-competency-${competency.id}`,
  tenantId: 'tenant-a',
  code: competency.id,
  courseId: 'inside-sales-ia-automacao',
  title: competency.title,
  description: competency.description,
  level: competency.level,
  evidence: competency.evidence,
  relatedCycles: competency.relatedCycles,
  createdAt: now,
  updatedAt: now,
}));

function createPrismaMock() {
  const tx = {
    learningPlan: {
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'plan-1', createdAt: now, updatedAt: now, ...data })),
    },
    tutorInteraction: {
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'tutor-1', createdAt: now, ...data })),
    },
    courseQualityScore: {
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'score-1', createdAt: now, ...data })),
    },
    supportTicket: {
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'ticket-1', createdAt: now, updatedAt: now, closedAt: null, ...data })),
    },
    consent: { create: vi.fn().mockResolvedValue({ id: 'consent-1' }) },
    auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-1' }) },
  };
  const prisma = {
    excellenceItem: {
      findMany: vi.fn().mockResolvedValue(storedItems),
      findFirst: vi.fn().mockImplementation(({ where }) => {
        const target = storedItems.find((item) => item.slug === where.OR[0]?.slug || item.number === where.OR[1]?.number);
        return Promise.resolve(target ?? null);
      }),
    },
    competency: {
      findMany: vi.fn().mockResolvedValue(storedCompetencies),
    },
    learningPlan: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    tutorInteraction: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    course: {
      findFirst: vi.fn().mockResolvedValue({ id: 'inside-sales-ia-automacao' }),
    },
    courseQualityScore: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    supportTicket: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    $transaction: vi.fn().mockImplementation((callback) => callback(tx)),
  };
  return { prisma: prisma as unknown as PrismaService, tx, raw: prisma };
}

describe('ExcellenceService', () => {
  it('lista os 25 itens complementares persistidos, do item 11 ao 35', async () => {
    const { prisma } = createPrismaMock();
    const service = new ExcellenceService(prisma);
    const result = await service.listItems('tenant-a');
    expect(result.total).toBe(25);
    expect(result.items[0]?.number).toBe('11');
    expect(result.items.at(-1)?.number).toBe('35');
  });

  it('gera roadmap por prioridade usando os itens do tenant público', async () => {
    const { prisma } = createPrismaMock();
    const service = new ExcellenceService(prisma);
    const result = await service.getRoadmap('tenant-a');
    expect(result.phases).toHaveLength(3);
    expect(result.phases[0]?.priority).toBe('P1.5');
    expect(result.phases[0]?.items.some((item) => item.number === '11')).toBe(true);
    expect(result.phases[0]?.items.some((item) => item.number === '35')).toBe(true);
  });

  it('cria plano de aprendizagem com tenant e usuário derivados da sessão', async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new ExcellenceService(prisma);
    const result = await service.createLearningPlan(
      {
        goal: 'Virar SDR pronto para entrevista',
        weeklyHours: 6,
        currentLevel: 'beginner',
        focusCompetencies: [],
      },
      auth,
    );
    expect(result.tenantId).toBe('tenant-a');
    expect(result.userId).toBe('user_test');
    expect(tx.learningPlan.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ tenantId: 'tenant-a', userId: 'user_test' }),
    }));
    expect(tx.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ action: 'excellence.learning_plan.created' }),
    }));
  });

  it('redige prompt do tutor, respeita consentimento e persiste auditoria', async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new ExcellenceService(prisma);
    const result = await service.createTutorResponse(
      {
        mode: 'socratic',
        prompt: 'Meu email aluno@example.com precisa de ajuda no item 35 sem dar resposta final.',
        allowAssessmentAnswer: false,
        consentToStore: true,
      },
      auth,
    );
    expect(result.tenantId).toBe('tenant-a');
    expect(result.answer).toContain('[MODO LOCAL]');
    expect(tx.tutorInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        tenantId: 'tenant-a',
        userId: 'user_test',
        redactedPrompt: expect.stringContaining('[EMAIL]'),
        consentToStore: true,
      }),
    }));
    expect(tx.consent.create).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ action: 'excellence.tutor_interaction.created' }),
    }));
  });

  it('calcula e persiste score de qualidade somente no tenant ativo', async () => {
    const { prisma, raw, tx } = createPrismaMock();
    const service = new ExcellenceService(prisma);
    const result = await service.calculateQualityScore(
      {
        courseId: 'inside-sales-ia-automacao',
        pedagogicalAlignment: 90,
        assessmentQuality: 80,
        accessibility: 70,
        learnerExperience: 85,
        careerImpact: 75,
        contentFreshness: 90,
      },
      auth,
    );
    expect(result.score).toBeGreaterThan(70);
    expect(result.status).toBeTypeOf('string');
    expect(raw.course.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ tenantId: 'tenant-a' }),
    }));
    expect(tx.courseQualityScore.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ tenantId: 'tenant-a', userId: 'user_test' }),
    }));
  });

  it('cria ticket de suporte com SLA e trilha de auditoria', async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new ExcellenceService(prisma);
    const result = await service.createSupportTicket(
      {
        category: 'technical',
        subject: 'Erro ao abrir laboratório',
        description: 'O laboratório prático do item 35 não carregou no navegador.',
        severity: 'critical',
      },
      auth,
    );
    expect(result.sla).toBe('8h úteis');
    expect(tx.supportTicket.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ tenantId: 'tenant-a', userId: 'user_test', status: 'open' }),
    }));
    expect(tx.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ action: 'excellence.support_ticket.created' }),
    }));
  });
});
