import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class ExcellenceService {
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
    const p15 = excellenceItems.filter((item) => item.priority === 'P1.5');
    const p2 = excellenceItems.filter((item) => item.priority === 'P2');
    const p3 = excellenceItems.filter((item) => item.priority === 'P3');

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

  createLearningPlan(input: LearningPlanRequest, auth: AuthContext) {
    const weeklyHours = input.weeklyHours;
    const intensity = weeklyHours >= 10 ? 'intensivo' : weeklyHours >= 5 ? 'normal' : 'leve';
    const recommendedFocus = input.focusCompetencies.length > 0
      ? input.focusCompetencies
      : excellenceCompetencies.slice(0, 3).map((competency) => competency.id);

    return {
      userId: auth.userId,
      tenantId: auth.activeTenantId,
      goal: input.goal,
      intensity,
      weeklyHours,
      milestones: [
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
      ],
      recommendedFocus,
      generatedAt: new Date().toISOString(),
    };
  }

  createTutorResponse(input: AiTutorRequest, auth: AuthContext) {
    const assessmentWarning = input.allowAssessmentAnswer
      ? 'Atenção: respostas finais de avaliações ativas devem continuar bloqueadas pela política acadêmica.'
      : 'Não vou entregar resposta final de avaliação ativa; vou conduzir por explicação e perguntas.';

    return {
      userId: auth.userId,
      tenantId: auth.activeTenantId,
      mode: input.mode,
      cycleCode: input.cycleCode ?? null,
      consentToStore: input.consentToStore,
      answer: [
        assessmentWarning,
        'Vamos transformar sua dúvida em aprendizado. Primeiro, identifique o objetivo da tarefa e a evidência esperada.',
        'Depois, compare sua resposta com a rubrica: clareza, aplicação prática, justificativa e próximos passos.',
        'Por fim, escreva uma versão revisada e marque onde você aplicou cada critério.',
      ].join(' '),
      nextQuestions: [
        'Qual parte do conceito você consegue explicar com suas próprias palavras?',
        'Que evidência prática provaria que você domina isso?',
        'Onde sua resposta ainda está fraca segundo a rubrica?',
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  calculateQualityScore(input: QualityScoreRequest, auth: AuthContext) {
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

    return {
      tenantId: auth.activeTenantId,
      courseId: input.courseId,
      score,
      status,
      recommendations: [
        input.pedagogicalAlignment < 80 ? 'Revisar alinhamento entre objetivos, aulas, atividades e avaliações.' : null,
        input.assessmentQuality < 80 ? 'Reforçar rubricas, questões por competência e avaliação prática.' : null,
        input.accessibility < 80 ? 'Executar auditoria WCAG 2.2 AA nas telas principais.' : null,
        input.careerImpact < 80 ? 'Adicionar evidências de portfólio, simulações e carreira.' : null,
      ].filter(Boolean),
      calculatedAt: new Date().toISOString(),
    };
  }

  createSupportTicket(input: SupportTicketInput, auth: AuthContext) {
    return {
      id: `ticket_${Date.now()}`,
      tenantId: auth.activeTenantId,
      userId: auth.userId,
      status: 'open',
      sla: input.severity === 'critical' ? '8h úteis' : '24h úteis',
      ...input,
      createdAt: new Date().toISOString(),
    };
  }
}
