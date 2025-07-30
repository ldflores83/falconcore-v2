@echo off
echo 🚀 DEPLOY RÁPIDO - TODOS LOS FRONTENDS
echo ======================================

REM Verificar directorio
if not exist "frontends" (
    echo ❌ No se encontró el directorio frontends
    pause
    exit /b 1
)

echo.
echo 📦 Construyendo todos los proyectos...

REM Construir ignium
echo   🔄 Construyendo ignium...
cd "frontends\ignium"
call npm run build
if errorlevel 1 (
    echo   ❌ Error construyendo ignium
    pause
    exit /b 1
)
cd ..\..

REM Construir jobpulse
echo   🔄 Construyendo jobpulse...
cd "frontends\jobpulse"
call npm run build
if errorlevel 1 (
    echo   ❌ Error construyendo jobpulse
    pause
    exit /b 1
)
cd ..\..

REM Construir pulziohq
echo   🔄 Construyendo pulziohq...
cd "frontends\pulziohq"
call npm run build
if errorlevel 1 (
    echo   ❌ Error construyendo pulziohq
    pause
    exit /b 1
)
cd ..\..

REM Construir uaylabs
echo   🔄 Construyendo uaylabs...
cd "frontends\uaylabs"
call npm run build
if errorlevel 1 (
    echo   ❌ Error construyendo uaylabs
    pause
    exit /b 1
)
cd ..\..

echo   ✅ Todos los builds completados

echo.
echo 🚀 Desplegando a Firebase...
call firebase deploy --only hosting:uaylabs

if errorlevel 1 (
    echo ❌ Error en el deploy
    pause
    exit /b 1
)

echo.
echo 🎉 DEPLOY COMPLETADO
echo ===================
echo Los productos están disponibles en:
echo   - UayLabs: https://uaylabs.web.app
echo   - Ignium: https://uaylabs.web.app/ignium
echo   - JobPulse: https://uaylabs.web.app/jobpulse
echo   - PulzioHQ: https://uaylabs.web.app/pulziohq
echo.
pause 