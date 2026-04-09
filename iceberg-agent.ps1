[CmdletBinding()]
param([switch]$Silent)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Write-Log {
    param([string]$Message, [ValidateSet("INFO", "WARN", "ERROR")][string]$Level = "INFO")
    $line = "[{0}] [{1}] {2}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Level, $Message
    try { Add-Content -Path $script:LogPath -Value $line -Encoding UTF8 -ErrorAction SilentlyContinue } catch {}
    if (-not $Silent) {
        $color = switch ($Level) { "INFO" { "Cyan" } "WARN" { "Yellow" } "ERROR" { "Red" } }
        Write-Host $Message -ForegroundColor $color
    }
}

function Clean-String {
    param([string]$InputString)
    if (-not $InputString) { return "" }
    return ($InputString -replace "\x00", "").Trim()
}

function Get-EnvValue {
    param([string]$Path, [string]$Key)
    if (-not (Test-Path $Path)) { return $null }
    try {
        $lines = Get-Content $Path -ErrorAction SilentlyContinue
        foreach ($l in $lines) {
            $cl = Clean-String ($l -replace '[^\x20-\x7E]', '')
            if ($cl -match "^\s*$Key\s*=\s*(.*)$") {
                return Clean-String $matches[1].Trim('"').Trim("'")
            }
        }
    } catch {}
    return $null
}

function Get-MonitorDetails {
    try {
        $monitors = Get-CimInstance -Namespace root\wmi -ClassName WmiMonitorID -ErrorAction SilentlyContinue
        if (-not $monitors) { return "Monitor Standard" }
        $results = foreach ($m in $monitors) {
            $nameChars = $m.UserFriendlyName | Where-Object { $_ -ne 0 }
            $serialChars = $m.SerialNumberID | Where-Object { $_ -ne 0 }
            
            $name = if ($nameChars) { Clean-String (([char[]]$nameChars) -join "") } else { "Generic Monitor" }
            $serial = if ($serialChars) { Clean-String (([char[]]$serialChars) -join "") } else { "N/A" }
            
            "Modelo: $name | S/N: $serial"
        }
        return ($results -join "`n")
    } catch { return "Conectado" }
}

$ScriptDir = Split-Path -Parent $PSCommandPath
$DotEnvPath = Join-Path $ScriptDir ".env"
$script:LogPath = Join-Path $ScriptDir "iceberg-agent.log"

if (-not $Silent) {
    Write-Host "`n[ ICEBERG IT :: Agente v4.7 :: UTF8 Fix ]" -ForegroundColor Cyan
    Write-Host "------------------------------------------"
}

