import { writeFileSync, mkdirSync } from 'node:fs';

const spec = {
  openapi: '3.0.3',
  info: { title: 'Inside Sales IA Automação API', version: '0.1.0' },
  paths: {
    '/auth/login': { post: { summary: 'Autentica usuário e cria cookie HTTP-only' } },
    '/lms/course': { get: { summary: 'Retorna curso normalizado' } },
    '/lms/quizzes/start': { post: { summary: 'Sorteia quiz no backend' } },
    '/lms/progress/events': { post: { summary: 'Valida e persiste evento de progresso no backend' } },
    '/certificates/verify/{code}': { get: { summary: 'Valida certificado por código público' } },
    '/ai-lab/run': { post: { summary: 'Executa laboratório IA simulado ou adapter server-side' } },
    '/automations/simulate': { post: { summary: 'Valida e simula automação educacional' } },
  },
};
mkdirSync('data/exports', { recursive: true });
writeFileSync('data/exports/openapi.json', JSON.stringify(spec, null, 2));
console.log('OpenAPI resumido gerado em data/exports/openapi.json');
