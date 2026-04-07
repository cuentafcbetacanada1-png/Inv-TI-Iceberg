@echo off
setlocal enabledelayedexpansion

set "URL=https://xgyovzjguphckcsalxex.supabase.co/rest/v1/equipos"
set "KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneW92empndXBoY2tjc2FseGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDE5ODEsImV4cCI6MjA5MTA3Nzk4MX0.upuQwylsKIBrcK_Tf7992pXSgSshNQ3tq5JBA5wc9dw"

title Iceberg IT - Inventory Agent
mode con: cols=60 lines=20
color 0b

echo.
echo  [ ICEBERG IT :: Sistema de inventarios ]
echo  ----------------------------------------
echo  [*] Escaneando hardware local...
set "NODE_NAME=%COMPUTERNAME%"
set "USER_NAME=%USERNAME%"
set "CPU_NAME=Generico"
set "MODEL_NAME=PC-Iceberg"
for /f "tokens=2 delims==" %%a in ('wmic cpu get name /value 2^>nul') do for /f "delims=" %%b in ("%%a") do set "CPU_NAME=%%b"
for /f "tokens=2 delims==" %%a in ('wmic computersystem get model /value 2^>nul') do for /f "delims=" %%b in ("%%a") do set "MODEL_NAME=%%b"
set "SPECS=MOD: %MODEL_NAME% - CPU: %CPU_NAME%"
echo  [+] Host: %NODE_NAME%
echo  [+] User: %USER_NAME%
echo  [*] Conectando con servidor...
set "PAYLOAD={\"hostname\":\"%NODE_NAME%\",\"nombre_usuario\":\"%USER_NAME%\",\"equipo\":\"Computador\",\"caracteristicas\":\"%SPECS%\",\"validado\":false}"
curl -s -X POST "%URL%" ^
     -H "apikey: %KEY%" ^
     -H "Authorization: Bearer %KEY%" ^
     -H "Content-Type: application/json" ^
     -H "Prefer: return=minimal" ^
     -d "%PAYLOAD%"
if %errorlevel% equ 0 (
    echo  ----------------------------------------
    echo  [ OK ] DATOS SINCRONIZADOS CON EXITO.
    echo  ----------------------------------------
) else (
    echo  ----------------------------------------
    echo  [ ERROR ] FALLO EN LA TRANSMISION.
    echo  ----------------------------------------
)
echo.
echo  Proceso terminado. Presiona una tecla...
pause > nul
