@echo off
echo ========================================
echo ResumeForge - Full Application Launcher
echo ========================================
echo.
echo This script guides you through starting both servers.
echo.
echo Recommended: Use START_ALL.bat for automatic setup
echo   - Automatically creates virtual environment
echo   - Installs all dependencies
echo   - Starts both servers
echo   - Verifies connectivity
echo.
echo Or start manually:
echo   [Terminal 1] START_BACKEND.bat
echo   [Terminal 2] START_FRONTEND.bat
echo.
echo After both servers are running, open:
echo   http://localhost:5173
echo.
echo To check status, run: CHECK_STATUS.bat
echo.
echo To serve production build, run: serve_dist.bat
echo.
echo Press any key to close this window...
pause >nul
