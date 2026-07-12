# Relatório de testes

Planejado e implementado:

- validadores de conteúdo, questões e referências;
- testes unitários de progressão, quiz, certificado e automações em `packages/content`;
- teste de serviço LMS para bloqueio por URL em `apps/api`;
- contrato básico de acessibilidade em `apps/web`.

Execução final em 2026-06-23:

- `pnpm validate`: aprovado.
- `pnpm typecheck`: aprovado.
- `pnpm test`: testes unitários/contratuais aprovados, incluindo regras de certificado, progressão e endpoint LMS.
- `pnpm lint`: aprovado sem warnings.
- `pnpm prisma:validate`: schema válido.
- `pnpm build`: aprovado.
- `pnpm audit --audit-level low`: nenhuma vulnerabilidade conhecida.

Limitações de teste:

- Testes e2e Playwright reais não foram executados; a estrutura está preparada para inclusão, mas a bateria final validou rotas por build estático do Next e testes unitários/contratuais.
- Migrações contra um PostgreSQL em execução não foram aplicadas nesta rodada; o SQL inicial foi gerado e o schema foi validado. O Docker Compose está pronto para aplicação local.
