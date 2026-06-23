import { flattenCycles, normalizeForDuplicateCheck, questionData } from '@inside/content';

const errors: string[] = [];
const cycles = flattenCycles();
if (questionData.length < 740) errors.push(`Esperado mínimo de 740 questões, encontrado ${questionData.length}`);
const ids = new Set<string>();
const normalized = new Set<string>();

for (const cycle of cycles) {
  const bank = questionData.filter((question) => question.cycleCode === cycle.code);
  if (bank.length < 20) errors.push(`Ciclo ${cycle.code} tem ${bank.length} questões`);
  for (const difficulty of ['easy', 'medium', 'advanced'] as const) {
    const count = bank.filter((question) => question.difficulty === difficulty).length;
    const minimum = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 2;
    if (count < minimum) errors.push(`Ciclo ${cycle.code} não tem questões ${difficulty} suficientes`);
  }
}

for (const question of questionData) {
  if (ids.has(question.id)) errors.push(`ID duplicado: ${question.id}`);
  ids.add(question.id);
  const key = normalizeForDuplicateCheck(`${question.cycleCode} ${question.prompt}`);
  if (normalized.has(key)) errors.push(`Questão duplicada normalizada: ${question.id}`);
  normalized.add(key);
  if (!['easy', 'medium', 'advanced'].includes(question.difficulty)) errors.push(`Dificuldade inválida em ${question.id}`);
  if (question.options.length < 2) errors.push(`Questão sem alternativas suficientes: ${question.id}`);
  if (!question.options.some((option) => option.id === question.correctOptionId)) errors.push(`Resposta correta inválida: ${question.id}`);
  if (!question.explanation || question.explanation.length < 12) errors.push(`Justificativa insuficiente: ${question.id}`);
  if (!question.referenceBlockId) errors.push(`Referência de conteúdo ausente: ${question.id}`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`validate-questions OK: ${questionData.length} questões válidas em ${cycles.length} ciclos.`);
