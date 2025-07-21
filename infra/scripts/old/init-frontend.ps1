
<#
.SYNOPSIS
  Crea un nuevo frontend limpio con Vite + React + Tailwind + estructura base de páginas
.PARAMETER ProductName
  Nombre del producto para crear la carpeta en /products/{ProductName}/web
#>

# init-frontend.ps1 (robusto, sin íconos)


param(
  [string]$ProductName
)

$basePath = "products/$ProductName/web"

Write-Host "Creando estructura frontend para '$ProductName' en '$basePath'..."

# Crear estructura básica
New-Item -ItemType Directory -Path $basePath -Force | Out-Null
Set-Location $basePath

# Inicializar proyecto Vite + React + TypeScript
Write-Host "Inicializando Vite..."
npm create vite@latest . -- --template react-ts

# Instalar Tailwind, PostCSS y plugin necesario
Write-Host "Instalando Tailwind, PostCSS y @tailwindcss/postcss..."
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss

# Generar tailwind.config.js si no existe
if (-Not (Test-Path "tailwind.config.js")) {
  Write-Host "Generando tailwind.config.js..."
  $tailwindConfig = @"
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
"@
  Set-Content -Path "tailwind.config.js" -Value $tailwindConfig -Encoding UTF8
} else {
  Write-Host "tailwind.config.js ya existe, saltando generación."
}

# Leer package.json para detectar tipo de módulo
try {
  $packageJson = Get-Content package.json | ConvertFrom-Json
  $isESModule = $false
  if ($packageJson.PSObject.Properties.Name -contains "type") {
    if ($packageJson.type -eq "module") {
      $isESModule = $true
    }
  }
}
catch {
  Write-Host "No se pudo leer package.json o no tiene 'type', asumiendo CommonJS"
  $isESModule = $false
}

# Generar postcss.config con sintaxis correcta y extensión adecuada
if ($isESModule) {
  Write-Host "Generando postcss.config.js con sintaxis ESM..."
  $postcssConfigContent = @"
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [tailwindcss(), autoprefixer()],
}
"@
  Set-Content -Path "postcss.config.js" -Value $postcssConfigContent -Encoding UTF8

  # Borrar postcss.config.cjs si existe para evitar conflictos
  if (Test-Path "postcss.config.cjs") {
    Remove-Item "postcss.config.cjs" -Force
  }
}
else {
  Write-Host "Generando postcss.config.cjs con sintaxis CommonJS..."
  $postcssConfigContent = @"
module.exports = {
  plugins: [
    require('@tailwindcss/postcss')(),
    require('autoprefixer'),
  ],
}
"@
  Set-Content -Path "postcss.config.cjs" -Value $postcssConfigContent -Encoding UTF8

  # Borrar postcss.config.js si existe para evitar conflictos
  if (Test-Path "postcss.config.js") {
    Remove-Item "postcss.config.js" -Force
  }
}

# Crear index.css con directivas Tailwind
$indexCssContent = @"
@tailwind base;
@tailwind components;
@tailwind utilities;
"@
Set-Content -Path "./src/index.css" -Value $indexCssContent -Encoding UTF8

# Crear App.tsx básico y limpio
$appTsxContent = @"
function App() {
  return (
    <div className=\"h-screen flex items-center justify-center bg-gray-100\">
      <h1 className=\"text-4xl font-bold text-blue-600\">
        Tailwind está funcionando!
      </h1>
    </div>
  )
}

export default App
"@
Set-Content -Path "./src/App.tsx" -Value $appTsxContent -Encoding UTF8

# Añadir importación de index.css en main.tsx si no está
$mainTsxPath = "./src/main.tsx"
if (Test-Path $mainTsxPath) {
  $content = Get-Content $mainTsxPath
  if (-Not ($content -join "`n" | Select-String "import './index.css'")) {
    Write-Host "Añadiendo importación de './index.css' en main.tsx"
    $newContent = @("import './index.css';") + $content
    Set-Content -Path $mainTsxPath -Value $newContent -Encoding UTF8
  }
}
else {
  Write-Host "main.tsx no encontrado. No se agregó importación de index.css"
}

Write-Host "Proyecto '$ProductName' creado exitosamente."
Write-Host "Corre 'npm run dev' dentro de products/$ProductName/web para iniciar."
