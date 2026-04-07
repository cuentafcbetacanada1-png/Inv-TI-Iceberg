@echo off
setlocal enabledelayedexpansion

:: Configuración de Supabase
set "URL=https://xgyovzjguphckcsalxex.supabase.co/rest/v1/equipos"
set "KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneW92empndXBoY2tjc2FseGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDE5ODEsImV4cCI6MjA5MTA3Nzk4MX0.upuQwylsKIBrcK_Tf7992pXSgSshNQ3tq5JBA5wc9dw"

title Iceberg IT :: Agente de Inventario
mode con: cols=65 lines=20
color 0b

echo.
echo  [ ICEBERG IT :: Sistema de inventarios ]
echo  ----------------------------------------
echo  [*] Escaneando hardware local...

:: Captura de Datos Básicos
set "NODE_NAME=%COMPUTERNAME%"
set "USER_NAME=%USERNAME%"

:: Captura de CPU
for /f "tokens=2 delims==" %%a in ('wmic cpu get name /value 2^>nul') do for /f "delims=" %%b in ("%%a") do set "CPU_NAME=%%b"

:: Captura de Serial
for /f "tokens=2 delims==" %%a in ('wmic bios get serialnumber /value 2^>nul') do for /f "delims=" %%b in ("%%a") do set "SERIAL_NUM=%%b"

:: Captura de RAM (Total en GB)
for /f "tokens=2 delims==" %%a in ('wmic os get TotalVisibleMemorySize /value 2^>nul') do (
    set /a "RAM_VAL=%%a/1024/1024"
    set "RAM_GB=!RAM_VAL! GB"
)

:: Captura de Almacenamiento (Disco C:)
for /f "tokens=2 delims==" %%a in ('wmic logicaldisk where "DeviceID='C:'" get size /value 2^>nul') do (
    set "RAW_DISK=%%a"
    set /a "DISK_GB=!RAW_DISK:~0,-9!"
    set "DISK_SIZE=!DISK_GB! GB"
)

:: Captura de Sistema Operativo
for /f "tokens=2 delims==" %%a in ('wmic os get Caption /value 2^>nul') do for /f "delims=" %%b in ("%%a") do set "OS_NAME=%%b"

:: Captura de IP Local
for /f "tokens=14" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do set "IP_ADDR=%%a"

echo  [+] Host: %NODE_NAME%
echo  [+] User: %USER_NAME%
echo  [*] Conectando con servidor...

:: Construcción del JSON (Payload)
:: Se envían los datos a las columnas específicas de tu DB
set "PAYLOAD={\"hostname\":\"%NODE_NAME%\",\"nombre_usuario\":\"%USER_NAME%\",\"equipo\":\"Computador\",\"ip_local\":\"%IP_ADDR%\",\"numero_serie\":\"%SERIAL_NUM%\",\"procesador\":\"%CPU_NAME%\",\"ram\":\"%RAM_GB%\",\"almacenamiento\":\"%DISK_SIZE%\",\"sistema_operativo\":\"%OS_NAME%\",\"validado\":false}"

:: Envío a Supabase vía CURL
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
