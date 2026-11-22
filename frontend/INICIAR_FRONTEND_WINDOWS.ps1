# Ejecutar desde la carpeta frontend. No lee ni guarda contraseñas de Neon.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
if (-not (Test-Path ".env.local")) {
  Set-Content -Path ".env.local" -Value "VITE_API_BASE_URL=/api/" -Encoding utf8
  Write-Host "Configuracion local creada en frontend/.env.local" -ForegroundColor Cyan
}
Write-Host "NEXO U v10 - Frontend" -ForegroundColor Magenta
Write-Host "Comprueba antes que el backend responda en http://localhost:8000/ready"
if (-not (Test-Path 'node_modules')) { npm install }
npm run dev
