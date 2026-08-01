@echo off
setlocal
cd /d "%~dp0\frontend"
if not exist node_modules (
  echo Frontend packages are missing. Run setup.bat from the project root first.
  pause
  exit /b 1
)
call npm run dev
pause
