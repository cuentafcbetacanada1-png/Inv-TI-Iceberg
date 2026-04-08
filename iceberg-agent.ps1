[CmdletBinding()]
param(
    [switch]$Silent
)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("INFO", "WARN", "ERROR")]
        [string]$Level = "INFO"
    )

    $line = "[{0}] [{1}] {2}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Level, $Message
    
    try {
        Add-Content -Path $script:LogPath -Value $line -ErrorAction Stop
    } catch {
        # Fallback si el share es de solo lectura o no hay permisos
        $tempDir = [System.IO.Path]::GetTempPath()
        $fallbackLog = Join-Path $tempDir "iceberg-agent-error.log"
        try { Add-Content -Path $fallbackLog -Value $line -ErrorAction SilentlyContinue } catch {}
    }

    if (-not $Silent) {
        switch ($Level) {
            "INFO" { Write-Host $Message -ForegroundColor Cyan }
            "WARN" { Write-Host $Message -ForegroundColor Yellow }
            "ERROR" { Write-Host $Message -ForegroundColor Red }
        }
    }
}

function Invoke-WithRetry {
    param(
        [scriptblock]$Action,
        [int]$MaxRetries = 3,
        [int]$DelaySeconds = 2
    )

    $attempt = 1
    while ($attempt -le $MaxRetries) {
        try {
            return & $Action
        } catch {
            if ($attempt -ge $MaxRetries) { throw }
            Write-Log "Reintento $attempt/$MaxRetries por error de red o API." "WARN"
            Start-Sleep -Seconds $DelaySeconds
            $attempt++
        }
    }
}

function Get-EnvValueFromFile {
    param(
        [string]$FilePath,
        [string]$KeyName
    )

    if (-not (Test-Path $FilePath)) { return $null }
    try {
        # Leer todo el texto y limpiar caracteres nulos o raros de codificacion
        $rawContent = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
        if ($null -eq $rawContent) { return $null }
        $content = $rawContent -replace "`0", "" -split "`r?`n"
        
        foreach ($line in $content) {
            if ($line -match "^\s*$KeyName\s*=\s*(.*)$") {
                $raw = $matches[1].Trim()
                # Quitar comillas si existen
                if ($raw -match '^["''](.*)["'']$') {
                    $raw = $matches[1]
                }
                # Limpiar cualquier caracter no imprimible al final
                return $raw.Trim().Trim("`t").Trim("`r").Trim("`n")
            }
        }
    } catch {}
    return $null
}

function Normalize-SupabaseUrl {
    param([string]$RawUrl)

    if ([string]::IsNullOrWhiteSpace($RawUrl)) { return $null }
    $clean = $RawUrl.Trim().Trim('"').Trim("'")
    $clean = $clean.TrimEnd("/")

    if ($clean -match "/rest/v1/equipos$") {
        return $clean
    }

    return "$clean/rest/v1/equipos"
}

function Test-SupabaseKey {
    param(
        [string]$BaseUrl,
        [string]$Key
    )

    if ([string]::IsNullOrWhiteSpace($BaseUrl) -or [string]::IsNullOrWhiteSpace($Key)) { return $false }
    try {
        # Probar directamente contra la tabla equipos con limit=0
        $testUrl = if ($BaseUrl -match "\?") { "$BaseUrl&limit=0" } else { "$BaseUrl?limit=0" }
        Invoke-RestMethod -Uri $testUrl -Method Get -Headers @{
            "apikey" = $Key
            "Authorization" = "Bearer $Key"
        } -ErrorAction Stop | Out-Null
        return $true
    } catch {
        if ($_.Exception.Message -like "*(401)*") { return $false }
        return $true 
    }
}

function Get-MonitorNames {
    try {
        $monitorIds = Get-CimInstance -Namespace "root\wmi" -ClassName "WmiMonitorID" -ErrorAction SilentlyContinue
        if (-not $monitorIds) { return "Monitor Interno / No detectable" }

        $results = @()
        foreach ($m in $monitorIds) {
            # Decodificar Modelo
            $nameChars = $m.UserFriendlyName | Where-Object { $_ -gt 0 } | ForEach-Object { [char]$_ }
            $name = (-join $nameChars).Trim()
            
            # Decodificar Serial
            $serialChars = $m.SerialNumberID | Where-Object { $_ -gt 0 } | ForEach-Object { [char]$_ }
            $serial = (-join $serialChars).Trim()
            
            if ([string]::IsNullOrWhiteSpace($name)) { $name = "Genérico" }
            $results += "Modelo: $name | S/N: $serial"
        }

        if ($results.Count -eq 0) { return "Monitor Genérico" }
        return ($results -join "`n")
    } catch {
        return "No detectable"
    }
}

$ScriptDir = Split-Path -Parent $PSCommandPath
$DotEnvPath = Join-Path $ScriptDir ".env"
$LogPath = Join-Path $ScriptDir "iceberg-agent.log"
$script:LogPath = $LogPath

if (-not $Silent) {
    Write-Host "`n[ ICEBERG IT :: Escaneando Sistema ]" -ForegroundColor Cyan
    Write-Host "----------------------------------------"
}

