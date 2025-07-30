@echo off
echo 🧹 LIMPIANDO CACHE DE FRONTENDS
echo ================================

REM Verificar directorio
if not exist "frontends" (
    echo ❌ No se encontró el directorio frontends
    pause
    exit /b 1
)

echo.
echo 📁 Limpiando proyectos...

REM Limpiar ignium
if exist "frontends\ignium\.next" (
    echo   🔄 Limpiando .next en ignium
    rmdir /s /q "frontends\ignium\.next" 2>nul
    echo   ✅ Eliminado .next de ignium
)

if exist "frontends\ignium\package-lock.json" (
    echo   🔄 Limpiando package-lock.json en ignium
    del "frontends\ignium\package-lock.json" 2>nul
    echo   ✅ Eliminado package-lock.json de ignium
)

REM Limpiar jobpulse
if exist "frontends\jobpulse\.next" (
    echo   🔄 Limpiando .next en jobpulse
    rmdir /s /q "frontends\jobpulse\.next" 2>nul
    echo   ✅ Eliminado .next de jobpulse
)

if exist "frontends\jobpulse\package-lock.json" (
    echo   🔄 Limpiando package-lock.json en jobpulse
    del "frontends\jobpulse\package-lock.json" 2>nul
    echo   ✅ Eliminado package-lock.json de jobpulse
)

REM Limpiar pulziohq
if exist "frontends\pulziohq\.next" (
    echo   🔄 Limpiando .next en pulziohq
    rmdir /s /q "frontends\pulziohq\.next" 2>nul
    echo   ✅ Eliminado .next de pulziohq
)

if exist "frontends\pulziohq\package-lock.json" (
    echo   🔄 Limpiando package-lock.json en pulziohq
    del "frontends\pulziohq\package-lock.json" 2>nul
    echo   ✅ Eliminado package-lock.json de pulziohq
)

REM Limpiar uaylabs
if exist "frontends\uaylabs\.next" (
    echo   🔄 Limpiando .next en uaylabs
    rmdir /s /q "frontends\uaylabs\.next" 2>nul
    echo   ✅ Eliminado .next de uaylabs
)

if exist "frontends\uaylabs\package-lock.json" (
    echo   🔄 Limpiando package-lock.json en uaylabs
    del "frontends\uaylabs\package-lock.json" 2>nul
    echo   ✅ Eliminado package-lock.json de uaylabs
)

echo.
echo 📊 RESUMEN
echo =========
echo ✅ Limpieza completada
echo.
echo 🎉 LIMPIEZA COMPLETADA
echo =====================
echo Para regenerar builds: npm run build en cada proyecto
echo.
pause 