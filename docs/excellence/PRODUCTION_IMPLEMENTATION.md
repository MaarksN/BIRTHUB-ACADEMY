# Production Implementation — Excellence 35

## Persistência

O catálogo Excellence agora é persistido em Prisma com tenant explícito:

- `ExcellenceItem`: itens 11 a 35, status, métricas, outcomes e critérios.
- `Competency`: competências acadêmicas associadas ao curso.
- `LearningPlan`: planos de estudo por usuário e tenant.
- `TutorInteraction`: interações do tutor IA com prompt hash/redigido.
- `CourseQualityScore`: score de qualidade por curso, usuário e tenant.
- `SupportTicket`: tickets de suporte com SLA e status.

As migrations estão em `packages/db/prisma/migrations/202606270002_excellence_production_hardening`.

## API

Os endpoints públicos usam o tenant público configurado em `PUBLIC_EXCELLENCE_TENANT_ID` ou `default`.

Os endpoints protegidos usam exclusivamente `auth.activeTenantId` e `auth.userId`, preenchidos pelo `AuthGuard` a partir da sessão `inside_session`.

## Tutor IA

O tutor usa modo local por padrão (`EXCELLENCE_TUTOR_PROVIDER=local`). Quando `provider` é configurado, falhas no adapter retornam ao modo local e registram `fallbackUsed=true`.

Prompts são armazenados apenas redigidos e somente quando `consentToStore=true`. O hash do prompt é persistido para auditoria sem guardar o texto bruto.

## Frontend

A rota `/excelencia` carrega catálogo, roadmap, competências e pilares em paralelo e oferece ações autenticadas para plano, tutor e suporte.

## Observabilidade

- `x-request-id` é aplicado em todas as respostas.
- `ApiExceptionFilter` padroniza erros.
- `ready` valida banco e contagem do catálogo Excellence.
- Mutações protegidas gravam `AuditLog`.
