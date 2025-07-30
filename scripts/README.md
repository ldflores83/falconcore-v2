# Scripts de Mantenimiento

Este directorio contiene scripts útiles para el mantenimiento del proyecto.

## 🚀 Scripts de Build y Deploy

### build-and-deploy.bat
Script de batch para construir y desplegar todos los frontends.

**Uso:**
```bash
# Build y deploy completo
.\scripts\build-and-deploy.bat

# Solo construir
.\scripts\build-and-deploy.bat -BuildOnly

# Solo deploy (si ya están construidos)
.\scripts\build-and-deploy.bat -DeployOnly

# Limpiar cache antes de construir
.\scripts\build-and-deploy.bat -CleanFirst

# Ver ayuda
.\scripts\build-and-deploy.bat -Help
```

### build-and-deploy.ps1
Script de PowerShell avanzado para build y deploy.

**Uso:**
```bash
# Build y deploy completo
powershell -ExecutionPolicy Bypass -File ".\scripts\build-and-deploy.ps1"

# Solo construir
powershell -ExecutionPolicy Bypass -File ".\scripts\build-and-deploy.ps1" -BuildOnly

# Solo deploy
powershell -ExecutionPolicy Bypass -File ".\scripts\build-and-deploy.ps1" -DeployOnly

# Con limpieza previa
powershell -ExecutionPolicy Bypass -File ".\scripts\build-and-deploy.ps1" -CleanFirst

# Con output detallado
powershell -ExecutionPolicy Bypass -File ".\scripts\build-and-deploy.ps1" -Verbose
```

## 🧹 Scripts de Limpieza de Cache

### clean-cache.bat
Script de batch simple para limpiar cache de frontends.

**Uso:**
```bash
.\scripts\clean-cache.bat
```

**Qué limpia:**
- ✅ Directorios `.next` (cache de Next.js)
- ✅ Archivos `package-lock.json` duplicados
- ✅ Mantiene `node_modules` compartido
- ✅ Preserva builds en `uaylabs/out/`

### clean-frontend-cache.ps1
Script de PowerShell avanzado con opciones.

**Uso:**
```bash
# Limpieza básica
powershell -ExecutionPolicy Bypass -File ".\scripts\clean-frontend-cache.ps1"

# Limpieza completa (incluye node_modules compartido)
powershell -ExecutionPolicy Bypass -File ".\scripts\clean-frontend-cache.ps1" -Force

# Ver ayuda
powershell -ExecutionPolicy Bypass -File ".\scripts\clean-frontend-cache.ps1" -Help
```

**Opciones:**
- `-Force`: También elimina `node_modules` compartido
- `-Verbose`: Muestra información detallada
- `-Help`: Muestra ayuda

### clean-frontend-cache.bat
Script de batch avanzado con opciones.

**Uso:**
```bash
# Limpieza básica
.\scripts\clean-frontend-cache.bat

# Limpieza completa
.\scripts\clean-frontend-cache.bat -Force

# Ver ayuda
.\scripts\clean-frontend-cache.bat -Help
```

## 📋 Cuándo usar los scripts

### ✅ Usar limpieza básica cuando:
- Los builds están lentos
- Hay problemas de cache
- Quieres liberar espacio
- Antes de hacer deploy

### ✅ Usar limpieza completa cuando:
- Hay problemas de dependencias
- Quieres reinstalar todo
- Después de cambios importantes
- Para debugging

## 🔄 Después de la limpieza

### Regenerar builds:
```bash
# En cada proyecto
cd frontends/ignium && npm run build
cd ../jobpulse && npm run build
cd ../pulziohq && npm run build
cd ../uaylabs && npm run build
```

### Reinstalar dependencias (si usaste -Force):
```bash
cd frontends
npm install
```

## 📊 Qué se limpia

### Archivos eliminados:
- `.next/` - Cache de Next.js
- `package-lock.json` - Archivos de lock duplicados
- `setup.md` - Documentación obsoleta
- `TECHNICAL_SNAPSHOT.md` - Snapshots obsoletos
- `docs/` - Documentación interna obsoleta

### Archivos preservados:
- `node_modules/` - Dependencias compartidas
- `uaylabs/out/` - Builds centralizados
- Archivos de configuración
- Código fuente

## 🚀 Comandos rápidos

```bash
# Build y deploy completo
.\scripts\build-and-deploy.bat

# Limpieza rápida
.\scripts\clean-cache.bat

# Limpieza completa
powershell -ExecutionPolicy Bypass -File ".\scripts\clean-frontend-cache.ps1" -Force

# Solo build (sin deploy)
.\scripts\build-and-deploy.bat -BuildOnly

# Solo deploy (si ya están construidos)
.\scripts\build-and-deploy.bat -DeployOnly
```

## ⚠️ Notas importantes

1. **Siempre ejecuta desde la raíz del proyecto**
2. **Los builds se regeneran automáticamente cuando sea necesario**
3. **El `node_modules` compartido se preserva por defecto**
4. **Los builds en `uaylabs/out/` se mantienen para deployment** 