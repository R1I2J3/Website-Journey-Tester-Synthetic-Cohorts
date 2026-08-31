@echo off
setlocal

set "PORT=8787"
if not "%~1"=="" set "PORT=%~1"

echo Closing Website Journey Tester port %PORT%...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$port = [int]'%PORT%'; $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue; if (-not $connections) { Write-Host ('No process is currently listening on port ' + $port + '.'); exit 0 }; $processIds = $connections.OwningProcess | Sort-Object -Unique; foreach ($processId in $processIds) { try { Stop-Process -Id $processId -Force; Write-Host ('Closed process ' + $processId + ' on port ' + $port + '.'); } catch { Write-Host ('Could not close process ' + $processId + ': ' + $_.Exception.Message); exit 1 } }"

echo.
echo Done.
pause
