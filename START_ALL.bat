@echo off
setlocal enabledelayedexpansion
title ResumeForge Startup
color 0A

echo.
echo ========================================
echo      ResumeForge - Complete Startup
echo ========================================
echo.

:: Kill any existing servers first
echo [1/4] Cleaning up old processes...
taskkill /fi "WINDOWTITLE eq ResumeForge Backend*" /F >nul 2>&1
taskkill /fi "WINDOWTITLE eq ResumeForge Frontend*" /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul
echo   Done.

:: Check venv exists
echo.
echo [2/4] Checking Python environment...
cd /d "e:\Resume Modifier\backend"
if not exist "venv\Scripts\python.exe" (
    echo   ERROR: Virtual environment not found!
    echo   Run CREATE_VENV.bat first.
    pause
    exit /b 1
)

:: Quick import test
echo   Testing imports...
call venv\Scripts\activate.bat
python -c "from flask import Flask; from services.resume_parser import extract_text; from services.jd_analyzer import analyze_jd; from services.resume_modifier import modify_resume; print('  All imports OK')" 2>&1
if errorlevel 1 (
    color 0C
    echo.
    echo   ERROR: Python imports failed!
    echo   Try: pip install -r requirements.txt
    pause
    exit /b 1
)

:: Start backend
echo.
echo [3/4] Starting backend on port 5000...
cd /d "e:\Resume Modifier\backend"
start "ResumeForge Backend" cmd /k "title ResumeForge Backend && cd /d "e:\Resume Modifier\backend" && call venv\Scripts\activate.bat && echo Starting Flask... && python app.py"
echo   Waiting for backend to initialize...
timeout /t 4 /nobreak >nul

:: Verify backend is actually running
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:5000/api/generate-resumes' -Method POST -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue; Write-Host '  Backend is responding' } catch { if ($_.Exception.Response) { Write-Host '  Backend is responding (port open)' } else { Write-Host '  WARNING: Backend may not be running yet' } }" 2>nul

:: Start frontend
echo.
echo [4/4] Starting frontend on port 5173...
cd /d "e:\Resume Modifier"
start "ResumeForge Frontend" cmd /k "title ResumeForge Frontend && cd /d "e:\Resume Modifier" && npm run dev"
timeout /t 3 /nobreak >nul

:: Open browser
echo.
echo Opening browser...
start http://localhost:5173

echo.
echo ========================================
echo        BOTH SERVERS RUNNING!
echo ========================================
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo.
echo   Use test_resume.txt for testing.
echo.
echo   Press any key to STOP both servers...
pause >nul

echo.
echo Stopping servers...
taskkill /fi "WINDOWTITLE eq ResumeForge Backend*" /F >nul 2>&1
taskkill /fi "WINDOWTITLE eq ResumeForge Frontend*" /F >nul 2>&1
echo Done.
timeout /t 2 /nobreak >nul
