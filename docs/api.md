# API

Endpoints implementados:

- `POST /auth/login`: autenticação demonstrativa com cookie HTTP-only.
- `GET /lms/course`: curso completo.
- `GET /lms/cycles/:cycleCode`: ciclo específico.
- `POST /lms/quizzes/start`: sorteio server-side com bloqueio de progressão.
- `POST /lms/progress/events`: valida e persiste eventos de progresso em `ProgressEvent` quando `DATABASE_URL` está configurado.
- `POST /certificates/issue`: emissão condicionada às regras, com persistência em `Certificate` quando `DATABASE_URL`, `tenantId` e `userId` estão disponíveis.
- `GET /certificates/verify/:code`: validação pública com consulta ao banco e registro em `CertificateVerification` quando o banco está configurado.
- `POST /ai-lab/run`: laboratório IA simulado ou adapter real configurado.
- `GET /automations/templates`: biblioteca de automações.
- `POST /automations/simulate`: validação e simulação.
- `GET /admin/overview`: visão administrativa.

## Excelência

Leituras públicas:

- `GET /excellence/items`
- `GET /excellence/items/:slugOrNumber`
- `GET /excellence/roadmap`
- `GET /excellence/competencies`
- `GET /excellence/pillars`

Fluxos autenticados e persistentes:

- `POST /excellence/learning-plan`
- `GET /excellence/learning-plans`
- `POST /excellence/ai-tutor`
- `POST /excellence/support-ticket`
- `GET /excellence/support-tickets`
- `POST /excellence/quality-score` para `OWNER`, `ADMIN` ou `INSTRUCTOR`
- `GET /excellence/quality-scores/:courseId` para `OWNER`, `ADMIN` ou `INSTRUCTOR`

Todos os fluxos autenticados derivam `tenantId` e `userId` da sessão no servidor.
