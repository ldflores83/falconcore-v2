# clean-start.ps1
# Limpieza diaria de entorno Falcon Core + Snapshot de estructura
# Ubicación sugerida: /infra/scripts/clean-start.ps1

Write-Host "Iniciando limpieza de entorno Falcon Core..."

# 1. Eliminar caché local de Firebase
if (Test-Path ".firebase") {
    Remove-Item -Recurse -Force ".firebase"
    Write-Host ".firebase eliminado"
}

# 2. Eliminar builds anteriores
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "dist eliminado"
}
if (Test-Path "frontends\dist") {
    Remove-Item -Recurse -Force "frontends\dist"
    Write-Host "frontends/dist eliminado"
}

# 3. Eliminar carpetas de placeholder si existen
if (Test-Path "products\_placeholder") {
    Remove-Item -Recurse -Force "products\_placeholder"
    Write-Host "products/_placeholder eliminado"
}

# 4. Asegurar exclusiones en .gitignore
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
    $alreadyExists = Select-String -Path $gitignorePath -Pattern $escapedEntry -Quiet
    if (-not $alreadyExists) {
        Add-Content -Path $gitignorePath -Value "`n$entry"
        Write-Host "Añadido a .gitignore: $entry"
    }
}

# 5. Generar snapshot de estructura
Write-Host "`nGenerando snapshot-estructura.txt..."
Push-Location "$PSScriptRoot\\..\\.."
tree /F /A > "infra/scripts/snapshot-estructura.txt"
Pop-Location
Write-Host "Snapshot guardado como snapshot-estructura.txt"

Write-Host "`nLimpieza completada. Listo para trabajar."
