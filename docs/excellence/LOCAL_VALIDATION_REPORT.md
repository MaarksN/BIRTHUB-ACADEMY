# Relatório de Validação Local — Overlay Excelência 35

## Ambiente

- Sistema: Microsoft Windows 10.0.26200
- Node: v24.16.0
- pnpm: 11.7.0
- Branch: `codex/excelencia-35-overlay`
- Commit base validado: `1da1814` (o commit final é o commit Git que contém este relatório)
- Data: 2026-06-27T23:00:23-03:00
- Revalidação Docker/E2E: 2026-06-27T23:21-03:00

## ZIP aplicado

- Caminho: `C:\Users\Marks\Downloads\Compressed\birthub_academy_excelencia_35_overlay.zip`
- Arquivos listados: 61
- Manifest lido: sim

## Arquivos aplicados

- `MANIFEST_EXCELENCIA_35.json`
- `README_APLICAR_EXCELENCIA_35.md`
- `PROMPT_VALIDACAO_LOCAL_JULES_CODEX.txt`
- `apps/api/src/modules/excellence/*`
- `apps/web/app/excelencia/page.tsx`
- `packages/schemas/src/excellence.ts`
- `packages/content/src/excellence/*`
- `packages/db/prisma/excellence-models.sql`
- `scripts/validate-excellence-pack.ts`
- `scripts/report-excellence-readiness.ts`
- `tests/e2e/excellence.spec.ts`
- `docs/excellence/*`

## Conflitos encontrados

- Merge controlado em `apps/api/src/modules/app.module.ts` para preservar controllers/providers existentes e adicionar `ExcellenceModule`.
- Merge controlado em `packages/schemas/src/index.ts` para exportar schemas de excelência sem remover exports existentes.
- Merge controlado em `packages/content/src/index.ts` para exportar o pacote de excelência sem remover exports existentes.
- Docker Desktop estava inicialmente parado; o serviço foi iniciado localmente e a stack foi recriada na branch correta do overlay.

## Correções realizadas

- Corrigido mock de `AuthContext` no teste do serviço para não usar arrays readonly.
- Corrigido agrupamento da página `/excelencia` para evitar acesso possivelmente indefinido por prioridade.
- Adicionado fallback read-only dos GETs públicos de catálogo para `@inside/content` quando Prisma/DATABASE_URL não estiver disponível.
- Mantida a exigência de sessão real e tenant derivado do `AuthContext` nos endpoints POST protegidos.
- Ajustado seletor E2E da página para evitar strict-mode violation por texto duplicado.
- Ajustado E2E de logout para aceitar `/login?next=%2F`, comportamento real do guard após sair da rota protegida.
- Validados modelos Prisma, seed idempotente, auditoria, tutor local/redaction/consentimento e documentação de produção já presentes no worktree.

## Comandos executados

| Comando | Resultado | Observação |
|---|---|---|
| `pnpm tsx scripts/validate-excellence-pack.ts` | Aprovado | Arquivos principais presentes e itens 11-35 encontrados. |
| `pnpm --filter @inside/schemas build` | Aprovado | Schemas compilados. |
| `pnpm --filter @inside/content build` | Aprovado | Content compilado. |
| `pnpm --filter @inside/api typecheck` | Aprovado | API compila. |
| `pnpm --filter @inside/api test` | Aprovado | 3 arquivos, 11 testes passaram. |
| `pnpm --filter @inside/web typecheck` | Aprovado | Página `/excelencia` compila. |
| `pnpm --filter @inside/web test` | Aprovado | 1 teste passou. |
| `pnpm validate` | Aprovado | Conteúdo, questões e links OK. |
| `pnpm lint` | Aprovado | ESLint sem warnings. |
| `pnpm typecheck` | Aprovado | Primeira tentativa falhou por `EPERM` em DLL do Prisma presa por processo Playwright/Nest órfão; após limpeza passou. |
| `pnpm test` | Aprovado | Workspace com 17 testes passando. |
| `pnpm build` | Aprovado | Build completo OK; Next gerou `/excelencia`. Aviso não bloqueante sobre plugin ESLint do Next. |
| `docker compose -f infra/docker-compose.yml up -d` | Aprovado após iniciar Docker Desktop | Primeira tentativa falhou com daemon parado; depois subiu Postgres, Redis, MinIO, API, Web e Worker. |
| `docker compose -f infra/docker-compose.yml up -d --build --force-recreate` | Aprovado | Rebuild na branch `codex/excelencia-35-overlay`; imagem incluiu `/excelencia` e migration `202606270002_excellence_production_hardening`. |
| Migration/seed via serviço `migrate` | Aprovado | 3 migrations encontradas; `202606270002_excellence_production_hardening` aplicada; seed pronto com 3 usuários, 7 módulos e 740 questões. |
| `GET http://localhost:3333/ready` | Aprovado | `database: up` e `excellenceCatalogItems: 25`. |
| `pnpm e2e` | Aprovado | 8 testes E2E passaram, incluindo login/logout, tenancy e fluxos autenticados de excelência. |

## Endpoints validados

- `GET /excellence/items`: aprovado via E2E público.
- `GET /excellence/roadmap`: aprovado via API e indiretamente pela página `/excelencia`, que carrega via `Promise.all`.
- `GET /excellence/competencies`: aprovado indiretamente pela página `/excelencia`.
- `GET /excellence/pillars`: aprovado indiretamente pela página `/excelencia`.
- `POST /excellence/learning-plan`: protegido; sem sessão retornou 401 no E2E.
- `POST /excellence/learning-plan`: aprovado com sessão; tenant e usuário derivados da sessão.
- `POST /excellence/ai-tutor`: aprovado com sessão; tutor local respondeu e histórico persistiu.
- `POST /excellence/quality-score`: aprovado com sessão; tenant isolado não pontua curso do tenant `default`.
- `POST /excellence/support-ticket`: aprovado com sessão; ticket criado com status `open`.

## Resultado dos testes

- Unit/workspace: aprovado, 17 testes passaram.
- Typecheck: aprovado no monorepo.
- Lint: aprovado no monorepo.
- Build: aprovado no monorepo.
- E2E público: página `/excelencia`, `GET /excellence/items` e POST protegido sem sessão passaram.
- E2E autenticado: aprovado, 8/8 testes passaram contra Docker/Postgres/Redis locais.

## Pendências

- Opcional: ajustar script/comando documentado para seleção de arquivo E2E, pois `pnpm e2e -- tests/e2e/excellence.spec.ts` repassa `--` literal ao Playwright; `pnpm e2e` completo passou.
- Opcional: instalar OpenSSL na imagem Docker ou trocar a base para remover o warning do Prisma sobre detecção de libssl.

## Riscos

- GETs públicos usam fallback read-only do catálogo versionado quando o banco está indisponível; mutações seguem exigindo sessão e banco.
- Prisma em Docker emite warning de OpenSSL/libssl, mas migrations, seed, API e E2E passaram.

## Próximos passos

- Revisar a ergonomia do script `e2e` para aceitar arquivo específico sem coletar specs extras.
- Melhorar imagem Docker para instalar OpenSSL explicitamente.

## Status final

APROVADO
