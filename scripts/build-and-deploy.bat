@echo off
REM Script de Build y Deploy - Todos los Frontends
REM Uso: .\scripts\build-and-deploy.bat

setlocal enabledelayedexpansion

REM Colores para output
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "CYAN=[96m"
set "RESET=[0m"

REM Función para mostrar mensajes con colores
:show_message
echo %~1%~2%~3
goto :eof

REM Función para mostrar progreso
:show_progress
call :show_message "%YELLOW%" "🔄 " "%~1%RESET%"
goto :eof

REM Función para mostrar éxito
:show_success
call :show_message "%GREEN%" "✅ " "%~1%RESET%"
goto :eof

REM Función para mostrar error
:show_error
call :show_message "%RED%" "❌ " "%~1%RESET%"
goto :eof

REM Función para mostrar información
:show_info
call :show_message "%CYAN%" "ℹ️  " "%~1%RESET%"
goto :eof

REM Verificar parámetros
set "BUILD_ONLY="
set "DEPLOY_ONLY="
set "CLEAN_FIRST="

:parse_args
if "%~1"=="" goto :start_process
if "%~1"=="-BuildOnly" set "BUILD_ONLY=1"
if "%~1"=="-DeployOnly" set "DEPLOY_ONLY=1"
if "%~1"=="-CleanFirst" set "CLEAN_FIRST=1"
if "%~1"=="-Help" goto :show_help
if "%~1"=="-h" goto :show_help
if "%~1"=="--help" goto :show_help
shift
goto :parse_args

:show_help
echo.
echo %CYAN%📖 AYUDA - BUILD Y DEPLOY%RESET%
echo ================================
echo.
echo %YELLOW%Uso:%RESET%
echo   build-and-deploy.bat [opciones]
echo.
echo %YELLOW%Opciones:%RESET%
echo   -BuildOnly   : Solo construir, no hacer deploy
echo   -DeployOnly  : Solo deploy, no construir
echo   -CleanFirst  : Limpiar cache antes de construir
echo   -Help        : Mostrar esta ayuda
echo.
echo %YELLOW%Ejemplos:%RESET%
echo   build-and-deploy.bat
echo   build-and-deploy.bat -BuildOnly
echo   build-and-deploy.bat -DeployOnly
echo   build-and-deploy.bat -CleanFirst
echo.
goto :end

:start_process
echo.
echo %CYAN%🚀 BUILD Y DEPLOY - TODOS LOS FRONTENDS%RESET%
echo =========================================

REM Verificar que estamos en el directorio correcto
if not exist "frontends" (
    call :show_error "No se encontró el directorio frontends. Ejecuta desde la raíz del proyecto."
    pause
    exit /b 1
)

REM Limpiar cache si se solicita
if defined CLEAN_FIRST (
    call :show_info "Limpiando cache antes del build..."
    if exist "scripts\clean-cache.bat" (
        call "scripts\clean-cache.bat"
    ) else (
        call :show_error "No se encontró el script de limpieza"
        pause
        exit /b 1
    )
)

