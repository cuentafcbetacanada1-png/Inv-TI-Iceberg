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

function Invoke-WithRetry {
    param([scriptblock]$Action, [int]$MaxRetries = 3, [int]$DelaySeconds = 2)
    $attempt = 1
    while ($attempt -le $MaxRetries) {
        try { return & $Action } catch {
            if ($attempt -ge $MaxRetries) { throw }
            Write-Log "Intento $attempt fallido..." "WARN"
            Start-Sleep -Seconds $DelaySeconds
            $attempt++
        }
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
            $name = ($m.UserFriendlyName | ForEach-Object { [char]$_ }) -join ""
            $serial = ($m.SerialNumberID | ForEach-Object { [char]$_ }) -join ""
            
            $modelStr = if ($name.Trim()) { $name.Trim() } else { "Modelo Genérico" }
            $serialStr = if ($serial.Trim()) { $serial.Trim() } else { "S/N Desconocido" }
            
            "Modelo: $modelStr | S/N: $serialStr"
        }
        return ($results -join "`n")
    } catch {
        return "Conectado"
    }
}

$ScriptDir = Split-Path -Parent $PSCommandPath
$DotEnvPath = Join-Path $ScriptDir ".env"
$script:LogPath = Join-Path $ScriptDir "iceberg-agent.log"

if (-not $Silent) {
    Write-Host "`n[ ICEBERG IT :: Agente v4.5 :: Monitor Sync ]" -ForegroundColor Cyan
    Write-Host "------------------------------------------"
}

try {
    $BASE_DOMAIN = "https://xgyovzjguphckcsalxex.supabase.co"
    $uEnv = Get-EnvValue -Path $DotEnvPath -Key "VITE_SUPABASE_URL"
    $kEnv = Get-EnvValue -Path $DotEnvPath -Key "VITE_SUPABASE_ANON_KEY"
    $mEnv = [Environment]::GetEnvironmentVariable("ICEBERG_SUPABASE_KEY", "Machine")
    
    $SelectedURL = if ($uEnv) { $uEnv.TrimEnd("/") } else { $BASE_DOMAIN }
    $FinalURL = ($SelectedURL + "/rest/v1/equipos?on_conflict=hostname").Replace(" ", "")
    
    $Key = if ($kEnv) { $kEnv } elseif ($mEnv) { $mEnv } else { "TU_KEY_AQUI" }

    Write-Log "Analizando Monitores y Hardware..."
    
    $IP = (Get-NetIPAddress -AddressFamily IPv4 | Where { $_.IPAddress -notlike '169.254*' -and $_.InterfaceAlias -notlike '*Loopback*' } | Select -Expand IPAddress -First 1)
    $MAC = if (Get-NetAdapter | Where { $_.Status -eq 'Up' }) { ((Get-NetAdapter | Where { $_.Status -eq 'Up' } | Select -Expand MacAddress -First 1) -replace '-', ':') } else { "N/A" }
    
    $CPU = Get-CimInstance Win32_Processor -EA SilentlyContinue
    $OS = Get-CimInstance Win32_OperatingSystem -EA SilentlyContinue
    $Sys = Get-CimInstance Win32_ComputerSystem -EA SilentlyContinue
    $Bios = Get-CimInstance Win32_Bios -EA SilentlyContinue
    $Disk = Get-CimInstance Win32_DiskDrive -EA SilentlyContinue | Select -First 1
    $C = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'" -EA SilentlyContinue
    $MonitorInfo = Get-MonitorDetails

    $RawSerial = if ($Bios.SerialNumber) { $Bios.SerialNumber.Trim() } else { "N/A" }
    $GenericSerials = @("System Serial Number", "To be filled by O.E.M.", "0", "None", "Default string", "")
    $Serial = if ($GenericSerials -contains $RawSerial) { "GENERIC-$env:COMPUTERNAME" } else { $RawSerial }

    $Data = @{
        hostname = $env:COMPUTERNAME
        username = $env:USERNAME
        ip_local = if ($IP) { $IP } else { "0.0.0.0" }
        ip_publica = "Local"
        mac_address = $MAC
        caracteristicas_pc = ($CPU.Name -replace '\s+', ' ').Trim()
        monitores = $MonitorInfo
        numero_serie = $Serial
        marca_pc = $Sys.Manufacturer
        es_escritorio = -not [bool](Get-CimInstance Win32_Battery -EA SilentlyContinue)
        es_laptop = [bool](Get-CimInstance Win32_Battery -EA SilentlyContinue)
        memoria_ram = if ($Sys.TotalPhysicalMemory) { "$([math]::round($Sys.TotalPhysicalMemory / 1GB)) GB" } else { "N/A" }
        sistema_operativo = $OS.Caption
        disco = if ($Disk.Model) { "$([math]::round($C.Size / 1GB)) GB ($($Disk.Model.Trim()))" } else { "N/A" }
        modelo = $Sys.Model
        updated_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    }

    $headers = @{ 
        "apikey" = $Key
        "Authorization" = "Bearer $Key"
        "Prefer" = "resolution=merge-duplicates"
        "Content-Type" = "application/json"
    }

    Invoke-WithRetry -Action {
        Invoke-RestMethod -Uri $FinalURL -Method Post -Headers $headers -Body ($Data | ConvertTo-Json -Compress) -ErrorAction Stop
    }

    Write-Log "Monitores sincronizados: $MonitorInfo"
    exit 0
} catch {
    Write-Log "FALLO: $($_.Exception.Message)" "ERROR"
    exit 1
}
