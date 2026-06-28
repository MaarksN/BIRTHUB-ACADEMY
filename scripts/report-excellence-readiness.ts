import { excellenceItems, excellencePillars } from '../packages/content/src/excellence/index.js';

const grouped = excellenceItems.reduce<Record<string, number>>((acc, item) => {
  acc[item.priority] = (acc[item.priority] ?? 0) + 1;
  return acc;
}, {});

console.log('# Readiness — Birthub Academy Excellence');
console.log('');
console.log(`Total de itens: ${excellenceItems.length}`);
console.log(`P0: ${grouped.P0 ?? 0}`);
console.log(`P1: ${grouped.P1 ?? 0}`);
console.log(`P1.5: ${grouped['P1.5'] ?? 0}`);
console.log(`P2: ${grouped.P2 ?? 0}`);
console.log(`P3: ${grouped.P3 ?? 0}`);
console.log('');
console.log('Pilares:');
for (const pillar of excellencePillars) {
  console.log(`- ${pillar.title}: itens ${pillar.items.join(', ')}`);
}
