import type { ExcellencePillar } from './types.js';

export const excellencePillars: ExcellencePillar[] = [
  {
    id: 'learning-outcomes',
    title: 'Resultado pedagógico mensurável',
    purpose: 'Garantir que cada aula, quiz, atividade e certificado esteja ligado a competências reais.',
    items: ['11', '12', '14', '34', '35'],
    successMetrics: ['domínio por competência', 'aprovação por rubrica', 'redução de lacunas'],
  },
  {
    id: 'premium-experience',
    title: 'Experiência premium e acessível',
    purpose: 'Elevar retenção, clareza, autonomia e satisfação do aluno.',
    items: ['15', '21', '22', '23'],
    successMetrics: ['NPS', 'tempo até ativação', 'uso mobile', 'conformidade WCAG'],
  },
  {
    id: 'human-ai-support',
    title: 'IA pedagógica com acompanhamento humano',
    purpose: 'Combinar tutor de IA, mentoria, comunidade e suporte para reduzir evasão.',
    items: ['13', '16', '17', '29'],
    successMetrics: ['tempo de resposta', 'intervenções de mentor', 'dúvidas resolvidas'],
  },
  {
    id: 'career-credentials',
    title: 'Empregabilidade e credenciais verificáveis',
    purpose: 'Transformar conclusão em prova pública de habilidade e avanço profissional.',
    items: ['18', '19', '20'],
    successMetrics: ['portfólios publicados', 'badges emitidos', 'entrevistas simuladas'],
  },
  {
    id: 'scale-governance',
    title: 'Escala, governança e operação',
    purpose: 'Preparar a escola para B2B, internacionalização, qualidade, analytics e growth.',
    items: ['24', '25', '26', '27', '28', '30', '31', '32', '33'],
    successMetrics: ['qualidade de conteúdo', 'tenants ativos', 'conversão', 'risco reduzido'],
  },
];
