# Auditoria LGPD — Birthub Academy

## Minimização de Dados
- Coletamos apenas nome, e-mail e dados necessários para o certificado.
- Senhas são armazenadas com hash `bcrypt`.

## Consentimento
- Modelo `Consent` no Prisma armazena aceites de termos de uso e privacidade.
- IA só armazena prompts se `consentToStore` for verdadeiro.

## Exportação e Exclusão
- Funcionalidade de exclusão lógica (`deletedAt`) implementada em Usuários, Organizações e Cursos.
- Worker preparado para `export.user-data`.

## Logs de Auditoria
- Modelo `AuditLog` registra ações críticas: login, matrículas, submissões, avaliações e emissão de certificados.
- Inclui `actorId`, `tenantId`, `action` e metadados.

## Controle de Acesso
- Role-Based Access Control (RBAC) com roles OWNER, ADMIN, INSTRUCTOR, EVALUATOR, STUDENT.
- Isolamento Multi-tenant forçado via `activeTenantId` na sessão.
