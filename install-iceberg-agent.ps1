[CmdletBinding()]
param(
    [string]$SupabaseKey,

    [string]$TaskName = "IcebergAgentInventory",
    [string]$RunAt = "09:00",
    [string]$InstallDir = "C:\ProgramData\IcebergAgent"
)

$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "[ERROR] Debes ejecutar este script como ADMINISTRADOR." -ForegroundColor Red
    exit 1
}

function Get-EnvValueFromFile {
    param(
        [string]$FilePath,
        [string]$KeyName
    )

    if (-not (Test-Path $FilePath)) { return $null }
    try {
        $match = Select-String -Path $FilePath -Pattern ("^{0}=(.*)$" -f [regex]::Escape($KeyName)) -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $match) { return $null }
        return $match.Matches[0].Groups[1].Value.Trim().Trim('"').Trim("'")
    } catch { return $null }
}

function Write-Step {
    param([string]$Message)
    Write-Host "[ICEBERG-INSTALL] $Message" -ForegroundColor Cyan
}

try {
    $sourceDir = Split-Path -Parent $PSCommandPath
    $agentSource = Join-Path $sourceDir "iceberg-agent.ps1"
    $batSource = Join-Path $sourceDir "iceberg-agent.bat"
    $installScriptSource = Join-Path $sourceDir "install-iceberg-agent.ps1"
    $dotEnvPath = Join-Path $sourceDir ".env"
    $targetDir = $InstallDir
    $agentScript = Join-Path $targetDir "iceberg-agent.ps1"
    $batPath = Join-Path $targetDir "iceberg-agent.bat"
    $installScriptTarget = Join-Path $targetDir "install-iceberg-agent.ps1"
    $dotEnvTarget = Join-Path $targetDir ".env"

    if ([string]::IsNullOrWhiteSpace($SupabaseKey)) {
        $SupabaseKey = Get-EnvValueFromFile -FilePath $dotEnvPath -KeyName "VITE_SUPABASE_ANON_KEY"
    }
    if ([string]::IsNullOrWhiteSpace($SupabaseKey)) {
        throw "No se encontro SupabaseKey. Pasa -SupabaseKey o define VITE_SUPABASE_ANON_KEY en .env"
    }


    if (-not (Test-Path $agentSource)) { throw "No se encontro $agentSource" }
    if (-not (Test-Path $batSource)) { throw "No se encontro $batSource" }

    Write-Step "Copiando archivos del agente a $targetDir."
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Copy-Item $agentSource $agentScript -Force
    Copy-Item $batSource $batPath -Force
    Copy-Item $installScriptSource $installScriptTarget -Force
    if (Test-Path $dotEnvPath) {
        Copy-Item $dotEnvPath $dotEnvTarget -Force
    }

    Write-Step "Guardando clave en variable de entorno de equipo."
    [Environment]::SetEnvironmentVariable("ICEBERG_SUPABASE_KEY", $SupabaseKey, "Machine")

    Write-Step "Preparando tarea programada ($TaskName)."
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$agentScript`" -Silent"
    $trigger = New-ScheduledTaskTrigger -Daily -At $RunAt
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest -LogonType ServiceAccount
    $task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -Principal $principal

    Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force | Out-Null

    Write-Step "Ejecutando prueba inicial del agente."
    & powershell.exe -NoLogo -NoProfile -File $agentScript -Silent
    if ($LASTEXITCODE -ne 0) {
        throw "La prueba del agente fallo con codigo $LASTEXITCODE"
    }

    Write-Step "Instalacion completada y ejecucion forzada (Sin reinicio)."
    Start-ScheduledTask -TaskName $TaskName
    
    Write-Host "Task: $TaskName" -ForegroundColor Green
    Write-Host "Script: $agentScript" -ForegroundColor Green
    Write-Host "Launcher: $batPath" -ForegroundColor Green
    Write-Host "Siguiente paso recomendado: firmar .ps1 y .bat con certificado de codigo." -ForegroundColor Yellow
}
catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
