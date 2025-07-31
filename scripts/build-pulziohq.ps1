# Script específico para build y deploy de pulziohq
Write-Host "Build y Deploy - Solo PulzioHQ" -ForegroundColor Cyan

# Ir al directorio raíz del proyecto
Set-Location $PSScriptRoot/..

# Build uaylabs primero (para crear la estructura base)
Write-Host "Construyendo uaylabs..." -ForegroundColor Yellow
Set-Location "frontends/uaylabs"
npm run build

# Verificar si el build fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en build de uaylabs" -ForegroundColor Red
    exit 1
}

# Build pulziohq
Write-Host "Construyendo pulziohq..." -ForegroundColor Yellow
Set-Location "../pulziohq"
npm run build

# Verificar si el build fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en build de pulziohq" -ForegroundColor Red
    exit 1
}

# Volver al directorio raíz para deploy
Set-Location $PSScriptRoot/..

# Deploy
Write-Host "Deploy a Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting

Write-Host "Proceso completado!" -ForegroundColor Green
Write-Host "PulzioHQ disponible en: https://uaylabs.web.app/pulziohq" -ForegroundColor White 