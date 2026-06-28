import fs from 'node:fs';
import path from 'node:path';

const requiredFiles = [
  'apps/api/src/modules/excellence/excellence.module.ts',
  'apps/api/src/modules/excellence/excellence.controller.ts',
  'apps/api/src/modules/excellence/excellence.service.ts',
  'apps/web/app/excelencia/page.tsx',
  'packages/schemas/src/excellence.ts',
  'packages/content/src/excellence/items.ts',
  'packages/content/src/excellence/competencies.ts',
  'packages/content/src/excellence/pillars.ts',
  'docs/excellence/EXCELLENCE_35_ITEMS_IMPLEMENTATION.md',
  'tests/e2e/excellence.spec.ts',
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.resolve(process.cwd(), file)));

if (missing.length > 0) {
  console.error('Arquivos ausentes do pacote de excelência:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const itemsPath = path.resolve(process.cwd(), 'packages/content/src/excellence/items.ts');
const itemsContent = fs.readFileSync(itemsPath, 'utf8');

for (let item = 1; item <= 35; item += 1) {
  if (!itemsContent.includes(`"number": "${item}"`) && !itemsContent.includes(`number: '${item}'`)) {
    console.error(`Item ${item} não encontrado em ${itemsPath}`);
    process.exit(1);
  }
}

console.log('Pacote de excelência validado: arquivos principais presentes e itens 1-35 encontrados.');
