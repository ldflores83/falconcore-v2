# Script de Build y Deploy - Todos los Frontends
# Uso: .\scripts\build-and-deploy.ps1 [opciones]

param(
    [switch]$BuildOnly,
    [switch]$DeployOnly,
    [switch]$CleanFirst,
    [switch]$Verbose
)

# Colores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Cyan = "Cyan"

# Función para escribir mensajes con colores
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Función para mostrar progreso
function Show-Progress {
    param([string]$Message)
    Write-ColorOutput "🔄 $Message" $Yellow
}

# Función para mostrar éxito
function Show-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" $Green
}

# Función para mostrar error
function Show-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" $Red
}

# Función para mostrar información
function Show-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  $Message" $Cyan
}

# Función para ejecutar comando y mostrar resultado
function Invoke-CommandWithOutput {
    param(
        [string]$Command,
        [string]$WorkingDirectory,
        [string]$Description
    )
    
    Show-Progress $Description
    
    if ($WorkingDirectory) {
        Push-Location $WorkingDirectory
    }
    
    try {
        if ($Verbose) {
            Invoke-Expression $Command
        } else {
            $result = Invoke-Expression $Command 2>&1
            if ($LASTEXITCODE -eq 0) {
                Show-Success "$Description completado"
            } else {
                Show-Error "$Description falló: $result"
                return $false
            }
        }
        return $true
    }
    catch {
        Show-Error "$Description falló: $($_.Exception.Message)"
        return $false
    }
    finally {
        if ($WorkingDirectory) {
            Pop-Location
        }
    }
}

# Función principal
function Start-BuildAndDeploy {
    Write-ColorOutput "`n🚀 BUILD Y DEPLOY - TODOS LOS FRONTENDS" $Cyan
    Write-ColorOutput "=========================================" $Cyan
    
    # Verificar que estamos en el directorio correcto
    if (-not (Test-Path "frontends")) {
        Show-Error "No se encontró el directorio frontends. Ejecuta desde la raíz del proyecto."
        exit 1
    }
    
    # Limpiar cache si se solicita
    if ($CleanFirst) {
        Show-Info "Limpiando cache antes del build..."
        if (Test-Path "scripts\clean-cache.ps1") {
            & "scripts\clean-cache.ps1"
        } else {
            Show-Error "No se encontró el script de limpieza"
            exit 1
        }
    }
    
    # Proyectos a construir
    $projects = @(
        @{ Name = "ignium"; Path = "frontends\ignium" },
        @{ Name = "jobpulse"; Path = "frontends\jobpulse" },
        @{ Name = "pulziohq"; Path = "frontends\pulziohq" },
        @{ Name = "onboardingaudit"; Path = "frontends\onboardingaudit" },
        @{ Name = "uaylabs"; Path = "frontends\uaylabs" }
    )
    
    $buildSuccess = $true
    
    # Construir cada proyecto
    if (-not $DeployOnly) {
        Write-ColorOutput "`n📦 CONSTRUYENDO PROYECTOS" $Yellow
        Write-ColorOutput "=========================" $Yellow
        
        foreach ($project in $projects) {
            if (Test-Path $project.Path) {
                Show-Info "Construyendo: $($project.Name)"
                
                $success = Invoke-CommandWithOutput -Command "npm run build" -WorkingDirectory $project.Path -Description "Build de $($project.Name)"
                
                if (-not $success) {
                    $buildSuccess = $false
                    Show-Error "Build de $($project.Name) falló"
                    break
                }
            } else {
                Show-Error "No se encontró el proyecto: $($project.Name)"
                $buildSuccess = $false
                break
            }
        }
        
        if ($buildSuccess) {
            Show-Success "Todos los builds completados exitosamente"
        } else {
            Show-Error "Algunos builds fallaron. Abortando deploy."
            exit 1
        }
    }
    
    # Deploy si se solicita
    if (-not $BuildOnly) {
        Write-ColorOutput "`n🚀 DEPLOY A FIREBASE" $Yellow
        Write-ColorOutput "===================" $Yellow
        
        Show-Info "Verificando que los builds estén listos..."
        
        # Verificar que el directorio de salida existe
        $outPath = "frontends\uaylabs\out"
        if (-not (Test-Path $outPath)) {
            Show-Error "No se encontró el directorio de builds: $outPath"
            Show-Info "Ejecuta primero el build de todos los proyectos"
            exit 1
        }
        
        # Verificar que todos los productos estén construidos
        $requiredProducts = @("ignium", "jobpulse", "pulziohq", "onboardingaudit")
        foreach ($product in $requiredProducts) {
            $productPath = "$outPath\$product"
            if (-not (Test-Path $productPath)) {
                Show-Error "No se encontró el build de $product en $productPath"
                Show-Info "Ejecuta primero el build de todos los proyectos"
                exit 1
            }
        }
        
        Show-Success "Todos los builds están listos"
        
        # Ejecutar deploy
        $deploySuccess = Invoke-CommandWithOutput -Command "firebase deploy --only hosting:uaylabs" -Description "Deploy a Firebase"
        
        if ($deploySuccess) {
            Show-Success "Deploy completado exitosamente"
            Show-Info "Los productos están disponibles en:"
            Show-Info "  - UayLabs: https://uaylabs.web.app"
            Show-Info "  - Ignium: https://uaylabs.web.app/ignium"
            Show-Info "  - JobPulse: https://uaylabs.web.app/jobpulse"
            Show-Info "  - PulzioHQ: https://uaylabs.web.app/pulziohq"
            Show-Info "  - OnboardingAudit: https://uaylabs.web.app/onboardingaudit"
        } else {
            Show-Error "Deploy falló"
            exit 1
        }
    }
    
    Write-ColorOutput "`n🎉 PROCESO COMPLETADO" $Green
    Write-ColorOutput "=====================" $Green
}

# Función para mostrar ayuda
function Show-Help {
    Write-ColorOutput "`n📖 AYUDA - BUILD Y DEPLOY" $Cyan
    Write-ColorOutput "=========================" $Cyan
    Write-ColorOutput "`nUso:" $Yellow
    Write-ColorOutput "  .\scripts\build-and-deploy.ps1 [opciones]" $White
    Write-ColorOutput "`nOpciones:" $Yellow
    Write-ColorOutput "  -BuildOnly   : Solo construir, no hacer deploy" $White
    Write-ColorOutput "  -DeployOnly  : Solo deploy, no construir" $White
    Write-ColorOutput "  -CleanFirst  : Limpiar cache antes de construir" $White
    Write-ColorOutput "  -Verbose     : Mostrar output detallado" $White
    Write-ColorOutput "  -Help        : Mostrar esta ayuda" $White
    Write-ColorOutput "`nEjemplos:" $Yellow
    Write-ColorOutput "  .\scripts\build-and-deploy.ps1" $White
    Write-ColorOutput "  .\scripts\build-and-deploy.ps1 -BuildOnly" $White
    Write-ColorOutput "  .\scripts\build-and-deploy.ps1 -DeployOnly" $White
    Write-ColorOutput "  .\scripts\build-and-deploy.ps1 -CleanFirst" $White
}

# Manejo de parámetros
if ($args -contains "-Help" -or $args -contains "-h" -or $args -contains "--help") {
    Show-Help
    exit 0
}

# Ejecutar build y deploy
try {
    Start-BuildAndDeploy
}
catch {
    Show-Error "Error durante el proceso: $($_.Exception.Message)"
    exit 1
} 