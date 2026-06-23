# Build status

Atualizado em: 2026-06-23T12:29:00-03:00

| Etapa | Status | Evidência |
| --- | --- | --- |
| 0 - Inventário | concluída | `docs/source-manifest.md` e `data/normalized/source-manifest.json` |
| 1 - Produto, arquitetura e schemas | concluída | `docs/`, `packages/schemas`, `packages/db/prisma/schema.prisma` |
| 2 - Base técnica | concluída | monorepo, Next.js, NestJS, worker, Docker Compose, CI e migration SQL inicial |
| 3 - Importação e normalização | concluída | `packages/content/src/generated/content-data.ts`, 740 questões |
| 4 - LMS core | concluída | portal do aluno, regras de progressão, quizzes, atividades, progresso persistente e certificado persistente quando há banco |
| 5 - Módulos avançados | concluída | laboratório IA simulado, biblioteca de prompts, construtor de automações e 20 templates |
| 6 - Administração | concluída | painel admin e endpoint `GET /admin/overview` |
| 7 - Escala, segurança e deploy | concluída | Docker, Redis/BullMQ, MinIO, docs de segurança, overrides de dependências e auditoria sem vulnerabilidades conhecidas |
| 8 - Testes e empacotamento | concluída | `pnpm validate`, `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm prisma:validate`, `pnpm build`, `pnpm audit --audit-level low` |

Resultados finais executados em 2026-06-23:

- `pnpm validate`: OK, 7 módulos, 37 ciclos, 37 atividades, 37 quizzes, 740 questões.
- `pnpm typecheck`: OK em 8 pacotes do workspace.
- `pnpm test`: OK, 9 testes passando.
- `pnpm lint`: OK, zero warnings.
- `pnpm prisma:validate`: OK, schema válido.
- `pnpm build`: OK, API NestJS, worker, pacotes e web Next.js compilados.
- `pnpm audit --audit-level low`: OK, nenhuma vulnerabilidade conhecida.

Aviso não bloqueante:

- O build do Next informa que o plugin Next não foi detectado no ESLint flat config. O projeto usa `eslint.config.mjs` próprio, e `pnpm lint` passa com `--max-warnings=0`.
