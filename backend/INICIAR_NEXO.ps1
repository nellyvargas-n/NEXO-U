# Levanta FastAPI con Docker y muestra el estado.
$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot
$envFile = Join-Path $PSScriptRoot '.env'
if (!(Test-Path $envFile)) { throw 'Falta .env. Ejecuta .\CONFIGURAR_NEON.ps1 primero.' }
$content = [System.IO.File]::ReadAllText($envFile)
if ($content.Contains('REEMPLAZA_CONTRASENA_NUEVA')) {
    throw 'DATABASE_URL sigue sin contrasena. Ejecuta .\CONFIGURAR_NEON.ps1 primero.'
}
& docker compose up -d --build
if ($LASTEXITCODE -ne 0) { throw 'No se pudieron crear/iniciar los contenedores. Revisa Docker Desktop.' }
& docker compose ps
Write-Host 'Abre http://localhost:8000/ready y http://localhost:8000/docs' -ForegroundColor Cyan