try {
    $DefaultSupabaseUrl = "https://xgyovzjguphckcsalxex.supabase.co"

    $urlFromEnvFile = Get-EnvValueFromFile -FilePath $DotEnvPath -KeyName "VITE_SUPABASE_URL"
    $keyFromEnvFile = Get-EnvValueFromFile -FilePath $DotEnvPath -KeyName "VITE_SUPABASE_ANON_KEY"
    $URL = if (-not [string]::IsNullOrWhiteSpace($env:ICEBERG_SUPABASE_URL)) {
        Normalize-SupabaseUrl -RawUrl $env:ICEBERG_SUPABASE_URL
    } elseif (-not [string]::IsNullOrWhiteSpace($urlFromEnvFile)) {
        Normalize-SupabaseUrl -RawUrl $urlFromEnvFile
    } else {
        Normalize-SupabaseUrl -RawUrl $DefaultSupabaseUrl
    }
    $KeyCandidates = @(
        $keyFromEnvFile,
        $env:ICEBERG_SUPABASE_KEY
    ) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | Select-Object -Unique

    if (-not $KeyCandidates -or $KeyCandidates.Count -eq 0) {
        throw "Falta clave de Supabase. Define VITE_SUPABASE_ANON_KEY en .env o ICEBERG_SUPABASE_KEY."
    }

    $ValidatedKeys = $KeyCandidates 
    Write-Log "Iniciando proceso de sincronizacion..."

    $Hostname = $env:COMPUTERNAME
    $Username = $env:USERNAME
    $IP = Get-NetIPAddress -ErrorAction SilentlyContinue |
        Where-Object { $_.AddressFamily -eq 'IPv4' -and $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.254*' } |
        Select-Object -ExpandProperty IPAddress -First 1

    $Bios = Get-CimInstance Win32_Bios -ErrorAction SilentlyContinue
    $SysInfo = Get-CimInstance Win32_ComputerSystem -ErrorAction SilentlyContinue
    $CPU = Get-CimInstance Win32_Processor -ErrorAction SilentlyContinue
    $OS = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
    $Disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'" -ErrorAction SilentlyContinue

    $Serial = if ($Bios.SerialNumber) { $Bios.SerialNumber.Trim() } else { "N/A" }
    if (@("To be filled by O.E.M.", "System Serial Number", "0", "None", "") -contains $Serial) {
        $Serial = "GENERIC-$Hostname"
    }

    $Model = if ($SysInfo.Model) { $SysInfo.Model.Trim() } else { "N/A" }
    $DiskGB = if ($Disk.Size) { "$([math]::round($Disk.Size / 1GB)) GB" } else { "N/A" }
    $RamGB = if ($SysInfo.TotalPhysicalMemory) { "$([math]::round($SysInfo.TotalPhysicalMemory / 1GB)) GB" } else { "N/A" }
    $IsLaptop = [bool](Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue)
    $MonitorNames = Get-MonitorNames
    if ([string]::IsNullOrWhiteSpace($IP)) { $IP = "0.0.0.0" }

    $PayloadObj = @{
        hostname = $Hostname
        username = $Username
        ip_local = $IP
        caracteristicas_pc = $CPU.Name
        monitores = $MonitorNames
        numero_serie = $Serial
        marca_pc = $SysInfo.Manufacturer
        es_escritorio = -not $IsLaptop
        es_laptop = $IsLaptop
        memoria_ram = $RamGB
        sistema_operativo = $OS.Caption
        disco = $DiskGB
        modelo = $Model
        validado = $true
    }

    $PayloadJson = $PayloadObj | ConvertTo-Json -Compress
    $uriBuilder = [System.UriBuilder]::new($URL)
    $existingQuery = $uriBuilder.Query.TrimStart("?")
    $uriBuilder.Query = if ([string]::IsNullOrWhiteSpace($existingQuery)) { "on_conflict=hostname" } else { "$existingQuery&on_conflict=hostname" }
    $UpsertUrl = $uriBuilder.Uri.AbsoluteUri
    Write-Log "Enviando inventario de $Hostname a Supabase."
    $synced = $false
    foreach ($KEY in $ValidatedKeys) {
        $headers = @{
            "apikey" = $KEY
            "Authorization" = "Bearer $KEY"
            "Prefer" = "resolution=merge-duplicates"
        }
        try {
            Invoke-WithRetry -Action {
                Invoke-RestMethod -Uri $UpsertUrl -Method Post -Headers $headers -Body $PayloadJson -ContentType "application/json; charset=utf-8" -ErrorAction Stop | Out-Null
            } -MaxRetries 3 -DelaySeconds 2
            $synced = $true
            break
        } catch {
            if ($_.Exception.Message -like "*(400)*") {
                Write-Log "Fallback: columna 'monitores' no disponible, enviando payload base." "WARN"
                $PayloadObj.Remove("monitores") | Out-Null
                $PayloadJson = $PayloadObj | ConvertTo-Json -Compress
                Invoke-WithRetry -Action {
                    Invoke-RestMethod -Uri $UpsertUrl -Method Post -Headers $headers -Body $PayloadJson -ContentType "application/json; charset=utf-8" -ErrorAction Stop | Out-Null
                } -MaxRetries 2 -DelaySeconds 2
                $synced = $true
                break
            }
            if ($_.Exception.Message -like "*(401)*") {
                Write-Log "Key rechazada (401). Probando siguiente credencial..." "WARN"
                continue
            }
            throw
        }
    }
    if (-not $synced) { throw "No se pudo autenticar con ninguna credencial disponible (401)." }

    Write-Log "Sincronizacion completada correctamente."
    exit 0
} catch {
    Write-Log "Fallo en el proceso: $($_.Exception.Message)" "ERROR"
    exit 1
} finally {
    if (-not $Silent) {
        Write-Host "`nProceso terminado. Revisa el log en: $LogPath"
    }
}
