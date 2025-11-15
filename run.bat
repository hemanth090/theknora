@echo off
REM KnoRa - Unified Run Script for Windows
REM Starts both backend (Rust) and frontend (Next.js) in parallel

setlocal enabledelayedexpansion

REM Get project root directory
set PROJECT_ROOT=%~dp0
set BACKEND_DIR=%PROJECT_ROOT%backend
set FRONTEND_DIR=%PROJECT_ROOT%frontend

echo.
echo ==========================================
echo       KnoRa - Unified Run Script
echo ==========================================
echo.

REM Check if backend directory exists
if not exist "%BACKEND_DIR%\Cargo.toml" (
    echo [ERROR] Backend Cargo.toml not found
    echo Please ensure backend directory exists
    exit /b 1
)

REM Check if frontend directory exists
if not exist "%FRONTEND_DIR%\package.json" (
    echo [ERROR] Frontend package.json not found
    echo Please ensure frontend directory exists
    exit /b 1
)

echo [INFO] Starting Backend (Rust)...
cd /d "%BACKEND_DIR%"
start "KnoRa Backend" cmd /k "cargo run & pause"

echo [INFO] Waiting for backend to initialize...
timeout /t 3 /nobreak

echo [INFO] Starting Frontend (Next.js)...
cd /d "%FRONTEND_DIR%"

REM Check if node_modules exists, if not install
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
)

start "KnoRa Frontend" cmd /k "npm run dev & pause"

echo.
echo ==========================================
echo    Both Services Running Successfully
echo ==========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo [INFO] Both services are running in separate windows
echo [INFO] Close the windows to stop the services
echo.

endlocal
