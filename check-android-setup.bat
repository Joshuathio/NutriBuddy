@echo off
echo =====================================
echo Android Studio & AVD Setup Checker
echo =====================================
echo.

REM Check if Android SDK is set
if "%ANDROID_HOME%"=="" (
    echo [WARNING] ANDROID_HOME is not set
    echo Please set ANDROID_HOME to your Android SDK location
    echo Usually: C:\Users\%USERNAME%\AppData\Local\Android\Sdk
    echo.
) else (
    echo [OK] ANDROID_HOME: %ANDROID_HOME%
    echo.
)

REM Check if adb exists
where adb >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] ADB not found in PATH
    echo Please add Android SDK platform-tools to PATH
    echo.
) else (
    echo [OK] ADB is available
    adb version
    echo.
)

REM Check if emulator exists
if exist "%ANDROID_HOME%\emulator\emulator.exe" (
    echo [OK] Android Emulator found
    echo.
) else (
    echo [WARNING] Android Emulator not found
    echo Please install via SDK Manager in Android Studio
    echo.
)

REM Check connected devices
echo Checking connected devices...
adb devices 2>nul
echo.

REM Check if HAXM is installed (for Intel)
if exist "%ProgramFiles%\Intel\HAXM\silent_install.bat" (
    echo [OK] Intel HAXM is installed
) else (
    echo [INFO] Intel HAXM not detected (required for Intel CPUs)
    echo Install via SDK Manager or https://github.com/intel/haxm
)
echo.

echo =====================================
echo Setup Instructions:
echo =====================================
echo.
echo 1. Open Android Studio
echo 2. Click "More Actions" or "Tools" menu
echo 3. Select "AVD Manager" or "Virtual Device Manager"
echo 4. Click "Create Virtual Device"
echo 5. Select a phone model and download a system image
echo.
echo If AVD Manager is missing:
echo - Go to SDK Manager
echo - Install "Android Emulator" and "Android SDK Build-Tools"
echo.
echo For better performance:
echo - Enable Virtualization in BIOS
echo - Install Intel HAXM (for Intel) or use AMD Hypervisor
echo.
pause
