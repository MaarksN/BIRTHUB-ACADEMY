# Controle de Acesso Baseado em Papéis (RBAC)

## Papéis
- **OWNER**: Controle total.
- **ADMIN**: Gestão operacional.
- **INSTRUCTOR**: Gestão pedagógica.
- **STUDENT**: Consumo de conteúdo.
- **MODERATOR**: Moderação de comunidade.
- **REVIEWER**: Correção de atividades.

## Implementação
- Definido no Prisma Schema via Enums e Memberships.
- Verificado via Guards na API.
