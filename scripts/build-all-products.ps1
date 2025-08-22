# Script completo para build y deploy de todos los productos + functions
Write-Host "Build y Deploy - Todos los Productos + Functions" -ForegroundColor Cyan

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

# Build ahau
Write-Host "Construyendo ahau..." -ForegroundColor Yellow
Set-Location "../ahau"
npm run build

# Verificar si el build fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en build de ahau" -ForegroundColor Red
    exit 1
}

# Build ld
Write-Host "Construyendo ld..." -ForegroundColor Yellow
Set-Location "../ld"
npm run build

# Verificar si el build fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en build de ld" -ForegroundColor Red
    exit 1
}

# Volver al directorio raíz
Set-Location $PSScriptRoot/..

# Build functions (backend)
Write-Host "Construyendo functions (backend)..." -ForegroundColor Yellow
Set-Location "functions"
npm run build

# Verificar si el build fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en build de functions" -ForegroundColor Red
    exit 1
}

# Volver al directorio raíz para deploy
Set-Location $PSScriptRoot/..

# Deploy hosting (frontends)
Write-Host "Deploy hosting (frontends)..." -ForegroundColor Yellow
firebase deploy --only hosting

# Verificar si el deploy fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en deploy de hosting" -ForegroundColor Red
    exit 1
}

# Deploy functions (backend)
Write-Host "Deploy functions (backend)..." -ForegroundColor Yellow
firebase deploy --only functions:api

# Verificar si el deploy fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en deploy de functions" -ForegroundColor Red
    exit 1
}

Write-Host "Proceso completado!" -ForegroundColor Green
Write-Host "Productos disponibles:" -ForegroundColor Green
Write-Host "  - UayLabs: https://uaylabs.web.app" -ForegroundColor White
Write-Host "  - Ignium: https://uaylabs.web.app/ignium" -ForegroundColor White
Write-Host "  - JobPulse: https://uaylabs.web.app/jobpulse" -ForegroundColor White
Write-Host "  - PulzioHQ: https://uaylabs.web.app/pulziohq" -ForegroundColor White
Write-Host "  - OnboardingAudit: https://uaylabs.web.app/onboardingaudit" -ForegroundColor White
Write-Host "  - Ahau: https://uaylabs.web.app/ahau" -ForegroundColor White
Write-Host "  - LD Admin: https://uaylabs.web.app/ld" -ForegroundColor White
Write-Host "Backend API: https://api-fu54nvsqfa-uc.a.run.app" -ForegroundColor White 