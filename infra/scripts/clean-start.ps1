# clean-start.ps1
# Versión 3.2 – Limpieza segura + snapshot con archivos ocultos + validación real de paths
# Ubicación: /infra/scripts/clean-start.ps1

Write-Host "Iniciando limpieza de entorno Falcon Core..."

# 1. Limpieza de carpetas y archivos temporales comunes (excepto .env)
$cleanupItems = @(
    ".DS_Store",
    ".firebase",
    ".git",
    ".vscode",
    "dist",
    "frontends\\dist",
    "products\\_placeholder"
)

foreach ($item in $cleanupItems) {
    if (Test-Path $item) {
        Remove-Item -Recurse -Force $item
        Write-Host "$item eliminado"
    }
}

# 2. Asegurar exclusiones en .gitignore (ubicado en raíz)
$gitignorePath = "$PSScriptRoot\\..\\..\\.gitignore"
$entries = @(
    "node_modules/",
    ".firebase/",
    "dist/",
    "frontends/dist",
    "config/serviceAccountKey.json"
)
foreach ($entry in $entries) {
    $escapedEntry = [regex]::Escape($entry)
    $alreadyExists = $false
    if (Test-Path $gitignorePath) {
        $alreadyExists = Select-String -Path $gitignorePath -Pattern $escapedEntry -Quiet
    }
    if (-not $alreadyExists) {
        Add-Content -Path $gitignorePath -Value "`n$entry"
        Write-Host "Añadido a .gitignore: $entry"
    }
}

# 3. Generar snapshot desde raíz usando Get-ChildItem (muestra archivos ocultos también)
Push-Location "$PSScriptRoot\\..\\.."
Get-ChildItem -Recurse -Force | Select-Object FullName | Out-File -Encoding utf8 "infra/scripts/snapshot-estructura.txt"
Pop-Location
Write-Host "Snapshot generado en infra/scripts/snapshot-estructura.txt"

# 4. Validar existencia real de archivos clave desde raíz del proyecto
$projectRoot = Resolve-Path "$PSScriptRoot\\..\\.."
$essentialFiles = @(
    "$projectRoot\\.env",
    "$projectRoot\\firebase.json",
    "$projectRoot\\.firebaserc",
    "$projectRoot\\package.json",
    "$projectRoot\\package-lock.json",
    "$PSScriptRoot\\clean-start.ps1"
)

foreach ($file in $essentialFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "ADVERTENCIA: $file NO SE ENCUENTRA. Revisa si fue eliminado por error."
    }
}

Write-Host "`nLimpieza completada. Listo para trabajar."