REM Construir cada proyecto
if not defined DEPLOY_ONLY (
    echo.
    echo %YELLOW%📦 CONSTRUYENDO PROYECTOS%RESET%
    echo =========================
    
    REM Construir ignium
    if exist "frontends\ignium" (
        call :show_info "Construyendo: ignium"
        call :show_progress "Build de ignium"
        cd "frontends\ignium"
        call npm run build
        if !errorlevel! equ 0 (
            call :show_success "Build de ignium completado"
        ) else (
            call :show_error "Build de ignium falló"
            pause
            exit /b 1
        )
        cd ..\..
    ) else (
        call :show_error "No se encontró el proyecto: ignium"
        pause
        exit /b 1
    )
    
    REM Construir jobpulse
    if exist "frontends\jobpulse" (
        call :show_info "Construyendo: jobpulse"
        call :show_progress "Build de jobpulse"
        cd "frontends\jobpulse"
        call npm run build
        if !errorlevel! equ 0 (
            call :show_success "Build de jobpulse completado"
        ) else (
            call :show_error "Build de jobpulse falló"
            pause
            exit /b 1
        )
        cd ..\..
    ) else (
        call :show_error "No se encontró el proyecto: jobpulse"
        pause
        exit /b 1
    )
    
    REM Construir pulziohq
    if exist "frontends\pulziohq" (
        call :show_info "Construyendo: pulziohq"
        call :show_progress "Build de pulziohq"
        cd "frontends\pulziohq"
        call npm run build
        if !errorlevel! equ 0 (
            call :show_success "Build de pulziohq completado"
        ) else (
            call :show_error "Build de pulziohq falló"
            pause
            exit /b 1
        )
        cd ..\..
    ) else (
        call :show_error "No se encontró el proyecto: pulziohq"
        pause
        exit /b 1
    )
    
    REM Construir onboardingaudit
    if exist "frontends\onboardingaudit" (
        call :show_info "Construyendo: onboardingaudit"
        call :show_progress "Build de onboardingaudit"
        cd "frontends\onboardingaudit"
        call npm run build
        if !errorlevel! equ 0 (
            call :show_success "Build de onboardingaudit completado"
        ) else (
            call :show_error "Build de onboardingaudit falló"
            pause
            exit /b 1
        )
        cd ..\..
    ) else (
        call :show_error "No se encontró el proyecto: onboardingaudit"
        pause
        exit /b 1
    )
    
    REM Construir uaylabs
    if exist "frontends\uaylabs" (
        call :show_info "Construyendo: uaylabs"
        call :show_progress "Build de uaylabs"
        cd "frontends\uaylabs"
        call npm run build
        if !errorlevel! equ 0 (
            call :show_success "Build de uaylabs completado"
        ) else (
            call :show_error "Build de uaylabs falló"
            pause
            exit /b 1
        )
        cd ..\..
    ) else (
        call :show_error "No se encontró el proyecto: uaylabs"
        pause
        exit /b 1
    )
    
    call :show_success "Todos los builds completados exitosamente"
)

REM Deploy si se solicita
if not defined BUILD_ONLY (
    echo.
    echo %YELLOW%🚀 DEPLOY A FIREBASE%RESET%
    echo ===================
    
    call :show_info "Verificando que los builds estén listos..."
    
    REM Verificar que el directorio de salida existe
    if not exist "frontends\uaylabs\out" (
        call :show_error "No se encontró el directorio de builds: frontends\uaylabs\out"
        call :show_info "Ejecuta primero el build de todos los proyectos"
        pause
        exit /b 1
    )
    
    REM Verificar que todos los productos estén construidos
    if not exist "frontends\uaylabs\out\ignium" (
        call :show_error "No se encontró el build de ignium"
        call :show_info "Ejecuta primero el build de todos los proyectos"
        pause
        exit /b 1
    )
    
    if not exist "frontends\uaylabs\out\jobpulse" (
        call :show_error "No se encontró el build de jobpulse"
        call :show_info "Ejecuta primero el build de todos los proyectos"
        pause
        exit /b 1
    )
    
    if not exist "frontends\uaylabs\out\pulziohq" (
        call :show_error "No se encontró el build de pulziohq"
        call :show_info "Ejecuta primero el build de todos los proyectos"
        pause
        exit /b 1
    )
    
    if not exist "frontends\uaylabs\out\onboardingaudit" (
        call :show_error "No se encontró el build de onboardingaudit"
        call :show_info "Ejecuta primero el build de todos los proyectos"
        pause
        exit /b 1
    )
    
    call :show_success "Todos los builds están listos"
    
    REM Ejecutar deploy
    call :show_progress "Deploy a Firebase"
    call firebase deploy --only hosting:uaylabs
    if !errorlevel! equ 0 (
        call :show_success "Deploy completado exitosamente"
        call :show_info "Los productos están disponibles en:"
        call :show_info "  - UayLabs: https://uaylabs.web.app"
        call :show_info "  - Ignium: https://uaylabs.web.app/ignium"
        call :show_info "  - JobPulse: https://uaylabs.web.app/jobpulse"
        call :show_info "  - PulzioHQ: https://uaylabs.web.app/pulziohq"
        call :show_info "  - OnboardingAudit: https://uaylabs.web.app/onboardingaudit"
    ) else (
        call :show_error "Deploy falló"
        pause
        exit /b 1
    )
)

echo.
echo %GREEN%🎉 PROCESO COMPLETADO%RESET%
echo =====================

:end
echo.
pause 