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
            Write-Log "Intento $attempt fallido (Reintentando...)" "WARN"
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

$ScriptDir = Split-Path -Parent $PSCommandPath
$DotEnvPath = Join-Path $ScriptDir ".env"
$script:LogPath = Join-Path $ScriptDir "iceberg-agent.log"

if (-not $Silent) { Write-Host "`n[ ICEBERG IT :: Agente v3.3 :: Resiliente ]" -ForegroundColor Cyan }

try {
    $BASE_DOMAIN = "https://xgyovzjguphckcsalxex.supabase.co"
    $uEnv = Get-EnvValue -Path $DotEnvPath -Key "VITE_SUPABASE_URL"
    $kEnv = Get-EnvValue -Path $DotEnvPath -Key "VITE_SUPABASE_ANON_KEY"
    $FinalURL = ((if ($uEnv) { $uEnv.TrimEnd("/") } else { $BASE_DOMAIN }) + "/rest/v1/equipos?on_conflict=hostname").Replace(" ", "")
    $Key = if ($kEnv) { $kEnv } else { "TU_ANON_KEY" }

    Write-Log "PC: $env:COMPUTERNAME | Conectando a Matriz..."

    # TELEMETRÍA BÁSICA
    $IP = (Get-NetIPAddress -AddressFamily IPv4 | Where { $_.IPAddress -notlike '169.254*' -and $_.InterfaceAlias -notlike '*Loopback*' } | Select -Expand IPAddress -First 1)
    $MAC = if (Get-NetAdapter | Where { $_.Status -eq 'Up' }) { ((Get-NetAdapter | Where { $_.Status -eq 'Up' } | Select -Expand MacAddress -First 1) -replace '-', ':') } else { "N/A" }
    
    $CPU = Get-CimInstance Win32_Processor -EA SilentlyContinue
    $OS = Get-CimInstance Win32_OperatingSystem -EA SilentlyContinue
    $Sys = Get-CimInstance Win32_ComputerSystem -EA SilentlyContinue
    $Disk = Get-CimInstance Win32_DiskDrive -EA SilentlyContinue | Select -First 1
    $C = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'" -EA SilentlyContinue

    $Data = @{
        hostname = $env:COMPUTERNAME
        username = $env:USERNAME
        ip_local = if ($IP) { $IP } else { "0.0.0.0" }
        ip_publica = "Desconocida" # Se llenará si el servidor acepta el campo
        mac_address = $MAC
        caracteristicas_pc = ($CPU.Name -replace '\s+', ' ').Trim()
        monitores = "Conectado"
        numero_serie = if ($Sys.SerialNumber) { $Sys.SerialNumber.Trim() } else { "GENERIC-$env:COMPUTERNAME" }
        marca_pc = $Sys.Manufacturer
        es_escritorio = -not [bool](Get-CimInstance Win32_Battery -EA SilentlyContinue)
        es_laptop = [bool](Get-CimInstance Win32_Battery -EA SilentlyContinue)
        memoria_ram = if ($Sys.TotalPhysicalMemory) { "$([math]::round($Sys.TotalPhysicalMemory / 1GB)) GB" } else { "N/A" }
        sistema_operativo = $OS.Caption
        disco = if ($Disk.Model) { "$([math]::round($C.Size / 1GB)) GB" } else { "N/A" }
        modelo = $Sys.Model
    }

    $headers = @{ "apikey" = $Key; "Authorization" = "Bearer $Key"; "Prefer" = "resolution=merge-duplicates" }

    try {
        # Intento 1: Telemetría Completa
        Invoke-RestMethod -Uri $FinalURL -Method Post -Headers $headers -Body ($Data | ConvertTo-Json -Compress) -ContentType "application/json; charset=utf-8"
        Write-Log "Sincronizacion completa exitosa."
    } catch {
        if ($_.Exception.Message -like "*(400)*") {
            Write-Log "Columnas nuevas no detectadas en DB. Enviando payload basico..." "WARN"
            $Basico = $Data.Clone()
            $Basico.Remove("ip_publica")
            $Basico.Remove("mac_address")
            Invoke-RestMethod -Uri $FinalURL -Method Post -Headers $headers -Body ($Basico | ConvertTo-Json -Compress) -ContentType "application/json; charset=utf-8"
            Write-Log "Sincronización básica exitosa (Ejecuta el SQL para soporte completo)."
        } else { throw }
    }

    exit 0
} catch {
    Write-Log "ERROR: $($_.Exception.Message)" "ERROR"
    exit 1
}
