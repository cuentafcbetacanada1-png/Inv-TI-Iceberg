@echo off
setlocal enabledelayedexpansion

:: Configuración de Supabase
set "URL=https://xgyovzjguphckcsalxex.supabase.co/rest/v1/equipos"
set "KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneW92empndXBoY2tjc2FseGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDE5ODEsImV4cCI6MjA5MTA3Nzk4MX0.upuQwylsKIBrcK_Tf7992pXSgSshNQ3tq5JBA5wc9dw"

title Iceberg IT :: Agente de Telemetría v6.0
mode con: cols=65 lines=20
color 0b

echo.
echo  [ ICEBERG IT :: Sistema de inventarios ]
echo  ----------------------------------------
echo  [*] Escaneando hardware local...

set "NODE_NAME=%COMPUTERNAME%"
set "USER_NAME=%USERNAME%"

:: 1. Recolección de los 10 campos solicitados
for /f "tokens=2 delims==" %%a in ('wmic cpu get name /value 2^>nul') do for /f "delims=" %%b in ("%%a") do set "CPU_NAME=%%b"
for /f "tokens=2 delims==" %%a in ('wmic bios get serialnumber /value 2^>nul') do for /f "delims=" %%b in ("%%a") do set "SERIAL_NUM=%%b"
for /f "tokens=2 delims==" %%a in ('wmic computersystem get manufacturer /value 2^>nul') do for /f "delims=" %%b in ("%%a") do set "MARCA=%%b"
for /f "tokens=2 delims==" %%a in ('wmic os get TotalVisibleMemorySize /value 2^>nul') do (
    set /a "RAM_VAL=%%a/1024/1024"
    set "RAM_GB=!RAM_VAL! GB"
)
for /f "tokens=2 delims==" %%a in ('wmic os get Caption /value 2^>nul') do for /f "delims=" %%b in ("%%a") do set "OS_NAME=%%b"
for /f "tokens=14" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    if "!IP_ADDR!"=="" set "IP_ADDR=%%a"
)

:: Determinar si es Laptop o Escritorio (ChassisTypes: 9, 10, 14 son laptops)
set "IS_LAPTOP=false"
set "IS_DESKTOP=true"
for /f "tokens=2 delims={}" %%a in ('wmic systemenclosure get chassistypes /value 2^>nul') do (
    set "CHASSIS=%%a"
    if "!CHASSIS!"=="9" set "IS_LAPTOP=true" & set "IS_DESKTOP=false"
    if "!CHASSIS!"=="10" set "IS_LAPTOP=true" & set "IS_DESKTOP=false"
    if "!CHASSIS!"=="14" set "IS_LAPTOP=true" & set "IS_DESKTOP=false"
)

echo  [+] Host: %NODE_NAME%
echo  [+] User: %USER_NAME%
echo  [+] IP: %IP_ADDR%
echo  [*] Sincronizando Matriz IT...

:: 2. Construcción del JSON con los campos exactos de la DB
set "PAYLOAD={\"hostname\":\"%NODE_NAME%\",\"username\":\"%USER_NAME%\",\"ip_local\":\"%IP_ADDR%\",\"caracteristicas_pc\":\"%CPU_NAME%\",\"numero_serie\":\"%SERIAL_NUM%\",\"marca_pc\":\"%MARCA%\",\"es_escritorio\":%IS_DESKTOP%,\"es_laptop\":%IS_LAPTOP%,\"memoria_ram\":\"%RAM_GB%\",\"sistema_operativo\":\"%OS_NAME%\",\"updated_at\":\"now()\"}"

:: 3. Upsert en Supabase
curl -s -X POST "%URL%" ^
     -H "apikey: %KEY%" ^
     -H "Authorization: Bearer %KEY%" ^
     -H "Content-Type: application/json" ^
     -H "Prefer: resolution=merge-duplicates" ^
     -d "%PAYLOAD%"

if %errorlevel% equ 0 (
    echo  ----------------------------------------
    echo  [ OK ] DATOS SINCRONIZADOS CON EXITO.
    echo  ----------------------------------------
) else (
    echo  ----------------------------------------
    echo  [ ERROR ] FALLO EN LA CONEXION.
    echo  ----------------------------------------
)

echo.
echo  Proceso terminado. Presiona una tecla...
pause > nul
