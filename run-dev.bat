
@echo off
title RestoSwift POS Development

echo ===================================
echo  RestoSwift POS Development Script
echo ===================================
echo.

echo Step 1: Installing/Verifying Dependencies...
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: npm install failed. Please check for errors above.
    pause
    exit /b 1
)
echo Dependencies are up to date.
echo.

echo Step 2: Starting Next.js Development Server on port 9002...
echo You can access the application at http://localhost:9002 once it's ready.
echo.

REM Attempt to open the browser after a short delay to allow the server to start
start "" "http://localhost:9002"

REM Run the dev server
call npm run dev

echo.
echo Development server has been stopped.
pause
