# NEXO U: configurar Neon sin escribir secretos en codigo ni en Git.
# Ejecutar dentro de PowerShell: .\CONFIGURAR_NEON.ps1
$ErrorActionPreference = 'Stop'
$envFile = Join-Path $PSScriptRoot '.env'
Write-Host 'NEXO U - Configuracion de Neon prueba-v12' -ForegroundColor Cyan
Write-Host 'Antes de continuar, cambia la contrasena expuesta en Neon > Roles.' -ForegroundColor Yellow
Write-Host 'En Neon > prueba-v12 > Connect, copia la URL completa con la NUEVA contrasena.'
Write-Host 'La cadena se ocultara mientras la pegas en la terminal.'
$secure = Read-Host 'Pega la cadena de conexion COMPLETA de prueba-v12' -AsSecureString
$handle = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $url = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($handle).Trim()
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($handle)
}
if ($url -notmatch '^postgres(ql)?(\+psycopg)?://[^:]+:.+@[^/]+/[^?]+') {
    throw 'Cadena invalida. Copia la URL completa desde Neon > Connect e intentalo de nuevo.'
}
$url = $url -replace '^postgresql://', 'postgresql+psycopg://'
$url = $url -replace '^postgres://', 'postgresql+psycopg://'
if ($url -notmatch 'sslmode=require') {
    Write-Warning 'La URL de Neon suele incluir sslmode=require: comprueba que copiaste el enlace entero.'
}
$allowed = 'http://localhost:5173'
$frontend = Read-Host 'URL de frontend Vercel (opcional, Enter para omitir)'
if ($frontend -match '^https://[a-zA-Z0-9.-]+/?$') {
    $allowed += ',' + $frontend.TrimEnd('/')
} elseif (![string]::IsNullOrWhiteSpace($frontend)) {
    throw 'Direccion invalida de frontend: usa https://tudominio.vercel.app'
}
$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
$jwt = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
$content = @"
# CONFIGURACION PRIVADA - NO SUBIR A GITHUB
DATABASE_URL=$url
JWT_SECRET=$jwt
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DEMO_MODE=false
CORS_ORIGINS=$allowed
ENVIRONMENT=development
ALLOW_DEMO_SEED=false
DEMO_EMITTER_KEY=no_usar_en_produccion
"@
[System.IO.File]::WriteAllText($envFile, $content + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
Write-Host 'Se guardo backend/.env correctamente. No publiques este archivo.' -ForegroundColor Green
Write-Host 'Ahora ejecuta: docker compose up -d --build'
Write-Host 'Despues verifica: http://localhost:8000/ready'
