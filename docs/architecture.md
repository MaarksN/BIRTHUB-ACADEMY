# Arquitetura

- `apps/web`: Next.js App Router, páginas responsivas e acessíveis.
- `apps/api`: NestJS REST com OpenAPI em `/docs`.
- `apps/worker`: BullMQ para jobs de certificado, exportação e importação.
- `packages/db`: Prisma/PostgreSQL.
- `packages/content`: fonte normalizada e regras puras de progressão, quiz e certificado.
- `Redis`: filas e cache.
- `S3 compatível`: anexos, certificados, exports e materiais.

O frontend nunca recebe chaves de IA. Provedores reais devem passar por adapter server-side, variáveis de ambiente, rate limit, logs redigidos e consentimento.
