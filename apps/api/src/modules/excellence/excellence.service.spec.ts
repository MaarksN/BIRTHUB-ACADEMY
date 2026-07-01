import { describe, expect, it, vi } from 'vitest';
import { RoleCode } from '@prisma/client';
import type { AuthContext } from '../auth/auth.types';
import type { PrismaService } from '../common/prisma.service';
import { ExcellenceService } from './excellence.service';

const auth: AuthContext = {
  sessionId: 'session_test',
  userId: 'user_test',
  name: 'Aluno Teste',
  email: 'aluno@inside.local',
  activeTenantId: 'default',
  roles: [RoleCode.STUDENT],
  memberships: [{ tenantId: 'default', role: RoleCode.STUDENT, permissions: [] }],
};

const adminAuth: AuthContext = {
  ...auth,
  roles: [RoleCode.ADMIN],
  memberships: [{ tenantId: 'default', role: RoleCode.ADMIN, permissions: ['course:manage'] }],
};

describe('ExcellenceService', () => {
  const catalogService = new ExcellenceService();

  it('lista os 35 itens de evolução da plataforma, do item 1 ao 35', () => {
    const result = catalogService.listItems();
    expect(result.total).toBe(35);
    expect(result.items[0]?.number).toBe('1');
    expect(result.items.at(-1)?.number).toBe('35');
  });

  it('gera roadmap por prioridade', () => {
    const result = catalogService.getRoadmap();
    expect(result.phases).toHaveLength(5);
    expect(result.phases[0]?.priority).toBe('P0');
  });

  it('persiste plano de aprendizagem no tenant do aluno e registra auditoria', async () => {
    const tx = {
      learningPlan: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn().mockResolvedValue({
          id: 'plan-1',
          goal: 'Virar SDR pronto para entrevista',
          weeklyHours: 6,
          intensity: 'normal',
          milestones: [{ week: 1 }],
          focusCompetencies: ['sales-foundation'],
          createdAt: new Date('2026-06-28T00:00:00.000Z'),
        }),
      },
      auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-1' }) },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    } as unknown as PrismaService;
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

    expect(result.tenantId).toBe('default');
    expect(Array.isArray(result.milestones)).toBe(true);
    expect(tx.learningPlan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: 'default', userId: 'user_test' }),
    });
    expect(tx.auditLog.create).toHaveBeenCalled();
  });

  it('persiste score de qualidade somente para gestão acadêmica', async () => {
    const tx = {
      courseQualityScore: {
        create: vi.fn().mockResolvedValue({
          id: 'quality-1',
          createdAt: new Date('2026-06-28T00:00:00.000Z'),
        }),
      },
      auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-2' }) },
    };
    const prisma = {
      course: { findFirst: vi.fn().mockResolvedValue({ id: 'inside-sales-ia' }) },
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    } as unknown as PrismaService;
    const service = new ExcellenceService(prisma);
    const input = {
      courseId: 'inside-sales-ia',
      pedagogicalAlignment: 90,
      assessmentQuality: 80,
      accessibility: 70,
      learnerExperience: 85,
      careerImpact: 75,
      contentFreshness: 90,
    };

    await expect(service.calculateQualityScore(input, auth)).rejects.toThrow(
      'Apenas gestão acadêmica pode registrar score de qualidade',
    );
    const result = await service.calculateQualityScore(input, adminAuth);

    expect(result.score).toBeGreaterThan(70);
    expect(result.status).toBeTypeOf('string');
    expect(tx.courseQualityScore.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: 'default', createdById: 'user_test' }),
    });
  });

  it('persiste ticket visível apenas no tenant e usuário autenticados', async () => {
    const tx = {
      supportTicket: {
        create: vi.fn().mockImplementation(({ data }) => ({
          id: 'ticket-1',
          ...data,
          status: 'OPEN',
          createdAt: new Date('2026-06-28T00:00:00.000Z'),
        })),
      },
      auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-3' }) },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    } as unknown as PrismaService;
    const service = new ExcellenceService(prisma);

    const result = await service.createSupportTicket(
      {
        category: 'course',
        subject: 'Dúvida sobre atividade',
        description: 'Preciso de ajuda para entender a rubrica desta atividade.',
        severity: 'normal',
      },
      auth,
    );

    expect(result).toMatchObject({ id: 'ticket-1', tenantId: 'default', userId: 'user_test', status: 'OPEN' });
    expect(tx.supportTicket.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: 'default', userId: 'user_test' }),
    });
  });
});
