# Script específico para build y deploy de ignium
Write-Host "Build y Deploy - Solo Ignium" -ForegroundColor Cyan

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

# Volver al directorio raíz para deploy
Set-Location $PSScriptRoot/..

# Deploy
Write-Host "Deploy a Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting

Write-Host "Proceso completado!" -ForegroundColor Green
Write-Host "Ignium disponible en: https://uaylabs.web.app/ignium" -ForegroundColor White 