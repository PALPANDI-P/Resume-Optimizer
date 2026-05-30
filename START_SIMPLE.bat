@echo off
echo ========================================
echo Starting Resume Modifier Backend...
echo ========================================
echo.
echo Backend will start on: http://localhost:5000
echo.
cd backend
call venv\Scripts\activate.bat
python app.py
echo.
echo Backend stopped. Press any key to close this window...
pause >nul
