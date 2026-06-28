# Rollback Plan — Excellence 35

## Quando executar

- Falha de build/typecheck/lint/test por erro de código.
- Migration não aplicável no banco alvo.
- Regressão de autenticação, multi-tenant ou auditoria.
- E2E crítico falhando por causa de aplicação.

## Passos

1. Parar deploy da branch do Excellence 35.
2. Reverter o commit que introduz `202606270002_excellence_production_hardening`.
3. Se migration foi aplicada, executar rollback de banco via backup/snapshot operacional.
4. Restaurar imagem anterior da API/Web.
5. Confirmar `GET /health`, `GET /ready`, login e fluxos principais.
6. Registrar incidente em `AuditLog`/runbook operacional externo.

## Dados

As tabelas novas são isoladas:

- `ExcellenceItem`
- `Competency`
- `LearningPlan`
- `TutorInteraction`
- `CourseQualityScore`
- `SupportTicket`

Rollback de aplicação pode ser feito sem alterar tabelas existentes, mas rollback de schema exige snapshot se a migration já tiver sido aplicada em produção.
