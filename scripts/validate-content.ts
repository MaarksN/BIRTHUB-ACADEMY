import { courseData, flattenCycles } from '@inside/content';

const errors: string[] = [];
const cycles = flattenCycles();
const activities = cycles.map((cycle) => cycle.activity);
const quizzes = cycles.map((cycle) => cycle.quiz);

if (courseData.modules.length !== 7) errors.push(`Esperado 7 módulos, encontrado ${courseData.modules.length}`);
if (cycles.length !== 37) errors.push(`Esperado 37 ciclos, encontrado ${cycles.length}`);
if (activities.length !== 37) errors.push(`Esperadas 37 atividades, encontrado ${activities.length}`);
if (quizzes.length !== 37) errors.push(`Esperados 37 quizzes, encontrado ${quizzes.length}`);
if (courseData.projects.length !== 2) errors.push(`Esperados 2 projetos, encontrado ${courseData.projects.length}`);
if (!courseData.finalChallenge || courseData.finalChallenge.rubricCriteria.length !== 15) errors.push('Desafio final ou rubrica de 15 critérios ausente');

const expectedCodes = [
  '1.1','1.2','1.3','1.4','1.5','1.6','1.7',
  '2.1','2.2','2.3','2.4','2.5','2.6',
  '3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8',
  '4.1','5.1',
  '6.1','6.2','6.3','6.4','6.5','6.6','6.7',
  '7.1','7.2','7.3','7.4','7.5','7.6','7.7',
];
const actualCodes = cycles.map((cycle) => cycle.code);
if (expectedCodes.join('|') !== actualCodes.join('|')) errors.push('Ordem dos ciclos diverge do mapa obrigatório');

for (const cycle of cycles) {
  const required = [cycle.description, cycle.intro, cycle.summary, cycle.unlockCondition];
  if (!cycle.title || cycle.title.trim().length < 2 || required.some((value) => !value || value.trim().length < 10)) {
    errors.push(`Campos obrigatórios insuficientes no ciclo ${cycle.code}`);
  }
  if (cycle.lessonBlocks.length === 0) errors.push(`Ciclo ${cycle.code} sem blocos de aula`);
  if (cycle.objectives.length === 0) errors.push(`Ciclo ${cycle.code} sem objetivos`);
  if (cycle.activity.rubric.length === 0) errors.push(`Ciclo ${cycle.code} sem rubrica`);
}

const forbidden = /\bTODO\b|[Ll]orem ipsum|[Pp]laceholder/;
const serialized = JSON.stringify(courseData);
if (forbidden.test(serialized)) errors.push('Conteúdo obrigatório contém marcador proibido');

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`validate-content OK: ${courseData.modules.length} módulos, ${cycles.length} ciclos, ${activities.length} atividades, ${quizzes.length} quizzes.`);