try {
    $uEnv = Get-EnvValue -Path $DotEnvPath -Key "VITE_SUPABASE_URL"
    $kEnv = Get-EnvValue -Path $DotEnvPath -Key "VITE_SUPABASE_ANON_KEY"
    
    $FinalURL = ($uEnv.TrimEnd("/") + "/rest/v1/equipos?on_conflict=hostname").Replace(" ", "")
    $Key = $kEnv

    if (-not $Key -or $Key -eq "TU_KEY_AQUI") {
        throw "La API Key no es valida. Revisa el archivo .env en la ruta de red."
    }

    Write-Log "PC: $env:COMPUTERNAME | Analizando red..."

    try {
        $EthIP = Get-NetIPAddress -InterfaceAlias "Ethernet" -AddressFamily IPv4 -ErrorAction SilentlyContinue | 
                 Where-Object { $_.IPAddress -notlike '169.254*' } | Select-Object -ExpandProperty IPAddress -First 1
        if ($EthIP) {
            $IP = $EthIP
            $NetAdapter = Get-NetAdapter -Name "Ethernet" -ErrorAction SilentlyContinue
            $MAC = if ($NetAdapter) { ($NetAdapter.MacAddress -replace '-', ':') } else { "N/A" }
            Write-Log "Detectado adaptador Ethernet literal: $IP"
        }
    } catch {}

    if (-not $IP) {
        try {
            $PrimaryInterfaceIndex = Get-NetRoute -DestinationPrefix "0.0.0.0/0" | Sort-Object RouteMetric | Select-Object -ExpandProperty InterfaceIndex -First 1
            if ($PrimaryInterfaceIndex) {
                $IP = (Get-NetIPAddress -InterfaceIndex $PrimaryInterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty IPAddress -First 1)
                $NetAdapter = Get-NetAdapter -InterfaceIndex $PrimaryInterfaceIndex -ErrorAction SilentlyContinue
                $MAC = if ($NetAdapter) { ($NetAdapter.MacAddress -replace '-', ':') } else { "N/A" }
            }
        } catch {}
    }

    if (-not $IP) {
        $IPAddressObj = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
            $_.IPAddress -notlike '169.254*' -and 
            ($_.InterfaceAlias -like '*Ethernet*' -or $_.InterfaceAlias -like '*Área local*' -or $_.InterfaceAlias -like '*Wi-Fi*')
        } | Select-Object -First 1
        $IP = if ($IPAddressObj) { $IPAddressObj.IPAddress } else { "0.0.0.0" }
        
        if (-not $MAC -or $MAC -eq "N/A") {
            $NetAdapter = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Sort-Object InterfaceMetric | Select-Object -First 1
            $MAC = if ($NetAdapter) { ($NetAdapter.MacAddress -replace '-', ':') } else { "N/A" }
        }
    }
    
    $CPU = Get-CimInstance Win32_Processor -EA SilentlyContinue
    $OS = Get-CimInstance Win32_OperatingSystem -EA SilentlyContinue
    $Sys = Get-CimInstance Win32_ComputerSystem -EA SilentlyContinue
    $Bios = Get-CimInstance Win32_Bios -EA SilentlyContinue
    $Disk = Get-CimInstance Win32_DiskDrive -EA SilentlyContinue | Select -First 1
    $C = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'" -EA SilentlyContinue

    $RawSerial = Clean-String $Bios.SerialNumber
    $Serial = if (@("System Serial Number", "0", "None", "", "N/A").Contains($RawSerial)) { "GENERIC-$env:COMPUTERNAME" } else { $RawSerial }

    $Data = @{
        hostname = Clean-String $env:COMPUTERNAME
        username = Clean-String $env:USERNAME
        ip_local = if ($IP) { Clean-String $IP } else { "0.0.0.0" }
        ip_publica = "Local"
        mac_address = Clean-String $MAC
        caracteristicas_pc = Clean-String ($CPU.Name -replace '\s+', ' ')
        monitores = Clean-String (Get-MonitorDetails)
        numero_serie = Clean-String $Serial
        marca_pc = Clean-String $Sys.Manufacturer
        es_escritorio = -not [bool](Get-CimInstance Win32_Battery -EA SilentlyContinue)
        es_laptop = [bool](Get-CimInstance Win32_Battery -EA SilentlyContinue)
        memoria_ram = if ($Sys.TotalPhysicalMemory) { "$([math]::round($Sys.TotalPhysicalMemory / 1GB)) GB" } else { "N/A" }
        sistema_operativo = Clean-String $OS.Caption
        disco = if ($Disk.Model) { "$([math]::round($C.Size / 1GB)) GB ($($Disk.Model.Trim()))" } else { "N/A" }
        modelo = Clean-String $Sys.Model
    }

    $headers = @{ 
        "apikey" = $Key
        "Authorization" = "Bearer $Key"
        "Prefer" = "resolution=merge-duplicates"
        "Content-Type" = "application/json"
    }

    $Payload = $Data | ConvertTo-Json -Compress
    
    try {
        Invoke-RestMethod -Uri $FinalURL -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($Payload)) -ErrorAction Stop
        Write-Log "Sincronizacion Exitosa."
    } catch {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorResponse = $reader.ReadToEnd()
        Write-Log "ERROR DB: $errorResponse" "ERROR"
        throw $_.Exception
    }

    exit 0
} catch {
    Write-Log "FALLO CRITICO: $($_.Exception.Message)" "ERROR"
    exit 1
}
