# Ahau Build and Deploy Script
# Este script construye y despliega la landing page de Ahau

Write-Host "🚀 Iniciando build y deploy de Ahau..." -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio de Ahau." -ForegroundColor Red
    exit 1
}

# Verificar que existe el directorio uaylabs/out
if (-not (Test-Path "../uaylabs/out")) {
    Write-Host "📁 Creando directorio uaylabs/out..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "../uaylabs/out" -Force | Out-Null
}

Write-Host "🔨 Construyendo Ahau..." -ForegroundColor Blue

# Ejecutar build
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error durante el build de Ahau" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build de Ahau completado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error durante el build: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verificar que el build se generó correctamente
if (Test-Path "../uaylabs/out/ahau/index.html") {
    Write-Host "✅ Archivos de Ahau generados correctamente en ../uaylabs/out/ahau/" -ForegroundColor Green
} else {
    Write-Host "❌ Error: No se encontró el archivo index.html de Ahau" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Build de Ahau completado exitosamente!" -ForegroundColor Green
Write-Host "📁 Archivos generados en: ../uaylabs/out/ahau/" -ForegroundColor Cyan
Write-Host "🌐 Para desplegar, ejecuta desde el directorio raíz: firebase deploy --only hosting" -ForegroundColor Cyan