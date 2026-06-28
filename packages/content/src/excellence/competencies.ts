import type { Competency } from './types.js';

export const excellenceCompetencies: Competency[] = [
  {
    id: 'sales-foundation',
    title: 'Fundamentos de Inside Sales',
    description: 'Domínio dos conceitos, vocabulário, processo e métricas de vendas consultivas.',
    level: 'foundation',
    evidence: ['quiz aprovado', 'glossário aplicado', 'diagnóstico de funil simples'],
    relatedCycles: ['1.1', '1.2', '1.3'],
  },
  {
    id: 'prospecting-execution',
    title: 'Execução de Prospecção',
    description: 'Capacidade de criar listas, segmentar contas, construir abordagens e executar cadências.',
    level: 'intermediate',
    evidence: ['lista ICP', 'cadência multicanal', 'copy revisada'],
    relatedCycles: ['2.1', '2.2', '3.1'],
  },
  {
    id: 'qualification-diagnosis',
    title: 'Qualificação e Diagnóstico',
    description: 'Capacidade de identificar dor, urgência, orçamento, autoridade e próximos passos.',
    level: 'intermediate',
    evidence: ['roteiro de discovery', 'score de lead', 'resumo de oportunidade'],
    relatedCycles: ['3.2', '4.1', '4.2'],
  },
  {
    id: 'handoff-pipeline',
    title: 'Pipeline e Passagem de Bastão',
    description: 'Capacidade de organizar informação comercial e passar oportunidades com qualidade.',
    level: 'advanced',
    evidence: ['handoff completo', 'CRM atualizado', 'plano de follow-up'],
    relatedCycles: ['4.3', '4.4'],
  },
  {
    id: 'ai-automation-sales',
    title: 'IA e Automação Aplicada a Vendas',
    description: 'Uso responsável de IA, prompts, automações e simulações para aumentar produtividade.',
    level: 'advanced',
    evidence: ['prompt auditável', 'simulação de automação', 'análise de risco'],
    relatedCycles: ['6.1', '6.2', '7.1'],
  },
  {
    id: 'professional-readiness',
    title: 'Prontidão Profissional',
    description: 'Capacidade de demonstrar habilidades em portfólio, entrevista, projeto e caso prático.',
    level: 'mastery',
    evidence: ['projeto final aprovado', 'portfólio verificável', 'simulação de entrevista'],
    relatedCycles: ['5.1', '7.2'],
  },
];
