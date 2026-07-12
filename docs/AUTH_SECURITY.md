# Autenticação e Segurança

## Autenticação
- Implementada via JWT (preparada no NestJS).
- Senhas armazenadas com hash seguro (bcrypt).
- Proteção contra Brute Force via Rate Limiting.

## Segurança
- Sanitização de inputs com Zod.
- Proteção contra XSS e CSRF.
- Headers de segurança configurados.
- Rate Limiting global (100 req/min).
