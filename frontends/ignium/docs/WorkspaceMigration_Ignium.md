# Migración de Frontends Uay Labs a Monorepo con npm Workspaces (Compatible con Windows PowerShell)

## Objetivo
Optimizar almacenamiento y modularidad en la carpeta `/frontends`, usando un único `node_modules` compartido por todos los productos (Ign ium, PulzioHQ, JobPulse, etc.).  
Mantener compatibilidad con Next.js, Tailwind y Firebase Hosting, evitando duplicación de dependencias que llenen el disco de la Surface.

---

## Tareas a realizar

### 1. Crear package.json raíz en `/frontends`
```json
{
  "name": "uaylabs-frontends",
  "private": true,
  "workspaces": [
    "ignium",
    "pulziohq",
    "jobpulse"
  ],
  "scripts": {
    "build:ignium": "npm run build --prefix ./ignium",
    "dev:ignium": "npm run dev --prefix ./ignium",
    "build:pulziohq": "npm run build --prefix ./pulziohq",
    "dev:pulziohq": "npm run dev --prefix ./pulziohq",
    "build:jobpulse": "npm run build --prefix ./jobpulse",
    "dev:jobpulse": "npm run dev --prefix ./jobpulse"
  }
}
```

---

### 2. Limpiar dependencias locales
- Eliminar `node_modules` y `package-lock.json` en cada producto existente:
  ```powershell
  cd frontends/ignium
  Remove-Item -Recurse -Force node_modules, package-lock.json
  ```
- Repetir para `/pulziohq` y `/jobpulse`.

---

### 3. Instalar dependencias en el monorepo
Desde `/frontends/`:
```powershell
npm install
```

Esto generará un único `node_modules` en `/frontends/node_modules`.

---

### 4. Verificar ejecución de cada producto
Ejemplo:
```powershell
npm run dev:ignium
npm run dev:pulziohq
```

Cada comando debe resolver dependencias desde el `node_modules` raíz.

---

### 5. Ajustar .gitignore en `/frontends`
```plaintext
node_modules
**/.next
```

---

### 6. Confirmar builds
- La build de Ignium debe generarse en `/frontends/ignium/.next`.
- Validar que Firebase Hosting siga sirviendo el contenido correctamente.

---

## Ajuste de Firebase Hosting

### firebase.json propuesto
```json
{
  "hosting": [
    {
      "target": "ignium",
      "public": "frontends/ignium/out",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
    },
    {
      "target": "pulziohq",
      "public": "frontends/pulziohq/out",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
    },
    {
      "target": "jobpulse",
      "public": "frontends/jobpulse/out",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
    }
  ]
}
```

> Nota: Si usamos `next export`, la carpeta será `/out`.  
> Si mantenemos renderizado SSR, ajustamos a `.next` o la carpeta que genere Next en cada build.

---

## Notas importantes
- Mantener intacto `next.config.js` de cada producto.
- Validar que `tailwind.config.js` y `postcss.config.js` sigan funcionando por producto.
- No mover ni alterar las carpetas `.next` internas.
- Imports relativos en Ignium deben seguir funcionando tras la migración.
- Asegurarse de que cada build siga sirviéndose desde `/ignium`, `/pulziohq`, `/jobpulse`.

---

## Resultado esperado
Un monorepo funcional en `/frontends` con un único `node_modules` y dependencias compartidas, sin duplicaciones pesadas.  
Cada producto (Ign ium, PulzioHQ, JobPulse) conserva independencia, rutas limpias en Firebase Hosting y deploy estable.
