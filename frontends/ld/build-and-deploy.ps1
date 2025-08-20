# Build y Deploy - LD Admin Dashboard (Centralizado)
Write-Host "Build y Deploy - LD Admin Dashboard" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Verificar si existe la estructura base de uaylabs
if (Test-Path "../uaylabs/out") {
    Write-Host "✅ Estructura base encontrada. Saltando build de uaylabs..." -ForegroundColor Green
} else {
    Write-Host "🔨 Construyendo uaylabs base..." -ForegroundColor Yellow
    Set-Location "../uaylabs"
    npm run build
    Set-Location "../ld"
}

# Construir LD Admin Dashboard
Write-Host "Construyendo LD Admin Dashboard..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completado exitosamente" -ForegroundColor Green
    
    # Deploy a Firebase
    Write-Host "Deploy a Firebase..." -ForegroundColor Yellow
    firebase deploy --only hosting:uaylabs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Proceso completado!" -ForegroundColor Green
        Write-Host "LD Admin Dashboard disponible en: https://uaylabs.web.app/ld" -ForegroundColor Cyan
        Write-Host "✅ Otros productos preservados en uaylabs/out/" -ForegroundColor Green
    } else {
        Write-Host "❌ Error en deploy de Firebase" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Error en build de LD Admin Dashboard" -ForegroundColor Red
    exit 1
}
