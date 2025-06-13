# Skriv senaste git commit-hash till FRONTEND_VERSION.txt
$hash = git rev-parse HEAD
Set-Content -Path "../FRONTEND_VERSION.txt" -Value $hash
