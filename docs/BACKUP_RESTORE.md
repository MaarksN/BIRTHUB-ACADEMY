# Backup e Restauração — Birthub Academy

## Banco de Dados (PostgreSQL)

### Backup
```bash
docker exec -t postgres-container-name pg_dumpall -c -U inside > dump_$(date +%Y-%m-%d_%H_%M_%S).sql
```

### Restauração
```bash
cat dump.sql | docker exec -i postgres-container-name psql -U inside
```

## Arquivos (MinIO/S3)
- Os arquivos estão armazenados no volume `minio-data`.
- Recomenda-se replicação de bucket ou backup periódico do volume.

## Logs de Auditoria
- Estão no banco de dados e devem seguir o ciclo de backup do PostgreSQL.
