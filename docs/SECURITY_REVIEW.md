# Security Review — Excellence 35

## Decisões

- `tenantId` e `userId` nunca são aceitos como fonte de verdade em endpoints protegidos.
- Todos os endpoints POST dependem do `AuthGuard` global e de `CurrentAuth`.
- Dados públicos são limitados ao catálogo Excellence do tenant público.
- Tutor IA não armazena prompt bruto.
- Prompt redigido é armazenado apenas com consentimento explícito.
- Limite diário por usuário reduz abuso do tutor.
- Auditoria cobre plano de estudo, tutor, score de qualidade e ticket.

## Riscos residuais

- O adapter externo de IA depende de configuração segura de URL, chave e modelo.
- A política de retenção de `TutorInteraction` e `Consent` ainda precisa de rotina operacional de expurgo.
- Rate limit dedicado por endpoint pode ser refinado além do throttler global.

## Checklist

| Controle | Status |
|---|---|
| Auth por cookie de sessão | Implementado |
| Tenant derivado da sessão | Implementado |
| Multi-tenant em queries protegidas | Implementado |
| Redaction de PII comum | Implementado |
| Auditoria de mutações | Implementado |
| Segredos fora do repo | Implementado via `.env.example` sem valores reais |
