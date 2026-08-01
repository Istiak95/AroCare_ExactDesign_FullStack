@echo off
setlocal
cd /d "%~dp0\backend"
if not exist node_modules (
  echo Backend packages are missing. Run setup.bat from the project root first.
  pause
  exit /b 1
)
call npm start
pause
