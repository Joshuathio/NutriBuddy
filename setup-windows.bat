@echo off
echo ====================================
echo Malnutrition Tracker - Setup Script
echo ====================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install from: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed ✓
echo.

REM Check if Expo CLI is installed
echo Checking Expo CLI...
expo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Expo CLI globally...
    npm install -g expo-cli
)
echo Expo CLI is ready ✓
echo.

REM Install project dependencies
echo Installing project dependencies...
echo This may take a few minutes...
call npm install
echo Dependencies installed ✓
echo.

echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo To start the app, run: npm start
echo.
echo Options:
echo - Press 'a' for Android Emulator
echo - Press 'i' for iOS Simulator (Mac only)
echo - Scan QR code with Expo Go app on your phone
echo.
pause
