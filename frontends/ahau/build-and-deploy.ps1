# Script optimizado para build y deploy de ahau
Write-Host "Build y Deploy - Ahau (Optimizado)" -ForegroundColor Cyan

# Ir al directorio raíz del proyecto
Set-Location $PSScriptRoot\..\..

# Verificar si existe la estructura base de uaylabs/out
if (-not (Test-Path "frontends/uaylabs/out")) {
    Write-Host "⚠️  Estructura base no encontrada. Construyendo uaylabs..." -ForegroundColor Yellow
    Set-Location "frontends/uaylabs"
    npm run build
    
    # Verificar si el build fue exitoso
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error en build de uaylabs" -ForegroundColor Red
        exit 1
    }
    
    # Volver al directorio raíz
    Set-Location $PSScriptRoot\..\..
} else {
    Write-Host "✅ Estructura base encontrada. Saltando build de uaylabs..." -ForegroundColor Green
}

# Build solo ahau
Write-Host "Construyendo ahau..." -ForegroundColor Yellow
Set-Location "frontends/ahau"
npm run build

# Verificar si el build fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en build de ahau" -ForegroundColor Red
    exit 1
}

# Volver al directorio raíz para deploy
Set-Location $PSScriptRoot\..\..

# Deploy
Write-Host "Deploy a Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting

Write-Host "Proceso completado!" -ForegroundColor Green
Write-Host "Ahau disponible en: https://uaylabs.web.app/ahau" -ForegroundColor White
Write-Host "✅ Otros productos preservados en uaylabs/out/" -ForegroundColor Green
