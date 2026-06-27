param(
  [Parameter(Mandatory = $true)][string]$Input,
  [string]$Container = "infra-postgres-1"
)
if (-not (Test-Path -LiteralPath $Input)) { throw "Backup não encontrado: $Input" }
docker cp $Input "${Container}:/tmp/inside_sales.dump"
if ($LASTEXITCODE -ne 0) { throw "Falha ao copiar backup para o container" }
docker exec $Container pg_restore -U inside -d inside_sales --clean --if-exists /tmp/inside_sales.dump
if ($LASTEXITCODE -ne 0) { throw "Falha ao restaurar backup" }
docker exec $Container rm -f /tmp/inside_sales.dump | Out-Null
Write-Output "Restore concluído: $Input"
