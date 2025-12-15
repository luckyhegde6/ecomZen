Param()
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root

Write-Host "Starting postgres container..."
docker-compose up -d postgres

$container = "ecomzen-postgres"

$envFile = Join-Path $root "..\.env.postgres"
if (-not (Test-Path ".env.postgres")) { Write-Error ".env.postgres not found" ; exit 1 }

$users = Get-Content .env.postgres | Where-Object { $_ -match '^POSTGRES_USER=' }
$user = ($users -split '=')[1]
$db = ((Get-Content .env.postgres | Where-Object { $_ -match '^POSTGRES_DB=' }) -split '=')[1]

Write-Host "Waiting for Postgres to be ready..."
$ok = $false
for ($i=0; $i -lt 30; $i++) {
    $res = docker exec $container pg_isready -U $user -d $db 2>$null
    if ($LASTEXITCODE -eq 0) { $ok = $true; break }
    Write-Host "  still waiting ($($i+1)/30)..."
    Start-Sleep -Seconds 2
}

if (-not $ok) {
    Write-Error "Postgres did not become healthy. See: docker logs $container"
    exit 1
}

Write-Host "Postgres is ready. Run migrations and seed from host:"
Write-Host "  $env:DATABASE_URL = 'postgresql://$user:<PASSWORD>@localhost:$(Get-Content .env.postgres | Where-Object { $_ -match '^POSTGRES_PORT=' } | ForEach-Object { ($_ -split '=')[1] })/$db'"
Write-Host "  npx prisma generate"
Write-Host "  npx prisma migrate dev --name init"
Write-Host "  npx ts-node prisma/seed.ts"
