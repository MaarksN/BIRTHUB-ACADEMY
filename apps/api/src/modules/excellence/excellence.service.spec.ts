import { describe, expect, it } from 'vitest';
import { RoleCode } from '@prisma/client';
import type { AuthContext } from '../auth/auth.types';
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

describe('ExcellenceService', () => {
  const service = new ExcellenceService();

  it('lista os 35 itens de evolução da plataforma, do item 1 ao 35', () => {
    const result = service.listItems();
    expect(result.total).toBe(35);
    expect(result.items[0]?.number).toBe('1');
    expect(result.items.at(-1)?.number).toBe('35');
  });

  it('gera roadmap por prioridade', () => {
    const result = service.getRoadmap();
    expect(result.phases).toHaveLength(5);
    expect(result.phases[0]?.priority).toBe('P0');
  });

  it('gera plano de aprendizagem personalizado', () => {
    const result = service.createLearningPlan({
      goal: 'Virar SDR pronto para entrevista',
      weeklyHours: 6,
      currentLevel: 'beginner',
      focusCompetencies: [],
    }, auth);
    expect(result.tenantId).toBe('default');
    expect(result.milestones.length).toBeGreaterThan(0);
  });

  it('calcula score de qualidade do curso', () => {
    const result = service.calculateQualityScore({
      courseId: 'inside-sales-ia',
      pedagogicalAlignment: 90,
      assessmentQuality: 80,
      accessibility: 70,
      learnerExperience: 85,
      careerImpact: 75,
      contentFreshness: 90,
    }, auth);
    expect(result.score).toBeGreaterThan(70);
    expect(result.status).toBeTypeOf('string');
  });
});
