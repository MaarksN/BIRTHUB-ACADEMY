# Guia de Implantação

## Requisitos
- Docker / Docker Compose.
- Node.js 22+.
- PostgreSQL 16+.

## Passos
1. `pnpm install`
2. `docker compose -f infra/docker-compose.yml up -d`
3. `pnpm prisma:migrate`
4. `pnpm seed`
5. `pnpm build`
6. `pnpm start`
