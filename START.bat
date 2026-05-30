@echo off
title ResumeForge Launcher
color 0B
echo.
echo  ============================================
echo     ResumeForge - Starting Both Servers
echo  ============================================
echo.

REM --- Start Backend ---
echo  [1/2] Starting Flask Backend (port 5000)...
start "ResumeForge-Backend" cmd /k "cd /d e:\Resume Modifier\backend && venv\Scripts\activate.bat && python app.py"
timeout /t 3 /nobreak >nul
echo        Backend started!

REM --- Start Frontend ---
echo  [2/2] Starting Vite Frontend (port 5173)...
start "ResumeForge-Frontend" cmd /k "cd /d e:\Resume Modifier && npx vite --port 5173"
timeout /t 4 /nobreak >nul
echo        Frontend started!

echo.
echo  ============================================
echo     BOTH SERVERS ARE RUNNING!
echo  ============================================
echo.
echo     Frontend:  http://localhost:5173
echo     Backend:   http://localhost:5000
echo.
echo  Opening browser...
start http://localhost:5173
echo.
echo  Press any key to STOP all servers...
pause >nul

taskkill /fi "WINDOWTITLE eq ResumeForge-Backend*" /F >nul 2>&1
taskkill /fi "WINDOWTITLE eq ResumeForge-Frontend*" /F >nul 2>&1
echo  Servers stopped. Goodbye!
