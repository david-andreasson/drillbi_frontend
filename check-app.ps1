# Kontrollera att scriptet alltid bygger i rätt kataloger

# Bygg frontend
$frontendPath = "$PSScriptRoot"
Write-Host "Bygger frontend i $frontendPath..."
Push-Location $frontendPath
npm run build
$frontendStatus = $LASTEXITCODE
Pop-Location

# Bygg backend
$backendPath = "C:\git\drillbi_backend"
Write-Host "Bygger backend i $backendPath..."
Push-Location $backendPath
mvn clean verify
$backendStatus = $LASTEXITCODE
Pop-Location

if ($frontendStatus -eq 0 -and $backendStatus -eq 0) {
    Write-Host "✅ Applikationen kan starta (frontend & backend bygger utan fel)"
    exit 0
} else {
    if ($frontendStatus -ne 0) { Write-Host "❌ Byggfel i frontend!" }
    if ($backendStatus -ne 0) { Write-Host "❌ Byggfel i backend!" }
    exit 1
}
