@echo off
title Restaurant Online Ordering & QR Table System
cd /d "%~dp0"

echo.
echo ============================================================
echo   Restaurant Online Ordering ^& QR Table Management System
echo   One-Click Setup ^& Launcher
echo ============================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found on this computer.
    echo Please install Node.js LTS from: https://nodejs.org/
    echo After installing Node.js, double-click this file again.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [OK] Detected Node.js %NODE_VER%

node setup.mjs --start --open
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Setup or server startup failed. Check messages above.
    pause
)
