# Script simple para build y deploy de todos los productos
Write-Host "Build y Deploy - Todos los Productos" -ForegroundColor Cyan

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

# Build ignium
Write-Host "Construyendo ignium..." -ForegroundColor Yellow
Set-Location "../ignium"
npm run build

# Verificar si el build fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en build de ignium" -ForegroundColor Red
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

# Build pulziohq
Write-Host "Construyendo pulziohq..." -ForegroundColor Yellow
Set-Location "../pulziohq"
npm run build

# Verificar si el build fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en build de pulziohq" -ForegroundColor Red
    exit 1
}

# Build onboardingaudit
Write-Host "Construyendo onboardingaudit..." -ForegroundColor Yellow
Set-Location "../onboardingaudit"
npm run build

# Verificar si el build fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en build de onboardingaudit" -ForegroundColor Red
    exit 1
}

# Volver al directorio raíz para deploy
Set-Location $PSScriptRoot/..

# Deploy
Write-Host "Deploy a Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting

Write-Host "Proceso completado!" -ForegroundColor Green
Write-Host "Productos disponibles:" -ForegroundColor Green
Write-Host "  - UayLabs: https://uaylabs.web.app" -ForegroundColor White
Write-Host "  - Ignium: https://uaylabs.web.app/ignium" -ForegroundColor White
Write-Host "  - JobPulse: https://uaylabs.web.app/jobpulse" -ForegroundColor White
Write-Host "  - PulzioHQ: https://uaylabs.web.app/pulziohq" -ForegroundColor White
Write-Host "  - OnboardingAudit: https://uaylabs.web.app/onboardingaudit" -ForegroundColor White 