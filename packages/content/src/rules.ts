import { automationTemplateData, courseData, questionData } from './generated/content-data.js';
import type { AutomationTemplate, Cycle, Difficulty, LearnerProgress, Question } from './types.js';

export function flattenCycles(): Cycle[] {
  return courseData.modules.flatMap((module) => module.cycles);
}

export function findCycle(cycleCode: string): Cycle | undefined {
  return flattenCycles().find((cycle) => cycle.code === cycleCode);
}

export function getNextCycleCode(cycleCode: string): string | undefined {
  const cycles = flattenCycles();
  const index = cycles.findIndex((cycle) => cycle.code === cycleCode);
  return index >= 0 ? cycles[index + 1]?.code : undefined;
}

export function isCycleUnlocked(cycleCode: string, progress: LearnerProgress): boolean {
  const cycles = flattenCycles();
  const index = cycles.findIndex((cycle) => cycle.code === cycleCode);
  if (index < 0) return false;
  if (index === 0) return true;
  const previous = cycles[index - 1];
  if (!previous) return false;
  return (
    progress.completedCycles.includes(previous.code) &&
    progress.submittedActivities.includes(previous.activity.id) &&
    progress.passedQuizzes.includes(previous.quiz.id)
  );
}

export function drawQuizQuestions(cycleCode: string, attemptSeed: string): Question[] {
  const mix: Record<Difficulty, number> = { easy: 3, medium: 5, advanced: 2 };
  const bank = questionData.filter((question) => question.cycleCode === cycleCode);
  const selected: Question[] = [];
  for (const difficulty of Object.keys(mix) as Difficulty[]) {
    const questions = deterministicShuffle(
      bank.filter((question) => question.difficulty === difficulty),
      `${attemptSeed}:${cycleCode}:${difficulty}`,
    );
    selected.push(...questions.slice(0, mix[difficulty]));
  }
  return deterministicShuffle(selected, `${attemptSeed}:${cycleCode}:final`);
}

function deterministicShuffle<T>(items: T[], seed: string): T[] {
  return [...items]
    .map((item, index) => ({ item, score: hash(`${seed}:${index}`) }))
    .sort((a, b) => a.score - b.score)
    .map(({ item }) => item);
}

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function buildRecoveryPlan(answeredWrongThemes: string[]): string[] {
  const uniqueThemes = [...new Set(answeredWrongThemes)];
  if (uniqueThemes.length === 0) return ['Reforce o resumo executivo e avance para a atividade prática.'];
  return uniqueThemes.map((theme) => {
    if (theme.includes('segurança')) return 'Revise governança, LGPD, aprovação humana e política dos canais antes de nova tentativa.';
    if (theme.includes('atividade')) return 'Refaça o artefato prático com objetivo, entradas, saídas, riscos e métrica de sucesso.';
    if (theme.includes('risco')) return 'Compare seus erros com a lista de erros comuns do ciclo e escreva uma contramedida.';
    return 'Releia o bloco conceitual associado e explique o conceito com um exemplo próprio.';
  });
}

export function canIssueCertificate(progress: LearnerProgress): { ok: boolean; missing: string[] } {
  const rules = courseData.certificateRules;
  const missing: string[] = [];
  if (progress.completedCycles.length < rules.requiredCyclesCompleted) missing.push('37 ciclos concluídos');
  if (progress.submittedActivities.length < rules.requiredActivitiesSubmitted) missing.push('37 atividades entregues');
  if (progress.passedQuizzes.length < rules.requiredQuizzesPassed) missing.push('37 quizzes aprovados');
  for (const projectId of rules.requiredProjects) {
    if ((progress.projectScores[projectId] ?? 0) < rules.minimumAverage) missing.push(`projeto aprovado: ${projectId}`);
  }
  if ((progress.finalChallengeScore ?? 0) < rules.minimumAverage) missing.push('desafio final aprovado');
  if (progress.averageScore < rules.minimumAverage) missing.push('média geral mínima de 70%');
  return { ok: missing.length === 0, missing };
}

export function validateAutomationFlow(template: AutomationTemplate): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!template.mode.includes('[SIMULACAO]')) issues.push('templates educacionais devem iniciar em modo [SIMULACAO]');
  if (!template.trigger) issues.push('gatilho ausente');
  if (template.conditions.length === 0) issues.push('condições ausentes');
  if (template.actions.length === 0) issues.push('ações ausentes');
  if (template.errorHandling.length === 0) issues.push('tratamento de erro ausente');
  return { valid: issues.length === 0, issues };
}

export function normalizeForDuplicateCheck(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function getAutomationTemplates(): AutomationTemplate[] {
  return automationTemplateData;
}
