@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "PS1_PATH=%SCRIPT_DIR%iceberg-agent.ps1"

if not exist "%PS1_PATH%" (
    echo [ERROR] No se encontro "%PS1_PATH%".
    exit /b 1
)

title Iceberg IT :: Agente de Telemetria
echo.
echo [ ICEBERG IT :: Launcher ]
echo ----------------------------------------
echo [*] Ejecutando agente PowerShell...

if /i "%~1"=="silent" (
    powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%PS1_PATH%" -Silent
) else (
    powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%PS1_PATH%"
)

set "EXIT_CODE=%ERRORLEVEL%"
if not "%EXIT_CODE%"=="0" (
    echo [ERROR] El agente termino con codigo %EXIT_CODE%.
    exit /b %EXIT_CODE%
)

if /i not "%~1"=="silent" (
    echo.
    echo Proceso terminado. Presiona una tecla...
    pause > nul
)
