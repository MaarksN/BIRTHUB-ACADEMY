# Segurança, privacidade e LGPD

Implementações e contratos:

- senha demonstrativa com hash bcrypt;
- cookie HTTP-only para sessão;
- validação server-side por Zod e ValidationPipe;
- Helmet no backend;
- rate limiting via Throttler;
- tenantId em modelos operacionais;
- consentimento versionado;
- exportação e exclusão de dados como jobs;
- logs de IA com prompt redigido e armazenamento apenas com consentimento;
- sem chave de IA no frontend;
- automações externas bloqueadas por padrão em `[SIMULACAO]`.

Auditoria de dependências:

- `pnpm audit --audit-level low` executado em 2026-06-23 sem vulnerabilidades conhecidas.
- Overrides de segurança mantidos em `pnpm-workspace.yaml` para dependências transitivas com correção publicada.
