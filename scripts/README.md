# Scripts de Mantenimiento

Este directorio contiene scripts útiles para el mantenimiento del proyecto.

## 🚀 Scripts de Build y Deploy

### ⭐ RECOMENDADO: quick-build.ps1
**Script simple y confiable que funciona sin errores.**

**Uso:**
```powershell
# Build y deploy de todos los frontends
.\scripts\quick-build.ps1
```

**Qué hace:**
- ✅ Build de uaylabs (estructura base)
- ✅ Build de ignium
- ✅ Build de jobpulse  
- ✅ Build de pulziohq
- ✅ Build de onboardingaudit
- ✅ Deploy hosting (todos los productos)

### build-all-products.ps1
**Script completo que incluye también el deploy de functions (backend).**

**Uso:**
```powershell
# Build y deploy completo (frontends + backend)
.\scripts\build-all-products.ps1
```

**Qué hace:**
- ✅ Todo lo que hace quick-build.ps1
- ✅ Build de functions (backend)
- ✅ Deploy de functions (backend)

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

### Para desarrollo diario:
```powershell
# Script recomendado - rápido y confiable
.\scripts\quick-build.ps1
```

### Para deploy completo (frontends + backend):
```powershell
# Script completo con backend
.\scripts\build-all-products.ps1
```

### Para limpiar cache:
```bash
# Limpieza básica
.\scripts\clean-cache.bat
```

## 🎯 Recomendaciones

1. **Para la mayoría de casos**: Usa `quick-build.ps1`
2. **Para deploy completo**: Usa `build-all-products.ps1`
3. **Para limpiar cache**: Usa `clean-cache.bat`
4. **Evita scripts complejos**: Los scripts con muchas opciones pueden tener errores

## 📊 Estado de los Scripts

### ✅ Funcionando Correctamente
- `quick-build.ps1` - Script recomendado
- `build-all-products.ps1` - Script completo
- `clean-cache.bat` - Limpieza básica

### ⚠️ Scripts con Problemas Conocidos
- `build-and-deploy.ps1` - Puede tener errores de dependencias
- `build-and-deploy.bat` - Versión compleja que puede fallar
- Scripts individuales - Pueden tener problemas de rutas 