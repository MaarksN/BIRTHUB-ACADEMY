import { writeFileSync, mkdirSync } from 'node:fs';
import { automationTemplateData, courseData, promptTemplateData, questionData } from '@inside/content';

mkdirSync('data/imports', { recursive: true });
writeFileSync('data/imports/seed-payload.json', JSON.stringify({ courseData, questionData, automationTemplateData, promptTemplateData }, null, 2));
console.log('Payload de seed gerado em data/imports/seed-payload.json');
