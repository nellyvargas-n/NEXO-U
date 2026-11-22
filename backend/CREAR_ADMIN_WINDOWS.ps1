# NEXO U - crear primer administrador de forma segura (Windows PowerShell)
# No escribe contraseñas en archivos ni argumentos de la línea de comandos.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Test-Path '.env')) {
  Write-Host 'FALTA backend/.env. Docker Compose no podrá arrancar.' -ForegroundColor Yellow
  Write-Host 'Si tienes el .env de tu versión anterior, cópialo a ESTA carpeta backend.'
  Write-Host 'Si no, ejecuta: Copy-Item .env.example .env'
  Write-Host 'Después abre .env y sustituye DATABASE_URL y JWT_SECRET por valores seguros.'
  exit 1
}
$raw = Get-Content '.env' -Raw
if ($raw -match 'USUARIO:CONTRASENA|TU_HOST_POOLER|REEMPLAZA_POR|CAMBIA_AQUI') {
  Write-Host 'Tu .env todavía contiene valores de ejemplo. Configura Neon y JWT_SECRET antes de continuar.' -ForegroundColor Yellow
  exit 1
}
Write-Host 'Iniciando backend...' -ForegroundColor Cyan
docker compose up -d --build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$email = Read-Host 'Correo del nuevo administrador (usa uno que controles)'
if ($email -notmatch '^[^@\s]+@[^@\s]+\.[^@\s]+$') { throw 'Correo inválido' }
Write-Host 'Ahora se pedirá la contraseña dentro del contenedor. No se guardará en Git.' -ForegroundColor Cyan
docker compose exec -it api python scripts/create_admin.py "$email"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host 'Listo. Abre http://localhost:5173/login e inicia sesión. Te dirigirá a /admin.' -ForegroundColor Green
