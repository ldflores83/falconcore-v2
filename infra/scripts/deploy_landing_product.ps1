param (
  [string]$product
)

if (-not $product) {
  Write-Host " Debes proporcionar un nombre de producto con -product"
  exit 1
}

Write-Host ""
Write-Host " Iniciando nuevo frontend para producto: $product"
Write-Host ""

# Crear estructura base con Vite
$frontendPath = "frontends/$product"
$distPath = "frontends/dist/$product"
Write-Host " Creando estructura con Vite en: $PWD\$frontendPath"
npx create-vite@$([char]0x0037).0.3 $frontendPath --template react-ts

# Instalar dependencias base
Push-Location $frontendPath
npm install
Write-Host "`n Instalando TailwindCSS..."
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Generar tailwind.config.cjs y postcss.config.cjs
Set-Content "tailwind.config.cjs" 'module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}'
Set-Content "postcss.config.cjs" 'module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}'

# Agregar archivos base
Set-Content "./index.html" @"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>$product</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"@

New-Item -Path "./src/pages" -ItemType Directory -Force | Out-Null
Set-Content "./src/pages/Landing.tsx" @"
const Landing = () => {
  return (
    <div className='p-4 text-center'>
      <h1 className='text-2xl font-bold'>Hola mundo desde $product</h1>
    </div>
  );
};

export default Landing;
"@

Set-Content "./src/App.tsx" @"
import Landing from './pages/Landing';

function App() {
  return <Landing />;
}

export default App;
"@

Set-Content "./src/index.css" "@tailwind base;
@tailwind components;
@tailwind utilities;
"

Set-Content "./src/main.tsx" @"
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"@

# Configurar vite.config.ts
Set-Content "vite.config.ts" @"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/$product/',
  build: {
    outDir: '../dist/$product',
    emptyOutDir: true
  },
  plugins: [react()],
});
"@

# Agregar script de build
$json = Get-Content package.json | ConvertFrom-Json
$json.scripts.build = "vite build"
$json | ConvertTo-Json -Depth 10 | Set-Content package.json

# Volver a raíz
Pop-Location

# Ejecutar build
Write-Host "`n  Ejecutando build de Vite..."
Push-Location $frontendPath
npm run build
Pop-Location

# Vincular hosting si no existe
Write-Host "`n Verificando target: hosting:$product"
$targetCheck = firebase target:lookup hosting $product 2>&1
if ($targetCheck -match "not configured") {
  Write-Host "  Vinculando target a sitio 'uaylabs'"
  firebase target:apply hosting $product uaylabs
} else {
  Write-Host " Target hosting:$product ya está vinculado"
}

# Hacer deploy
Write-Host "`n Haciendo deploy a hosting:$product..."
firebase deploy --only hosting:$product

Write-Host "`n Deploy completo para producto: $product"