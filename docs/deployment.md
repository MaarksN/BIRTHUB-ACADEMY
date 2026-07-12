# Deploy

Ambientes recomendados:

- local: Docker Compose com PostgreSQL, Redis e MinIO;
- homologação: banco gerenciado, Redis gerenciado, storage S3, variáveis segregadas;
- produção: CDN para frontend, API atrás de gateway, backups automatizados, rotação de segredos, observabilidade e alertas.

Backups:

- PostgreSQL: dump diário e retenção conforme política;
- S3: versionamento e lifecycle;
- Redis: usado como fila/cache, não como fonte permanente.
