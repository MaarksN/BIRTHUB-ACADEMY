import manifest from '../data/normalized/source-manifest.json' assert { type: 'json' };

console.log(`Fontes inventariadas: ${manifest.length}`);
for (const source of manifest) {
  console.log(`${source.priority} | ${source.condition} | ${source.name}`);
}
