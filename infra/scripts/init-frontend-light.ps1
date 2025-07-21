# init-frontend-light.ps1
# ---------------------------------------
# Script de inicialización ligero para frontends con Vite + TailwindCSS
# Ideal para proyectos que no requieren estructura completa ni rutas predefinidas

param (
    [string]$ProductName
)

$webPath = "products/$ProductName/web"

# Verifica si ya existe la carpeta
if (Test-Path $webPath) {
    Write-Host "❌ La carpeta ya existe: $webPath"
    exit 1
}

# Crea el directorio
New-Item -Path $webPath -ItemType Directory -Force | Out-Null
Set-Location $webPath

# Inicializa el proyecto con Vite
npm create vite@latest . -- --template react-ts

# Instala TailwindCSS y dependencias
npm install -D tailwindcss postcss autoprefixer

# Genera los archivos de configuración
npx tailwindcss init -p

# Reemplaza contenido base de tailwind.config.js
Set-Content -Path "tailwind.config.js" -Value @'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
'@

# Aplica estilos base en index.css
Set-Content -Path "src/index.css" -Value @'
@tailwind base;
@tailwind components;
@tailwind utilities;
'@

Write-Host "✅ Frontend ligero inicializado en: $webPath"
Write-Host "👉 Corre 'npm install' y luego 'npm run dev'"
