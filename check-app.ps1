# check-app.ps1 - Verifies frontend and backend build/startup for Drillbi

# Kör process-cleanup tyst och vänta tills den är klar
powershell -NoProfile -ExecutionPolicy Bypass -File "$(Join-Path $PSScriptRoot process-cleanup.ps1)" | Out-Null

# Check for required tools
foreach ($cmd in @('node','npm','curl')) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "$cmd is not installed or not in PATH." -ForegroundColor Red
        exit 1
    }
}

# Build frontend
Write-Host "Building frontend in $PWD..." -ForegroundColor Cyan
if (-not (Test-Path node_modules)) { npm install }
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

# Start frontend preview server
Write-Host "Starting frontend dev-server on port 5173..." -ForegroundColor Green
$frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run preview -- --port 5173" -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 8
try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:5173" -TimeoutSec 5
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 404 -or $response.StatusCode -eq 401) {
        Write-Host "✅ Frontend dev-server responds on port 5173." -ForegroundColor Green
    } else {
        throw "Frontend dev-server did not respond correctly on port 5173!"
    }
} catch {
    Write-Host "❌ Frontend dev-server did not respond on port 5173!" -ForegroundColor Red
    if ($frontendProc -and !$frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force }
    exit 1
}

# Start backend on available port
$backendPath = "C:\git\drillbi_backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend folder $backendPath not found" -ForegroundColor Red
    if ($frontendProc -and !$frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force }
    exit 1
}

$basePort = 18080
$maxTries = 5
$foundPort = $null
for ($try = 0; $try -lt $maxTries; $try++) {
    $port = $basePort + $try
    $inUse = $null -ne (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue)
    if (-not $inUse) {
        $foundPort = $port
        break
    }
}
if (-not $foundPort) {
    Write-Host "❌ Could not find available port for backend ($basePort to $($basePort + $maxTries - 1))" -ForegroundColor Red
    if ($frontendProc -and !$frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force }
    exit 1
}

Write-Host "Starting backend in $backendPath on port $foundPort..." -ForegroundColor Cyan
Push-Location $backendPath
$backendProc = Start-Process -FilePath "mvn" -ArgumentList @('spring-boot:run', "-Dspring-boot.run.profiles=dev", "-Dspring-boot.run.arguments=--server.port=$foundPort") -NoNewWindow -PassThru
Pop-Location
# Vänta och loopa hälsokoll på backend /api/ping
$backendResponding = $false
$maxWait = 30 # sekunder
$interval = 2 # sekunder
$elapsed = 0
Write-Host "Väntar på att backend ska bli redo på port $foundPort..." -ForegroundColor Yellow
while ($elapsed -lt $maxWait) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:$foundPort/api/ping" -TimeoutSec 5
        $status = $response.StatusCode
        if ($status -eq 200 -and $response.Content -eq "pong") {
            Write-Host "✅ Backend /api/ping responds with 200 and pong." -ForegroundColor Green
            $backendResponding = $true
            break
        } else {
            Write-Host "❌ Backend /api/ping responded med status $status och content: $($response.Content)" -ForegroundColor Red
        }
    } catch {
        if ($null -ne $_.Exception.Response) {
            $status = $_.Exception.Response.StatusCode.value__
            $body = (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd()
            Write-Host "❌ Backend /api/ping kastade exception med status: $status och body: $body" -ForegroundColor Red
        } else {
            Write-Host "❌ Backend /api/ping test misslyckades: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds $interval
    $elapsed += $interval
}

if (-not $backendResponding) {
    Write-Host "❌ Backend svarar inte korrekt på port $foundPort inom $maxWait sekunder!" -ForegroundColor Red
    if ($backendProc -and !$backendProc.HasExited) { Stop-Process -Id $backendProc.Id -Force }
    if ($frontendProc -and !$frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force }
    exit 1
}


# Cleanup
if ($frontendProc -and !$frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force }
if ($backendProc -and !$backendProc.HasExited) { Stop-Process -Id $backendProc.Id -Force }
Write-Host "\n✅ BOTH FRONTEND AND BACKEND CAN BE BUILT AND STARTED!" -ForegroundColor Green
exit 0
