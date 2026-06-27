param(
  [string]$Output = "backups/inside_sales_$(Get-Date -Format 'yyyyMMdd_HHmmss').dump",
  [string]$Container = "infra-postgres-1"
)
$directory = Split-Path -Parent $Output
if ($directory) { New-Item -ItemType Directory -Force -Path $directory | Out-Null }
docker exec $Container pg_dump -U inside -d inside_sales -Fc -f /tmp/inside_sales.dump
if ($LASTEXITCODE -ne 0) { throw "Falha ao criar backup no container" }
docker cp "${Container}:/tmp/inside_sales.dump" $Output
if ($LASTEXITCODE -ne 0) { throw "Falha ao copiar backup" }
docker exec $Container rm -f /tmp/inside_sales.dump | Out-Null
Write-Output "Backup criado: $Output"
