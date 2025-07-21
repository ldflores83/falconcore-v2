param (
    [Parameter(Mandatory = $true)]
    [string]$projectName
)

$projectPath = "frontends/$projectName"
Write-Host "`n▶️  Scaffolding project in $projectPath..."

# Crear carpeta y moverse ahí
New-Item -ItemType Directory -Force -Path $projectPath | Out-Null
Set-Location $projectPath

# Inicializar proyecto con Vite + React + TypeScript
npx create-vite . --template react-ts

# Instalar dependencias
npm install
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss

# Crear tailwind.config.cjs manualmente
@"
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
"@ | Out-File -Encoding UTF8 "tailwind.config.cjs"

# Crear postcss.config.cjs manualmente
@"
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
"@ | Out-File -Encoding UTF8 "postcss.config.cjs"

# Reemplazar index.css
@"
@tailwind base;
@tailwind components;
@tailwind utilities;
"@ | Set-Content "src/index.css"

# Arreglar slashes en index.html
(Get-Content "index.html") -replace '\\', '/' | Set-Content "index.html"

Write-Host "`n✅ Frontend para '$projectName' creado con éxito en '$projectPath'"
Write-Host "➡️  Ejecuta: cd $projectPath && npm run dev`n"
