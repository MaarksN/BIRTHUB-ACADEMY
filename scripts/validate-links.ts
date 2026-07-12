import { courseData, flattenCycles } from '@inside/content';

const errors: string[] = [];
for (const cycle of flattenCycles()) {
  if (!cycle.references.length) errors.push(`Ciclo ${cycle.code} sem fonte`);
  if (!cycle.activity.id.startsWith('activity-')) errors.push(`Atividade com id inesperado: ${cycle.activity.id}`);
}
if (courseData.projects.some((project) => project.requiredFields.length < 10)) errors.push('Projeto obrigatório com campos insuficientes');
if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('validate-links OK: referências internas e artefatos obrigatórios conferidos.');
