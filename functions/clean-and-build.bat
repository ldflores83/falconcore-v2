@echo off
echo 🔄 Limpiando compilaciones anteriores...

REM Elimina carpetas de build comunes
rd /s /q lib
rd /s /q dist
rd /s /q build

REM Elimina caché de TypeScript si existe
del /f /q .tsbuildinfo
del /f /q tsconfig.tsbuildinfo

REM Opcional: elimina carpeta de error del editor (VSCode)
rd /s /q .vscode

echo ✅ Limpieza completada. Compilando...
call npm run build
