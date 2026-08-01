@echo off
setlocal
cd /d "%~dp0"
echo [1/3] Installing backend packages...
call npm install --prefix backend
if errorlevel 1 goto :error
echo [2/3] Installing frontend packages...
call npm install --prefix frontend
if errorlevel 1 goto :error
if not exist backend\.env copy backend\.env.example backend\.env >nul
if not exist frontend\.env copy frontend\.env.example frontend\.env >nul
echo [3/3] Running production build check...
call npm run build
if errorlevel 1 goto :error
echo.
echo Setup completed successfully.
echo Edit backend\.env to add your Gemini API key, then double-click start.bat.
pause
exit /b 0
:error
echo.
echo Setup failed. Read the error above.
pause
exit /b 1
