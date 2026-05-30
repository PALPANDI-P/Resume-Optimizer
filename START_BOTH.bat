@echo off
title Start Both Servers
echo ========================================
echo Starting Resume Modifier - Both Servers
echo ========================================
echo.
echo This will open two command prompt windows:
echo   Left window: Backend (Flask on port 5000)
echo   Right window: Frontend (Vite dev server on port 5173)
echo.
echo Make sure you have Python and npm dependencies installed:
echo   - Backend: pip install -r requirements.txt
echo   - Frontend: npm install
echo.
pause

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Start backend in left window
start "Backend (Flask Port 5000)" cmd /k "cd /d "%SCRIPT_DIR%" && echo Starting Backend Server on port 5000... && python -m pip install -r requirements.txt >nul 2>&1 && python app.py"

REM Small delay to ensure first window opens
timeout /t 2 /nobreak >nul

REM Start frontend in right window
start "Frontend (Vite Port 5173)" cmd /k "cd /d "%SCRIPT_DIR%" && echo Starting Frontend Dev Server on port 5173... && npm install && npm run dev"

echo.
echo Both servers are starting...
echo Check the new command windows for output.
echo.
echo Close this window or press any key to exit...
pause >nul
