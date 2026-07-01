# Birthub Academy — Overlay dos 35 Itens de Excelência

Este pacote foi preparado para ser extraído na raiz do repositório local:

```text
documentos/Github/BIRTHUB-ACADEMY
```

## Antes de aplicar

```bash
cd documentos/Github/BIRTHUB-ACADEMY
git status
git add .
git commit -m "backup: antes do overlay excelencia 35" || true
```

## Como aplicar

Extraia este ZIP dentro da raiz do repositório, no mesmo nível de `apps`, `packages`, `docs`, `infra` e `package.json`.

No Linux/macOS/Git Bash:

```bash
cd documentos/Github/BIRTHUB-ACADEMY
unzip /caminho/birthub_academy_excelencia_35_overlay.zip
```

No Windows:

1. Abra o ZIP.
2. Copie todo o conteúdo.
3. Cole dentro de `Documentos/Github/BIRTHUB-ACADEMY`.
4. Confirme a substituição apenas depois de ter backup/commit.

## Arquivos que serão substituídos

```text
apps/api/src/modules/app.module.ts
packages/schemas/src/index.ts
packages/content/src/index.ts
```

Essas substituições ativam o módulo `excellence` na API e exportam os schemas/conteúdos novos.

## O que o pacote adiciona

- API NestJS em `apps/api/src/modules/excellence`.
- Página Next.js em `apps/web/app/excelencia`.
- Schemas Zod em `packages/schemas/src/excellence.ts`.
- Dados/blueprints em `packages/content/src/excellence`.
- Documentação completa em `docs/excellence`.
- Testes E2E em `tests/e2e/excellence.spec.ts`.
- Scripts de validação e readiness em `scripts`.
- SQL opcional para futura persistência em `packages/db/prisma/excellence-models.sql`.

## Depois de aplicar

```bash
pnpm install
pnpm --filter @inside/schemas build
pnpm --filter @inside/content build
pnpm --filter @inside/api typecheck
pnpm --filter @inside/web typecheck
pnpm tsx scripts/validate-excellence-pack.ts
pnpm tsx scripts/report-excellence-readiness.ts
pnpm lint
pnpm test
pnpm build
```

## Importante

Este overlay entrega base de código, contratos, docs, testes e estrutura para os 35 itens. Ele não deve ser tratado como produção pronta sem rodar validações locais, revisar conflitos e conectar persistência completa quando o schema principal estiver estabilizado.
