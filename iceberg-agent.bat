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
set "SERIAL_NUM=N/A"
set "RAM_GB=0"
set "OS_NAME=Windows"
set "IP_ADDR=0.0.0.0"
set "DISK_SIZE=0"
set "MONITOR_RES=N/A"

for /f "tokens=2 delims==" %%a in ('wmic cpu get name /value 2^>nul') do for /f "delims=" %%b in ("%%a") do set "CPU_NAME=%%b"
for /f "tokens=2 delims==" %%a in ('wmic bios get serialnumber /value 2^>nul') do for /f "delims=" %%b in ("%%a") do set "SERIAL_NUM=%%b"
for /f "tokens=2 delims==" %%a in ('wmic os get TotalVisibleMemorySize /value 2^>nul') do (
    set /a "RAM_VAL=%%a/1024/1024"
    set "RAM_GB=!RAM_VAL! GB"
)
for /f "tokens=2 delims==" %%a in ('wmic logicaldisk where "DeviceID='C:'" get size /value 2^>nul') do (
    set "RAW_DISK=%%a"
    set /a "DISK_GB=!RAW_DISK:~0,-9!"
    set "DISK_SIZE=!DISK_GB! GB"
)
for /f "tokens=2 delims==" %%a in ('wmic path Win32_VideoController get CurrentHorizontalResolution,CurrentVerticalResolution /value 2^>nul') do (
    for /f "tokens=1,2 delims==" %%b in ("%%a") do (
        if "%%b"=="CurrentHorizontalResolution" set "H_RES=%%c"
        if "%%b"=="CurrentVerticalResolution" set "V_RES=%%c"
    )
)
if defined H_RES set "MONITOR_RES=%H_RES%x%V_RES%"

for /f "tokens=2 delims==" %%a in ('wmic os get Caption /value 2^>nul') do for /f "delims=" %%b in ("%%a") do set "OS_NAME=%%b"
for /f "tokens=14" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do set "IP_ADDR=%%a"

set "SPECS=CPU: %CPU_NAME% | RAM: %RAM_GB% | DISK: %DISK_SIZE% | OS: %OS_NAME%"
echo  [+] Host: %NODE_NAME%
echo  [+] IP: %IP_ADDR%
echo  [+] S/N: %SERIAL_NUM%
echo  [+] RAM: %RAM_GB%
echo  [+] DISK: %DISK_SIZE%
echo  [*] Conectando con servidor...

set "PAYLOAD={\"hostname\":\"%NODE_NAME%\",\"ip_local\":\"%IP_ADDR%\",\"nombre_usuario\":\"%USER_NAME%\",\"equipo\":\"Computador\",\"caracteristicas\":\"%SPECS%\",\"procesador\":\"%CPU_NAME%\",\"ram\":\"%RAM_GB%\",\"sistema_operativo\":\"%OS_NAME%\",\"numero_serie\":\"%SERIAL_NUM%\",\"almacenamiento\":\"%DISK_SIZE%\",\"monitor\":\"%MONITOR_RES%\",\"validado\":false}"
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
