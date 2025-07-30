# Script de Limpieza de Cache - Frontends
# Uso: .\scripts\clean-cache.ps1

Write-Host "🧹 LIMPIANDO CACHE DE FRONTENDS" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "frontends")) {
    Write-Host "❌ No se encontró el directorio frontends. Ejecuta desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Proyectos a limpiar
$projects = @("ignium", "jobpulse", "pulziohq", "uaylabs")
$totalFreed = 0

foreach ($project in $projects) {
    $projectPath = "frontends\$project"
    
    if (Test-Path $projectPath) {
        Write-Host "`n📁 Limpiando: $project" -ForegroundColor Yellow
        
        # Limpiar .next
        $nextPath = "$projectPath\.next"
        if (Test-Path $nextPath) {
            $size = [math]::Round((Get-ChildItem -Path $nextPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1KB, 2)
            Remove-Item -Path $nextPath -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  ✅ Eliminado .next ($size KB)" -ForegroundColor Green
            $totalFreed += $size
        }
        
        # Limpiar out (excepto en uaylabs)
        if ($project -ne "uaylabs") {
            $outPath = "$projectPath\out"
            if (Test-Path $outPath) {
                $size = [math]::Round((Get-ChildItem -Path $outPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1KB, 2)
                Remove-Item -Path $outPath -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "  ✅ Eliminado out ($size KB)" -ForegroundColor Green
                $totalFreed += $size
            }
        }
        
        # Limpiar package-lock.json
        $lockPath = "$projectPath\package-lock.json"
        if (Test-Path $lockPath) {
            $size = [math]::Round((Get-Item $lockPath).Length / 1KB, 2)
            Remove-Item -Path $lockPath -Force -ErrorAction SilentlyContinue
            Write-Host "  ✅ Eliminado package-lock.json ($size KB)" -ForegroundColor Green
            $totalFreed += $size
        }
        
        # Limpiar archivos obsoletos (solo ignium)
        if ($project -eq "ignium") {
            $obsoleteFiles = @("setup.md", "TECHNICAL_SNAPSHOT.md", "README.md")
            foreach ($file in $obsoleteFiles) {
                $filePath = "$projectPath\$file"
                if (Test-Path $filePath) {
                    $size = [math]::Round((Get-Item $filePath).Length / 1KB, 2)
                    Remove-Item -Path $filePath -Force -ErrorAction SilentlyContinue
                    Write-Host "  ✅ Eliminado $file ($size KB)" -ForegroundColor Green
                    $totalFreed += $size
                }
            }
            
            # Limpiar directorio docs
            $docsPath = "$projectPath\docs"
            if (Test-Path $docsPath) {
                $size = [math]::Round((Get-ChildItem -Path $docsPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1KB, 2)
                Remove-Item -Path $docsPath -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "  ✅ Eliminado docs ($size KB)" -ForegroundColor Green
                $totalFreed += $size
            }
        }
    }
}

Write-Host "`n📊 RESUMEN" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan
Write-Host "✅ Espacio liberado: $totalFreed KB" -ForegroundColor Green
Write-Host "`n🎉 LIMPIEZA COMPLETADA" -ForegroundColor Green
Write-Host "Para regenerar builds: npm run build en cada proyecto" -ForegroundColor Yellow 