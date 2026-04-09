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

function Get-EnvValue {
    param([string]$Path, [string]$Key)
    if (-not (Test-Path $Path)) { return $null }
    try {
        $lines = Get-Content $Path -ErrorAction SilentlyContinue
        foreach ($l in $lines) {
            $cl = $l -replace '[^\x20-\x7E]', ''
            if ($cl -match "^\s*$Key\s*=\s*(.*)$") {
                return $matches[1].Trim().Trim('"').Trim("'").Trim()
            }
        }
    } catch {}
    return $null
}

function Get-MonitorDetails {
    try {
        $monitors = Get-CimInstance -Namespace root\wmi -ClassName WmiMonitorID -ErrorAction SilentlyContinue
        if (-not $monitors) { return "Monitor Standar" }
        $results = foreach ($m in $monitors) {
            $name = (($m.UserFriendlyName | ForEach-Object { [char]$_ }) -join "").Trim()
            $serial = (($m.SerialNumberID | ForEach-Object { [char]$_ }) -join "").Trim()
            $modelStr = if ($name) { $name } else { "Generic Monitor" }
            $serialStr = if ($serial) { $serial } else { "N/A" }
            "Modelo: $modelStr | S/N: $serialStr"
        }
        return ($results -join "`n")
    } catch { return "Conectado" }
}

$ScriptDir = Split-Path -Parent $PSCommandPath
$DotEnvPath = Join-Path $ScriptDir ".env"
$script:LogPath = Join-Path $ScriptDir "iceberg-agent.log"

if (-not $Silent) {
    Write-Host "`n[ ICEBERG IT :: Agente v4.6 :: Bugfix ]" -ForegroundColor Cyan
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

    Write-Log "PC: $env:COMPUTERNAME | Analizando hardware..."

    $IP = (Get-NetIPAddress -AddressFamily IPv4 | Where { $_.IPAddress -notlike '169.254*' -and $_.InterfaceAlias -notlike '*Loopback*' } | Select -Expand IPAddress -First 1)
    $MAC = if (Get-NetAdapter | Where { $_.Status -eq 'Up' }) { ((Get-NetAdapter | Where { $_.Status -eq 'Up' } | Select -Expand MacAddress -First 1) -replace '-', ':') } else { "N/A" }
    
    $CPU = Get-CimInstance Win32_Processor -EA SilentlyContinue
    $OS = Get-CimInstance Win32_OperatingSystem -EA SilentlyContinue
    $Sys = Get-CimInstance Win32_ComputerSystem -EA SilentlyContinue
    $Bios = Get-CimInstance Win32_Bios -EA SilentlyContinue
    $Disk = Get-CimInstance Win32_DiskDrive -EA SilentlyContinue | Select -First 1
    $C = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'" -EA SilentlyContinue

    $RawSerial = if ($Bios.SerialNumber) { $Bios.SerialNumber.Trim() } else { "N/A" }
    $Serial = if (@("System Serial Number", "0", "None", "").Contains($RawSerial)) { "GENERIC-$env:COMPUTERNAME" } else { $RawSerial }

    $Data = @{
        hostname = $env:COMPUTERNAME
        username = $env:USERNAME
        ip_local = if ($IP) { $IP } else { "0.0.0.0" }
        ip_publica = "Local"
        mac_address = $MAC
        caracteristicas_pc = ($CPU.Name -replace '\s+', ' ').Trim()
        monitores = Get-MonitorDetails
        numero_serie = $Serial
        marca_pc = $Sys.Manufacturer
        es_escritorio = -not [bool](Get-CimInstance Win32_Battery -EA SilentlyContinue)
        es_laptop = [bool](Get-CimInstance Win32_Battery -EA SilentlyContinue)
        memoria_ram = if ($Sys.TotalPhysicalMemory) { "$([math]::round($Sys.TotalPhysicalMemory / 1GB)) GB" } else { "N/A" }
        sistema_operativo = $OS.Caption
        disco = if ($Disk.Model) { "$([math]::round($C.Size / 1GB)) GB ($($Disk.Model.Trim()))" } else { "N/A" }
        modelo = $Sys.Model
    }

    $headers = @{ 
        "apikey" = $Key
        "Authorization" = "Bearer $Key"
        "Prefer" = "resolution=merge-duplicates"
        "Content-Type" = "application/json"
    }

    $Payload = $Data | ConvertTo-Json -Compress
    
    try {
        Invoke-RestMethod -Uri $FinalURL -Method Post -Headers $headers -Body $Payload -ErrorAction Stop
        Write-Log "Sincronizacion Exitosa."
    } catch {
        # CAPTURA EL ERROR REAL DE SUPABASE
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
