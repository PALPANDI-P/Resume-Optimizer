@echo off
title ResumeForge - Launcher
color 0B

echo.
echo ==========================================
echo   ResumeForge - Quick Launch
echo ==========================================
echo.

:: Kill any existing processes first
echo [0/3] Cleaning up old processes...
taskkill /fi "WINDOWTITLE eq RF-Backend*" /F >nul 2>&1
taskkill /fi "WINDOWTITLE eq RF-Frontend*" /F >nul 2>&1
timeout /t 2 /nobreak >nul

:: Navigate to project root
cd /d "e:\Resume Modifier"

:: ─── BACKEND ───
echo [1/3] Starting Flask Backend on port 5000...
if exist "backend\venv\Scripts\python.exe" (
    start "RF-Backend" cmd /k "title RF-Backend && cd /d e:\Resume Modifier\backend && call venv\Scripts\activate.bat && python app.py"
) else (
    echo   Creating Python virtual environment...
    start "RF-Backend" cmd /k "title RF-Backend && cd /d e:\Resume Modifier\backend && python -m venv venv && call venv\Scripts\activate.bat && pip install -r requirements.txt && python app.py"
)
echo   Backend starting...
timeout /t 4 /nobreak >nul

:: ─── FRONTEND ───
echo [2/3] Starting Vite Frontend on port 5173...
start "RF-Frontend" cmd /k "title RF-Frontend && cd /d e:\Resume Modifier && npm run dev"
timeout /t 5 /nobreak >nul

:: ─── BROWSER ───
echo [3/3] Opening browser...
start http://localhost:5173

echo.
echo ==========================================
echo   ResumeForge is RUNNING!
echo ==========================================
echo.
echo   Website : http://localhost:5173
echo   Backend : http://localhost:5000/api
echo.
echo   Both servers are in separate windows.
echo   Press any key to STOP all servers...
echo ==========================================
pause >nul

:: Cleanup
echo.
echo Stopping all servers...
taskkill /fi "WINDOWTITLE eq RF-Backend*" /F >nul 2>&1
taskkill /fi "WINDOWTITLE eq RF-Frontend*" /F >nul 2>&1
echo Done. Goodbye!
timeout /t 2 /nobreak >nul
