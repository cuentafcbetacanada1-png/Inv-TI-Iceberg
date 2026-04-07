@echo off
setlocal enabledelayedexpansion

:: ==========================================
:: CONFIGURACIÓN DE SUPABASE (ZINC ELITE v10.0)
:: ==========================================
set "URL=https://xgyovzjguphckcsalxex.supabase.co/rest/v1/equipos"
set "KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneW92empndXBoY2tjc2FseGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDE5ODEsImV4cCI6MjA5MTA3Nzk4MX0.upuQwylsKIBrcK_Tf7992pXSgSshNQ3tq5JBA5wc9dw"

title Iceberg IT :: Agente de Telemetría v6.5
mode con: cols=70 lines=25
color 0b

echo.
echo  [ ICEBERG IT :: Sistema de inventarios ]
echo  ----------------------------------------
echo  [*] Escaneando hardware local...

:: 1. Hostname & User
set "NODE_NAME=%COMPUTERNAME%"
set "USER_NAME=%USERNAME%"

:: 2. IP Local (Método Universal/Robusto)
set "IP_ADDR=0.0.0.0"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r /c:"IPv4" /c:"Direcci.n IPv4"') do (
    set "tempIP=%%a"
    set "IP_ADDR=!tempIP:~1!"
    goto :ip_done
)
:ip_done

:: 3. Serial Number (Detección Multi-Capa)
set "SERIAL_NUM="
:: Intento 1: PowerShell BIOS
for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "(Get-CimInstance Win32_Bios).SerialNumber.Trim()"`) do set "temp=%%a"
:: Intento 2: PowerShell ComputerSystem (IdentifyingNumber)
if "%temp%"=="" for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "(Get-CimInstance Win32_ComputerSystemProduct).IdentifyingNumber.Trim()"`) do set "temp=%%a"

:: Filtro de Cadenas Genéricas
set "SERIAL_NUM=%temp%"
if /i "%SERIAL_NUM%"=="To be filled by O.E.M." set "SERIAL_NUM="
if /i "%SERIAL_NUM%"=="System Serial Number" set "SERIAL_NUM="
if /i "%SERIAL_NUM%"=="SystemSerialNumber" set "SERIAL_NUM="
if /i "%SERIAL_NUM%"=="0" set "SERIAL_NUM="
if /i "%SERIAL_NUM%"=="None" set "SERIAL_NUM="
if /i "%SERIAL_NUM%"=="Default string" set "SERIAL_NUM="

:: Fallback WMIC si PowerShell falló o devolvió genérico
if "%SERIAL_NUM%"=="" (
    for /f "tokens=2 delims==" %%a in ('wmic bios get serialnumber /value 2^>nul') do set "SERIAL_NUM=%%a"
)
if "%SERIAL_NUM%"=="" set "SERIAL_NUM=GENERIC-%NODE_NAME%"

:: 3.5 System SKU & Model (Nueva Función)
set "SYS_SKU=N/A"
set "SYS_MODEL=N/A"

:: Detectar Modelo de Sistema
for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "(Get-CimInstance Win32_ComputerSystem).Model.Trim()"`) do set "SYS_MODEL=%%a"
if "%SYS_MODEL%"=="" for /f "tokens=2 delims==" %%a in ('wmic computersystem get model /value 2^>nul') do set "SYS_MODEL=%%a"

:: Detectar SKU (Metodología Refinada)
for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "(Get-CimInstance Win32_ComputerSystem).SystemSKU.Trim()"`) do set "tempSKU=%%a"
if "%tempSKU%"=="" for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "(Get-CimInstance Win32_ComputerSystemProduct).SKUNumber.Trim()"`) do set "tempSKU=%%a"

set "SYS_SKU=%tempSKU%"
if /i "%SYS_SKU%"=="None" set "SYS_SKU=N/A"
if /i "%SYS_SKU%"=="Default string" set "SYS_SKU=N/A"
if "%SYS_SKU%"=="" set "SYS_SKU=N/A"

:: 4. Marca del Equipo
for /f "tokens=2 delims==" %%a in ('wmic computersystem get manufacturer /value 2^>nul') do set "MARCA=%%a"
if "%MARCA%"=="" set "MARCA=Generic OEM"

:: 5. Procesador (CPU)
for /f "tokens=2 delims==" %%a in ('wmic cpu get name /value 2^>nul') do set "CPU_NAME=%%a"

:: 6. Memoria RAM (Cálculo Preciso en GB)
for /f "skip=1" %%p in ('wmic os get totalvisiblememorysize 2^>nul') do ( 
    set "mem=%%p"
    goto :ram_calc
)
:ram_calc
set /a "RAM_GB=%mem% / 1048576 + 1"
set "RAM_STR=%RAM_GB% GB"

:: 7. Sistema Operativo
for /f "tokens=2 delims==" %%a in ('wmic os get caption /value 2^>nul') do set "OS_NAME=%%a"

:: 8. Tipo de Equipo (Laptop vs Desktop)
set "IS_LAPTOP=false"
set "IS_DESKTOP=true"
wmic path Win32_Battery get Caption 2>nul | findstr /i "Battery" >nul
if %errorlevel% equ 0 (
    set "IS_LAPTOP=true"
    set "IS_DESKTOP=false"
)

echo  [+] Host: %NODE_NAME%
echo  [+] User: %USER_NAME%
echo  [+] IP  : %IP_ADDR%
echo  [+] S/N : %SERIAL_NUM%
echo  [+] Mod : %SYS_MODEL%
echo  [+] SKU : %SYS_SKU%
echo  [*] Conectando con servidor...

:: 9. Construcción del JSON
set "PAYLOAD={\"hostname\":\"%NODE_NAME%\",\"username\":\"%USER_NAME%\",\"ip_local\":\"%IP_ADDR%\",\"caracteristicas_pc\":\"%CPU_NAME%\",\"numero_serie\":\"%SERIAL_NUM%\",\"marca_pc\":\"%MARCA%\",\"es_escritorio\":%IS_DESKTOP%,\"es_laptop\":%IS_LAPTOP%,\"memoria_ram\":\"%RAM_STR%\",\"sistema_operativo\":\"%OS_NAME%\",\"sku\":\"%SYS_SKU%\",\"modelo\":\"%SYS_MODEL%\"}"

:: 10. Envío a Supabase (UPSERT)
curl -s -X POST "%URL%" ^
     -H "apikey: %KEY%" ^
     -H "Authorization: Bearer %KEY%" ^
     -H "Content-Type: application/json" ^
     -H "Prefer: resolution=merge-duplicates" ^
     -d "%PAYLOAD%" > nul 2>&1

echo  ----------------------------------------
echo  [ OK ] DATOS SINCRONIZADOS CON EXITO.
echo  ----------------------------------------
echo.
echo  Proceso terminado. Presiona una tecla...
pause > nul
