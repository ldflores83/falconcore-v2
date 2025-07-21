// desde raiz facon-core-v2, correr en powershell .\infra\scripts\init-frontend.ps1 -ProductName "clientpulse"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProductName
)

$projectPath = "products/$ProductName/web"

if (Test-Path $projectPath) {
    Write-Host "❌ Ya existe: $projectPath"
    exit 1
}

# Crear estructura base
Write-Host "🚀 Creando estructura para $ProductName..."
New-Item -ItemType Directory -Path $projectPath -Force | Out-Null
Set-Location $projectPath

# Crear proyecto Vite
Write-Host "📦 Inicializando Vite con React + TypeScript..."
npm create vite@latest . -- --template react-ts

# Instalar dependencias
Write-Host "📥 Instalando dependencias..."
npm install
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom
npm install -D @types/react-router-dom

# Tailwind config
Write-Host "🛠️ Configurando Tailwind y PostCSS..."

@"
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
"@ | Out-File "tailwind.config.js" -Encoding UTF8

@"
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"@ | Out-File "postcss.config.js" -Encoding UTF8

@"
@tailwind base;
@tailwind components;
@tailwind utilities;
"@ | Out-File "./src/index.css" -Encoding UTF8

# Crear estructura interna
New-Item -ItemType Directory -Path "./src/pages" -Force | Out-Null

# main.tsx
@"
import React from \"react\";
import ReactDOM from \"react-dom/client\";
import { BrowserRouter as Router, Route, Routes } from \"react-router-dom\";
import App from \"./App\";
import \"./index.css\";

ReactDOM.createRoot(document.getElementById(\"root\")!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
"@ | Out-File "./src/main.tsx" -Encoding UTF8

# App.tsx
@"
import { Routes, Route } from \"react-router-dom\";
import Landing from \"./pages/Landing\";
import Success from \"./pages/Success\";
import Logout from \"./pages/Logout\";

export default function App() {
  return (
    <Routes>
      <Route path=\"/\" element={<Landing />} />
      <Route path=\"/success\" element={<Success />} />
      <Route path=\"/logout\" element={<Logout />} />
    </Routes>
  );
}
"@ | Out-File "./src/App.tsx" -Encoding UTF8

# Landing.tsx
@"
export default function Landing() {
  const handleLogin = () => {
    window.location.href = \"/oauth/login?project_id=$ProductName\";
  };

  return (
    <div className=\"min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-6\">
      <h1 className=\"text-4xl font-bold mb-4\">Welcome to $ProductName</h1>
      <p className=\"mb-6 text-lg text-gray-600\">Your smart assistant starts here.</p>
      <button onClick={handleLogin} className=\"bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg\">
        Iniciar sesión con Google
      </button>
    </div>
  );
}
"@ | Out-File "./src/pages/Landing.tsx" -Encoding UTF8

# Success.tsx
@"
import { useSearchParams, useNavigate } from \"react-router-dom\";

export default function Success() {
  const [params] = useSearchParams();
  const email = params.get(\"email\");
  const folderId = params.get(\"folderId\");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate(\"/logout\");
  };

  return (
    <div className=\"min-h-screen flex flex-col items-center justify-center bg-green-50 p-6 text-center\">
      <h1 className=\"text-3xl font-semibold mb-4\">¡Sesión iniciada!</h1>
      <p className=\"text-gray-700 mb-2\">Correo: <strong>{email}</strong></p>
      <p className=\"text-gray-700 mb-6\">Carpeta en Drive: <code>{folderId}</code></p>
      <button onClick={handleLogout} className=\"border px-4 py-2 rounded hover:bg-gray-100\">
        Cerrar sesión
      </button>
    </div>
  );
}
"@ | Out-File "./src/pages/Success.tsx" -Encoding UTF8

# Logout.tsx
@"
import { useEffect } from \"react\";
import { useNavigate } from \"react-router-dom\";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
    const timeout = setTimeout(() => navigate(\"/\"), 2000);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className=\"min-h-screen flex flex-col items-center justify-center bg-gray-200 text-center p-6\">
      <h1 className=\"text-2xl font-medium\">Sesión cerrada correctamente</h1>
      <p className=\"text-gray-600 mt-2\">Redirigiendo al inicio...</p>
    </div>
  );
}
"@ | Out-File "./src/pages/Logout.tsx" -Encoding UTF8

Write-Host "✅ Frontend completo para '$ProductName' creado correctamente en $projectPath"
