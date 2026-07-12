# Modelo de dados

O schema Prisma contempla usuários, organizações, memberships, papéis, permissões, curso, versões, módulos, ciclos, blocos, atividades, rubricas, questões, tentativas, matrículas, progresso, entregas, projetos, desafio final, certificados, verificação, fontes, chunks, auditoria, consentimentos, logs, IA, prompts, automações, jobs e billing.

Todo modelo operacional inclui `tenantId` ou chave equivalente quando participa do isolamento lógico.

A migration inicial real está em `packages/db/prisma/migrations/202606220001_initial/migration.sql`, gerada por `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`.
