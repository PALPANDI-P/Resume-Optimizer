@echo off
title ResumeForge Backend
color 0B
echo ========================================
echo Starting ResumeForge Backend...
echo ========================================
echo.
cd /d "e:\Resume Modifier\backend"
if not exist "venv\Scripts\python.exe" (
    color 0C
    echo ERROR: Virtual environment not found!
    echo Run: python -m venv venv
    echo Then: venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)
call venv\Scripts\activate.bat
echo Checking dependencies...
python -c "import flask; import flask_cors; import fitz; import docx; from fpdf import FPDF; print('All dependencies OK')" 2>&1
if errorlevel 1 (
    color 0C
    echo.
    echo Missing dependencies! Installing...
    pip install -r requirements.txt
    echo.
)
echo.
echo Starting Flask server on port 5000...
echo ----------------------------------------
python app.py
echo.
echo ========================================
echo Backend stopped. Check errors above.
echo ========================================
pause
