export * from './types.js';
export { excellenceItems } from './items.js';
export { excellenceCompetencies } from './competencies.js';
export { excellencePillars } from './pillars.js';

import { excellenceItems } from './items.js';

export function getExcellenceItem(slugOrNumber: string) {
  const normalizedNumber = String(Number(slugOrNumber));
  return (
    excellenceItems.find(
      (item) => item.slug === slugOrNumber || item.number === slugOrNumber || item.number === normalizedNumber,
    ) ?? null
  );
}

export function getExcellenceReadinessScore(completedSlugs: string[]) {
  const completed = new Set(completedSlugs);
  const total = excellenceItems.length;
  const completedCount = excellenceItems.filter((item) => completed.has(item.slug)).length;
  const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  return {
    total,
    completed: completedCount,
    pending: total - completedCount,
    percentage,
  };
}
