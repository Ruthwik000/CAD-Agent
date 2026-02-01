@echo off
echo ========================================
echo JSCAD AI Agent Setup
echo ========================================
echo.

echo Installing dependencies...
call npm install

if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Get your Groq API key from https://console.groq.com
echo 2. Copy .env.example to .env
echo 3. Add your API key to .env file
echo 4. Run: npm start
echo 5. Open http://localhost:3001 in your browser
echo.
echo For detailed instructions, see README.md
echo ========================================
pause
