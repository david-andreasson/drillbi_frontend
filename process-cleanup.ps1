# process-cleanup.ps1
# Dödar gamla backend-processer och Java-processer relaterade till drillbi_backend, helt tyst
$killedCount = 0
for ($p = 18080; $p -le 18090; $p++) {
    $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($conns) {
        foreach ($conn in $conns) {
            $targetPid = $conn.OwningProcess
            if ($targetPid -and $targetPid -ne $PID) {
                try {
                    Stop-Process -Id $targetPid -Force -ErrorAction SilentlyContinue | Out-Null
                    $killedCount++
                } catch {}
            }
        }
    }
}
Get-Process java -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*drillbi_backend*' } | ForEach-Object { try { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue | Out-Null } catch {} }
