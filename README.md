# Birthub Academy com IA e Automação Comercial

Plataforma educacional full-stack em monorepo `pnpm`, com frontend Next.js, backend NestJS, Prisma/PostgreSQL, Redis/BullMQ, dados normalizados do curso, validadores de conteúdo e documentação.

## Como rodar localmente

1. Instale dependências:
   ```bash
   pnpm install
   ```
2. Suba infraestrutura local:
   ```bash
   docker compose -f infra/docker-compose.yml up -d
   ```
3. Valide o schema e gere cliente Prisma:
   ```bash
   pnpm prisma:validate
   pnpm --filter @inside/db prisma:generate
   ```
4. Execute validadores:
   ```bash
   pnpm validate
   ```
5. Rode API e web:
   ```bash
   pnpm dev
   ```

Credenciais demonstrativas locais:

- `admin@inside.local`
- senha `InsideSales#2026`
- tenant `default`

## Estrutura

- `apps/web`: portal do aluno, painel admin, laboratório IA, construtor de automações e validação de certificado.
- `apps/api`: API REST NestJS com auth, LMS, quiz, certificado, IA simulada e automações.
- `apps/worker`: worker BullMQ para jobs educacionais.
- `packages/content`: curso normalizado, 37 ciclos, 740 questões e regras de progressão.
- `packages/db`: Prisma schema, seed e migrações iniciais.
- `docs`: auditoria de fontes, arquitetura, LGPD, testes e implantação.
