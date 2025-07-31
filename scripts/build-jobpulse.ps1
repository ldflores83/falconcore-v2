# Script específico para build y deploy de jobpulse
Write-Host "Build y Deploy - Solo JobPulse" -ForegroundColor Cyan

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

# Build jobpulse
Write-Host "Construyendo jobpulse..." -ForegroundColor Yellow
Set-Location "../jobpulse"
npm run build

# Verificar si el build fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en build de jobpulse" -ForegroundColor Red
    exit 1
}

# Volver al directorio raíz para deploy
Set-Location $PSScriptRoot/..

# Deploy
Write-Host "Deploy a Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting

Write-Host "Proceso completado!" -ForegroundColor Green
Write-Host "JobPulse disponible en: https://uaylabs.web.app/jobpulse" -ForegroundColor White 