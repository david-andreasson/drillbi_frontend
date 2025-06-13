# Skriv senaste git commit-hash till FRONTEND_VERSION.txt i projektroten
$ErrorActionPreference = 'Stop'
$projectRoot = Resolve-Path "$PSScriptRoot/.."
$versionFile = Join-Path $projectRoot "FRONTEND_VERSION.txt"

try {
    $hash = git -C $projectRoot rev-parse HEAD 2>&1
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($hash)) {
        Write-Host "[ERROR] Kunde inte hämta git commit-hash: $hash"
        exit 1
    }
    Set-Content -Path $versionFile -Value $hash
    Write-Host "[OK] FRONTEND_VERSION.txt uppdaterad med commit-hash: $hash"
} catch {
    Write-Host "[ERROR] Något gick fel: $_"
    exit 1
}
