# Kontrollera att Node.js, npm och curl finns
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Write-Host "Node.js är inte installerat eller finns inte i PATH." -ForegroundColor Red; exit 1 }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Write-Host "npm är inte installerat eller finns inte i PATH." -ForegroundColor Red; exit 1 }
if (-not (Get-Command curl -ErrorAction SilentlyContinue)) { Write-Host "curl är inte installerat eller finns inte i PATH." -ForegroundColor Red; exit 1 }

Write-Host "Bygger frontend i $PWD..." -ForegroundColor Cyan
if (-not (Test-Path node_modules)) { Write-Host "Installerar npm-beroenden..." -ForegroundColor Yellow; npm install }
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Byggfel i frontend!" -ForegroundColor Red; exit 1 }

Write-Host "✅ Frontend byggd. Startar dev-server på port 5173..." -ForegroundColor Green
$frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run preview -- --port 5173" -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 8
try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:5173" -TimeoutSec 5
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 404) {
        Write-Host "✅ Frontend dev-server svarar på port 5173." -ForegroundColor Green
    } else {
        throw "Frontend dev-server svarar INTE korrekt på port 5173!"
    }
} catch {
    Write-Host "❌ Frontend dev-server svarar INTE på port 5173!" -ForegroundColor Red
    if ($frontendProc -and !$frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force }
    exit 1
}


# Starta backend
$backendPath = "C:\git\drillbi_backend"
if (-not (Test-Path $backendPath)) { Write-Host "❌ Hittar inte backend-mappen $backendPath" -ForegroundColor Red; if ($frontendProc -and !$frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force }; exit 1 }
Write-Host "Startar backend i $backendPath..." -ForegroundColor Cyan
Push-Location $backendPath
$backendProc = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run -Dspring-boot.run.profiles=dev" -NoNewWindow -PassThru
Pop-Location
Start-Sleep -Seconds 12
$backendOk = $false
try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:8080" -TimeoutSec 5
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 404) {
        $backendOk = $true
    } else {
        throw "Backend svarar INTE korrekt på port 8080!"
    }
} catch {
    Write-Host "❌ Backend svarar INTE på port 8080!" -ForegroundColor Red
    if ($backendProc -and !$backendProc.HasExited) { Stop-Process -Id $backendProc.Id -Force }
    if ($frontendProc -and !$frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force }
    exit 1
}
if ($backendOk) {
    Write-Host "✅ Backend svarar på port 8080." -ForegroundColor Green
}


# Städa upp
if ($frontendProc -and !$frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force }
if ($backendProc -and !$backendProc.HasExited) { Stop-Process -Id $backendProc.Id -Force }
Write-Host "\n✅ BÅDE FRONTEND OCH BACKEND KAN BYGGAS OCH STARTAS!" -ForegroundColor Green
exit 0
