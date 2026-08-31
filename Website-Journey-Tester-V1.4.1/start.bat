@echo off
setlocal
cd /d "%~dp0"
if exist "C:\Program Files\nodejs\node.exe" (
  "C:\Program Files\nodejs\node.exe" app\server.js
) else (
  node app\server.js
)
pause
