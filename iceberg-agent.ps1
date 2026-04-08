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
    Add-Content -Path $script:LogPath -Value $line
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
    $match = Select-String -Path $FilePath -Pattern ("^{0}=(.*)$" -f [regex]::Escape($KeyName)) -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $match) { return $null }
    return $match.Matches[0].Groups[1].Value.Trim()
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

function Get-MonitorNames {
    try {
        $monitorIds = Get-CimInstance -Namespace "root\wmi" -ClassName "WmiMonitorID" -ErrorAction SilentlyContinue
        if (-not $monitorIds) { return "N/A" }

        $names = @()
        foreach ($m in $monitorIds) {
            $chars = $m.UserFriendlyName | Where-Object { $_ -gt 0 } | ForEach-Object { [char]$_ }
            $name = (-join $chars).Trim()
            if (-not [string]::IsNullOrWhiteSpace($name) -and $name -ne "0") {
                $names += $name
            }
        }

        $names = $names | Select-Object -Unique
        if (-not $names -or $names.Count -eq 0) { return "N/A" }
        return ($names -join ", ")
    } catch {
        return "N/A"
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
    $urlFromEnvFile = Get-EnvValueFromFile -FilePath $DotEnvPath -KeyName "VITE_SUPABASE_URL"
    $keyFromEnvFile = Get-EnvValueFromFile -FilePath $DotEnvPath -KeyName "VITE_SUPABASE_ANON_KEY"
    $URL = if (-not [string]::IsNullOrWhiteSpace($env:ICEBERG_SUPABASE_URL)) {
        Normalize-SupabaseUrl -RawUrl $env:ICEBERG_SUPABASE_URL
    } elseif (-not [string]::IsNullOrWhiteSpace($urlFromEnvFile)) {
        Normalize-SupabaseUrl -RawUrl $urlFromEnvFile
    } else {
        "https://xgyovzjguphckcsalxex.supabase.co/rest/v1/equipos"
    }
    $KEY = if ($env:ICEBERG_SUPABASE_KEY) { $env:ICEBERG_SUPABASE_KEY } else { $keyFromEnvFile }

    if ([string]::IsNullOrWhiteSpace($KEY)) { throw "Falta clave de Supabase. Usa variable ICEBERG_SUPABASE_KEY o define VITE_SUPABASE_ANON_KEY en .env." }

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
    }

    $PayloadJson = $PayloadObj | ConvertTo-Json -Compress
    $uriBuilder = [System.UriBuilder]::new($URL)
    $existingQuery = $uriBuilder.Query.TrimStart("?")
    $uriBuilder.Query = if ([string]::IsNullOrWhiteSpace($existingQuery)) { "on_conflict=hostname" } else { "$existingQuery&on_conflict=hostname" }
    $UpsertUrl = $uriBuilder.Uri.AbsoluteUri
    $headers = @{
        "apikey" = $KEY
        "Authorization" = "Bearer $KEY"
        "Prefer" = "resolution=merge-duplicates"
    }

    Write-Log "Enviando inventario de $Hostname a Supabase."
    try {
        Invoke-WithRetry -Action {
            Invoke-RestMethod -Uri $UpsertUrl -Method Post -Headers $headers -Body $PayloadJson -ContentType "application/json; charset=utf-8" -ErrorAction Stop | Out-Null
        } -MaxRetries 3 -DelaySeconds 2
    } catch {
        if ($_.Exception.Message -like "*(400)*") {
            Write-Log "Fallback: columna 'monitores' no disponible, enviando payload base." "WARN"
            $PayloadObj.Remove("monitores") | Out-Null
            $PayloadJson = $PayloadObj | ConvertTo-Json -Compress
            Invoke-WithRetry -Action {
                Invoke-RestMethod -Uri $UpsertUrl -Method Post -Headers $headers -Body $PayloadJson -ContentType "application/json; charset=utf-8" -ErrorAction Stop | Out-Null
            } -MaxRetries 2 -DelaySeconds 2
        } else {
            throw
        }
    }

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


# SIG # Begin signature block
# MIIcDgYJKoZIhvcNAQcCoIIb/zCCG/sCAQExDzANBglghkgBZQMEAgEFADB5Bgor
# BgEEAYI3AgEEoGswaTA0BgorBgEEAYI3AgEeMCYCAwEAAAQQH8w7YFlLCE63JNLG
# KX7zUQIBAAIBAAIBAAIBAAIBADAxMA0GCWCGSAFlAwQCAQUABCCQtY5A29dDtTb3
# IrB74AQLRBWRHxi24GQGvAKi3jlizaCCFlIwggMUMIIB/KADAgECAhAUEbL5pxKJ
# gU4eeVZr6cmyMA0GCSqGSIb3DQEBCwUAMCIxIDAeBgNVBAMMF0ljZWJlcmcgSVQg
# Q29kZSBTaWduaW5nMB4XDTI2MDQwODE0MDIxOVoXDTI3MDQwODE0MjIxOVowIjEg
# MB4GA1UEAwwXSWNlYmVyZyBJVCBDb2RlIFNpZ25pbmcwggEiMA0GCSqGSIb3DQEB
# AQUAA4IBDwAwggEKAoIBAQDJcPZd/1JfeY5Rc8X0PdGLW1IMQo6Of4WLo8FREcWF
# ZYygY0lvIdcHj/AXx0PiQzM4O6RqiAN+6VUyoUEl0TAo3siLoqa8yQDUWKVCTD4o
# kF7x/BTfTJ/hv2fI2b3FZbiU57O4LjVCJrbGcJNIVu8LiXb1IcR4sfg2N7c9HiFG
# FSTcj91emEZXWtJPEG2cgynYpxT8WuqnczoTSFfZFcrbKVz0201Z2Mzx2zfs+HZD
# c8MFwTkxqYNL/Lp8VWQmQHTIf+PJmKdvz5BAWQhD6e7pUhLaJluBex0grKsyF/kD
# ylPNqpyQ1FmLxyIV+V2ViAWdZD9dbA8j+TaKu6bkbvGNAgMBAAGjRjBEMA4GA1Ud
# DwEB/wQEAwIHgDATBgNVHSUEDDAKBggrBgEFBQcDAzAdBgNVHQ4EFgQUpcgnKkev
# WUpDNIkUsNXXp65ciCcwDQYJKoZIhvcNAQELBQADggEBADuYw+UK4lsGs5FUd0f+
# VLb9AEB223hrLJRbhSLQ6vFod46gczt5ZTZTt6m7VTd3Y1dRiVXMnxgcDKhAnvLR
# wB4prM7yWgBeoLVSfM0XZuM4hD+6j+/a9VJaeSdJuw80k1S06OEZRDtu9HbbLM2S
# jzRpgTIYxUF91lLhn6L8P5q/am3p4knpKN4SBKo0xtATG+GJuBfVyehzte9Ul4oG
# uVE/j2mjXH80IcYQceaJtJPbZU/5ITobJxZiRnOpegY/QzmrAPIZ8YEHYXey+5fY
# wJV4bVlot0OitXrC3NndK+ei+W3JKgZj2PZ9G2dhtNN3qEhXBSeQsCxQxSOToRZk
# hiQwggWNMIIEdaADAgECAhAOmxiO+dAt5+/bUOIIQBhaMA0GCSqGSIb3DQEBDAUA
# MGUxCzAJBgNVBAYTAlVTMRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsT
# EHd3dy5kaWdpY2VydC5jb20xJDAiBgNVBAMTG0RpZ2lDZXJ0IEFzc3VyZWQgSUQg
# Um9vdCBDQTAeFw0yMjA4MDEwMDAwMDBaFw0zMTExMDkyMzU5NTlaMGIxCzAJBgNV
# BAYTAlVTMRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdp
# Y2VydC5jb20xITAfBgNVBAMTGERpZ2lDZXJ0IFRydXN0ZWQgUm9vdCBHNDCCAiIw
# DQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAL/mkHNo3rvkXUo8MCIwaTPswqcl
# LskhPfKK2FnC4SmnPVirdprNrnsbhA3EMB/zG6Q4FutWxpdtHauyefLKEdLkX9YF
# PFIPUh/GnhWlfr6fqVcWWVVyr2iTcMKyunWZanMylNEQRBAu34LzB4TmdDttceIt
# DBvuINXJIB1jKS3O7F5OyJP4IWGbNOsFxl7sWxq868nPzaw0QF+xembud8hIqGZX
# V59UWI4MK7dPpzDZVu7Ke13jrclPXuU15zHL2pNe3I6PgNq2kZhAkHnDeMe2scS1
# ahg4AxCN2NQ3pC4FfYj1gj4QkXCrVYJBMtfbBHMqbpEBfCFM1LyuGwN1XXhm2Tox
# RJozQL8I11pJpMLmqaBn3aQnvKFPObURWBf3JFxGj2T3wWmIdph2PVldQnaHiZdp
# ekjw4KISG2aadMreSx7nDmOu5tTvkpI6nj3cAORFJYm2mkQZK37AlLTSYW3rM9nF
# 30sEAMx9HJXDj/chsrIRt7t/8tWMcCxBYKqxYxhElRp2Yn72gLD76GSmM9GJB+G9
# t+ZDpBi4pncB4Q+UDCEdslQpJYls5Q5SUUd0viastkF13nqsX40/ybzTQRESW+UQ
# UOsxxcpyFiIJ33xMdT9j7CFfxCBRa2+xq4aLT8LWRV+dIPyhHsXAj6KxfgommfXk
# aS+YHS312amyHeUbAgMBAAGjggE6MIIBNjAPBgNVHRMBAf8EBTADAQH/MB0GA1Ud
# DgQWBBTs1+OC0nFdZEzfLmc/57qYrhwPTzAfBgNVHSMEGDAWgBRF66Kv9JLLgjEt
# UYunpyGd823IDzAOBgNVHQ8BAf8EBAMCAYYweQYIKwYBBQUHAQEEbTBrMCQGCCsG
# AQUFBzABhhhodHRwOi8vb2NzcC5kaWdpY2VydC5jb20wQwYIKwYBBQUHMAKGN2h0
# dHA6Ly9jYWNlcnRzLmRpZ2ljZXJ0LmNvbS9EaWdpQ2VydEFzc3VyZWRJRFJvb3RD
# QS5jcnQwRQYDVR0fBD4wPDA6oDigNoY0aHR0cDovL2NybDMuZGlnaWNlcnQuY29t
# L0RpZ2lDZXJ0QXNzdXJlZElEUm9vdENBLmNybDARBgNVHSAECjAIMAYGBFUdIAAw
# DQYJKoZIhvcNAQEMBQADggEBAHCgv0NcVec4X6CjdBs9thbX979XB72arKGHLOyF
# XqkauyL4hxppVCLtpIh3bb0aFPQTSnovLbc47/T/gLn4offyct4kvFIDyE7QKt76
# LVbP+fT3rDB6mouyXtTP0UNEm0Mh65ZyoUi0mcudT6cGAxN3J0TU53/oWajwvy8L
# punyNDzs9wPHh6jSTEAZNUZqaVSwuKFWjuyk1T3osdz9HNj0d1pcVIxv76FQPfx2
# CWiEn2/K2yCNNWAcAgPLILCsWKAOQGPFmCLBsln1VWvPJ6tsds5vIy30fnFqI2si
# /xK4VC0nftg62fC2h5b9W9FcrBjDTZ9ztwGpn1eqXijiuZQwgga0MIIEnKADAgEC
# AhANx6xXBf8hmS5AQyIMOkmGMA0GCSqGSIb3DQEBCwUAMGIxCzAJBgNVBAYTAlVT
# MRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5j
# b20xITAfBgNVBAMTGERpZ2lDZXJ0IFRydXN0ZWQgUm9vdCBHNDAeFw0yNTA1MDcw
# MDAwMDBaFw0zODAxMTQyMzU5NTlaMGkxCzAJBgNVBAYTAlVTMRcwFQYDVQQKEw5E
# aWdpQ2VydCwgSW5jLjFBMD8GA1UEAxM4RGlnaUNlcnQgVHJ1c3RlZCBHNCBUaW1l
# U3RhbXBpbmcgUlNBNDA5NiBTSEEyNTYgMjAyNSBDQTEwggIiMA0GCSqGSIb3DQEB
# AQUAA4ICDwAwggIKAoICAQC0eDHTCphBcr48RsAcrHXbo0ZodLRRF51NrY0NlLWZ
# loMsVO1DahGPNRcybEKq+RuwOnPhof6pvF4uGjwjqNjfEvUi6wuim5bap+0lgloM
# 2zX4kftn5B1IpYzTqpyFQ/4Bt0mAxAHeHYNnQxqXmRinvuNgxVBdJkf77S2uPoCj
# 7GH8BLuxBG5AvftBdsOECS1UkxBvMgEdgkFiDNYiOTx4OtiFcMSkqTtF2hfQz3zQ
# Sku2Ws3IfDReb6e3mmdglTcaarps0wjUjsZvkgFkriK9tUKJm/s80FiocSk1VYLZ
# lDwFt+cVFBURJg6zMUjZa/zbCclF83bRVFLeGkuAhHiGPMvSGmhgaTzVyhYn4p0+
# 8y9oHRaQT/aofEnS5xLrfxnGpTXiUOeSLsJygoLPp66bkDX1ZlAeSpQl92QOMeRx
# ykvq6gbylsXQskBBBnGy3tW/AMOMCZIVNSaz7BX8VtYGqLt9MmeOreGPRdtBx3yG
# OP+rx3rKWDEJlIqLXvJWnY0v5ydPpOjL6s36czwzsucuoKs7Yk/ehb//Wx+5kMqI
# MRvUBDx6z1ev+7psNOdgJMoiwOrUG2ZdSoQbU2rMkpLiQ6bGRinZbI4OLu9BMIFm
# 1UUl9VnePs6BaaeEWvjJSjNm2qA+sdFUeEY0qVjPKOWug/G6X5uAiynM7Bu2ayBj
# UwIDAQABo4IBXTCCAVkwEgYDVR0TAQH/BAgwBgEB/wIBADAdBgNVHQ4EFgQU729T
# SunkBnx6yuKQVvYv1Ensy04wHwYDVR0jBBgwFoAU7NfjgtJxXWRM3y5nP+e6mK4c
# D08wDgYDVR0PAQH/BAQDAgGGMBMGA1UdJQQMMAoGCCsGAQUFBwMIMHcGCCsGAQUF
# BwEBBGswaTAkBggrBgEFBQcwAYYYaHR0cDovL29jc3AuZGlnaWNlcnQuY29tMEEG
# CCsGAQUFBzAChjVodHRwOi8vY2FjZXJ0cy5kaWdpY2VydC5jb20vRGlnaUNlcnRU
# cnVzdGVkUm9vdEc0LmNydDBDBgNVHR8EPDA6MDigNqA0hjJodHRwOi8vY3JsMy5k
# aWdpY2VydC5jb20vRGlnaUNlcnRUcnVzdGVkUm9vdEc0LmNybDAgBgNVHSAEGTAX
# MAgGBmeBDAEEAjALBglghkgBhv1sBwEwDQYJKoZIhvcNAQELBQADggIBABfO+xaA
# HP4HPRF2cTC9vgvItTSmf83Qh8WIGjB/T8ObXAZz8OjuhUxjaaFdleMM0lBryPTQ
# M2qEJPe36zwbSI/mS83afsl3YTj+IQhQE7jU/kXjjytJgnn0hvrV6hqWGd3rLAUt
# 6vJy9lMDPjTLxLgXf9r5nWMQwr8Myb9rEVKChHyfpzee5kH0F8HABBgr0UdqirZ7
# bowe9Vj2AIMD8liyrukZ2iA/wdG2th9y1IsA0QF8dTXqvcnTmpfeQh35k5zOCPmS
# Nq1UH410ANVko43+Cdmu4y81hjajV/gxdEkMx1NKU4uHQcKfZxAvBAKqMVuqte69
# M9J6A47OvgRaPs+2ykgcGV00TYr2Lr3ty9qIijanrUR3anzEwlvzZiiyfTPjLbnF
# RsjsYg39OlV8cipDoq7+qNNjqFzeGxcytL5TTLL4ZaoBdqbhOhZ3ZRDUphPvSRmM
# Thi0vw9vODRzW6AxnJll38F0cuJG7uEBYTptMSbhdhGQDpOXgpIUsWTjd6xpR6oa
# Qf/DJbg3s6KCLPAlZ66RzIg9sC+NJpud/v4+7RWsWCiKi9EOLLHfMR2ZyJ/+xhCx
# 9yHbxtl5TPau1j/1MIDpMPx0LckTetiSuEtQvLsNz3Qbp7wGWqbIiOWCnb5WqxL3
# /BAPvIXKUjPSxyZsq8WhbaM2tszWkPZPubdcMIIG7TCCBNWgAwIBAgIQCoDvGEuN
# 8QWC0cR2p5V0aDANBgkqhkiG9w0BAQsFADBpMQswCQYDVQQGEwJVUzEXMBUGA1UE
# ChMORGlnaUNlcnQsIEluYy4xQTA/BgNVBAMTOERpZ2lDZXJ0IFRydXN0ZWQgRzQg
# VGltZVN0YW1waW5nIFJTQTQwOTYgU0hBMjU2IDIwMjUgQ0ExMB4XDTI1MDYwNDAw
# MDAwMFoXDTM2MDkwMzIzNTk1OVowYzELMAkGA1UEBhMCVVMxFzAVBgNVBAoTDkRp
# Z2lDZXJ0LCBJbmMuMTswOQYDVQQDEzJEaWdpQ2VydCBTSEEyNTYgUlNBNDA5NiBU
# aW1lc3RhbXAgUmVzcG9uZGVyIDIwMjUgMTCCAiIwDQYJKoZIhvcNAQEBBQADggIP
# ADCCAgoCggIBANBGrC0Sxp7Q6q5gVrMrV7pvUf+GcAoB38o3zBlCMGMyqJnfFNZx
# +wvA69HFTBdwbHwBSOeLpvPnZ8ZN+vo8dE2/pPvOx/Vj8TchTySA2R4QKpVD7dvN
# Zh6wW2R6kSu9RJt/4QhguSssp3qome7MrxVyfQO9sMx6ZAWjFDYOzDi8SOhPUWlL
# nh00Cll8pjrUcCV3K3E0zz09ldQ//nBZZREr4h/GI6Dxb2UoyrN0ijtUDVHRXdmn
# cOOMA3CoB/iUSROUINDT98oksouTMYFOnHoRh6+86Ltc5zjPKHW5KqCvpSduSwhw
# UmotuQhcg9tw2YD3w6ySSSu+3qU8DD+nigNJFmt6LAHvH3KSuNLoZLc1Hf2JNMVL
# 4Q1OpbybpMe46YceNA0LfNsnqcnpJeItK/DhKbPxTTuGoX7wJNdoRORVbPR1VVnD
# uSeHVZlc4seAO+6d2sC26/PQPdP51ho1zBp+xUIZkpSFA8vWdoUoHLWnqWU3dCCy
# FG1roSrgHjSHlq8xymLnjCbSLZ49kPmk8iyyizNDIXj//cOgrY7rlRyTlaCCfw7a
# SUROwnu7zER6EaJ+AliL7ojTdS5PWPsWeupWs7NpChUk555K096V1hE0yZIXe+gi
# AwW00aHzrDchIc2bQhpp0IoKRR7YufAkprxMiXAJQ1XCmnCfgPf8+3mnAgMBAAGj
# ggGVMIIBkTAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBTkO/zyMe39/dfzkXFjGVBD
# z2GM6DAfBgNVHSMEGDAWgBTvb1NK6eQGfHrK4pBW9i/USezLTjAOBgNVHQ8BAf8E
# BAMCB4AwFgYDVR0lAQH/BAwwCgYIKwYBBQUHAwgwgZUGCCsGAQUFBwEBBIGIMIGF
# MCQGCCsGAQUFBzABhhhodHRwOi8vb2NzcC5kaWdpY2VydC5jb20wXQYIKwYBBQUH
# MAKGUWh0dHA6Ly9jYWNlcnRzLmRpZ2ljZXJ0LmNvbS9EaWdpQ2VydFRydXN0ZWRH
# NFRpbWVTdGFtcGluZ1JTQTQwOTZTSEEyNTYyMDI1Q0ExLmNydDBfBgNVHR8EWDBW
# MFSgUqBQhk5odHRwOi8vY3JsMy5kaWdpY2VydC5jb20vRGlnaUNlcnRUcnVzdGVk
# RzRUaW1lU3RhbXBpbmdSU0E0MDk2U0hBMjU2MjAyNUNBMS5jcmwwIAYDVR0gBBkw
# FzAIBgZngQwBBAIwCwYJYIZIAYb9bAcBMA0GCSqGSIb3DQEBCwUAA4ICAQBlKq3x
# HCcEua5gQezRCESeY0ByIfjk9iJP2zWLpQq1b4URGnwWBdEZD9gBq9fNaNmFj6Eh
# 8/YmRDfxT7C0k8FUFqNh+tshgb4O6Lgjg8K8elC4+oWCqnU/ML9lFfim8/9yJmZS
# e2F8AQ/UdKFOtj7YMTmqPO9mzskgiC3QYIUP2S3HQvHG1FDu+WUqW4daIqToXFE/
# JQ/EABgfZXLWU0ziTN6R3ygQBHMUBaB5bdrPbF6MRYs03h4obEMnxYOX8VBRKe1u
# NnzQVTeLni2nHkX/QqvXnNb+YkDFkxUGtMTaiLR9wjxUxu2hECZpqyU1d0IbX6Wq
# 8/gVutDojBIFeRlqAcuEVT0cKsb+zJNEsuEB7O7/cuvTQasnM9AWcIQfVjnzrvwi
# CZ85EE8LUkqRhoS3Y50OHgaY7T/lwd6UArb+BOVAkg2oOvol/DJgddJ35XTxfUlQ
# +8Hggt8l2Yv7roancJIFcbojBcxlRcGG0LIhp6GvReQGgMgYxQbV1S3CrWqZzBt1
# R9xJgKf47CdxVRd/ndUlQ05oxYy2zRWVFjF7mcr4C34Mj3ocCVccAvlKV9jEnstr
# niLvUxxVZE/rptb7IRE2lskKPIJgbaP5t2nGj/ULLi49xTcBZU8atufk+EMF/cWu
# iC7POGT75qaL6vdCvHlshtjdNXOCIUjsarfNZzGCBRIwggUOAgEBMDYwIjEgMB4G
# A1UEAwwXSWNlYmVyZyBJVCBDb2RlIFNpZ25pbmcCEBQRsvmnEomBTh55VmvpybIw
# DQYJYIZIAWUDBAIBBQCggYQwGAYKKwYBBAGCNwIBDDEKMAigAoAAoQKAADAZBgkq
# hkiG9w0BCQMxDAYKKwYBBAGCNwIBBDAcBgorBgEEAYI3AgELMQ4wDAYKKwYBBAGC
# NwIBFTAvBgkqhkiG9w0BCQQxIgQghU8Ae96a4dOSA6hecHFN+lNZY0xDW01oltR3
# 16bHDIswDQYJKoZIhvcNAQEBBQAEggEAdc8wNGAT7PTZPQxadwQeEL7I9L4crYYV
# zQau8VkoLxDSpQ1e2OVpATeTYXrqJsTktelAb+/Jmx7tyYE1OTrnsCkuAXcvKlV7
# YRPnddxKM14whiLSesMqw+/ATPnNnOgxBb0JvWVujhlPBcMD1SzGGgCS5oJWMOOp
# LUgdYj34LRfkoZKhsneex5z5WtAgk2OT/lILcWHtE44We0vLt3M8/1wqfbqrVUvL
# JnpUg/scN7kj8dDKAWWy7+4RwzqRhPwtgoTfdhME94Ugkp90Myf1e5PAZspGDS0L
# UgpWgLCEgBUEG3G1Yo9b/sNULqj1wf9ZIV9aSIjYN3R2iy/QWVpRIaGCAyYwggMi
# BgkqhkiG9w0BCQYxggMTMIIDDwIBATB9MGkxCzAJBgNVBAYTAlVTMRcwFQYDVQQK
# Ew5EaWdpQ2VydCwgSW5jLjFBMD8GA1UEAxM4RGlnaUNlcnQgVHJ1c3RlZCBHNCBU
# aW1lU3RhbXBpbmcgUlNBNDA5NiBTSEEyNTYgMjAyNSBDQTECEAqA7xhLjfEFgtHE
# dqeVdGgwDQYJYIZIAWUDBAIBBQCgaTAYBgkqhkiG9w0BCQMxCwYJKoZIhvcNAQcB
# MBwGCSqGSIb3DQEJBTEPFw0yNjA0MDgxNDE0MDVaMC8GCSqGSIb3DQEJBDEiBCCJ
# vypYbm6eU9qDhlRoPbVU9Ofv4HY+P7EeFxtMTqZNszANBgkqhkiG9w0BAQEFAASC
# AgCG1G4QWS8hLj1Gv01Ah2Pq5O1to7y+8rF+KP2fT2+XnUc8cSqtB3sJbNJvKXf8
# O/YH5aIZJdrV3CNwaEYq3q/exG4MaUUEkJ0BXHSDu9KW02YOc+HZ7is/crrnqlz1
# E6gvSg9Z3KYTpN7seCfGmmPc9V9ecryeed1M6HNGFcKU0AFbAz0jdyDiYJ7PSlJS
# MDmhExJpp+BpAr2eyhfeR7+0Kvz7ogafImE+XYi985lGq35fZ74DhwAtyIxAycWd
# sfyTY3b1RCYtIDLkgZYhXJtpB3QsT/6GX+GguJGpr0gLdZ/M5EYUlC+eWCaPYa1w
# 5meleMRDR4G2+Mpp6MeF1Y4TNXAcvtiHY2VsqNi6S9TrYH9uLa9lhIkTaosWtofO
# SO2FwWghEIFYBvTfK3W7QiFSlxXGROaTONBb16Aa6HX9XbGqLPMozYiul9tqOJmq
# f4UYtUW9L3WOYviBZxY+f7uM4PN9lZgkWfVQ/iEGquXJjtWHvSovk9H2QKE56P7w
# pcMUY/QVGms+fot0GLTeN4a7yd03cWbPDyO4AFjO/552g8QSK9Sz14SumM3z8rWt
# Bx/iHLRaBFWArD2H4iRxNPbZKLgB2om+QrUCdt96S0f0q7QNwMOxEV+2O4f1did8
# s8NI2zFu0kYBZPM5i8DvptdYKgtdj4HmUHigzRRgH+wq/w==
# SIG # End signature block
