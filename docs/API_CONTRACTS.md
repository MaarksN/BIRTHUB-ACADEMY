# API Contracts — Excellence 35

## Público

- `GET /excellence/items`
- `GET /excellence/items/:slugOrNumber`
- `GET /excellence/roadmap`
- `GET /excellence/competencies`
- `GET /excellence/pillars`

## Protegido

- `POST /excellence/learning-plan`
- `GET /excellence/learning-plans`
- `POST /excellence/ai-tutor`
- `GET /excellence/ai-tutor/history`
- `POST /excellence/quality-score`
- `GET /excellence/quality-score/history`
- `POST /excellence/support-ticket`
- `GET /excellence/support-tickets`

## Regras de tenant

Payloads protegidos não aceitam `tenantId` ou `userId` como fonte de autorização. O servidor sempre usa:

- `auth.activeTenantId`
- `auth.userId`

## Erros

Erros seguem o filtro global:

```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Payload inválido",
  "path": "/excellence/learning-plan",
  "requestId": "...",
  "timestamp": "..."
}
```
