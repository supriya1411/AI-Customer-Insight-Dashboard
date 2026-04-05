@echo off
setlocal EnableDelayedExpansion

echo ==========================================================
echo       ACIAS - Full-Stack Application Setup ^& Run
echo ==========================================================
echo.

:: 1. Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to PATH.
    echo Please install Python 3.10+ from python.org and try again.
    pause
    exit /b 1
)

:: 2. Check for Node.js
call npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js ^(npm^) is not installed or not added to PATH.
    echo Please install Node.js from nodejs.org and try again.
    pause
    exit /b 1
)

:: 3. Setup Backend
echo [1/4] Setting up Python Virtual Environment...
cd backend
if not exist "venv\Scripts\activate.bat" (
    echo   - Creating new virtual environment...
    python -m venv venv
)
echo.

echo [2/4] Installing Backend Dependencies...
call venv\Scripts\python.exe -m pip install --upgrade pip >nul
call venv\Scripts\pip.exe install -r requirements.txt
echo.

:: Ensure Backend .env exists
if not exist ".env" (
    echo   - Creating default backend .env file...
    echo DEBUG=True> .env
    echo ENVIRONMENT=development>> .env
)
cd ..

:: 4. Setup Frontend
echo [3/4] Installing Frontend Dependencies...
cd frontend
call npm install
echo.

:: Ensure Frontend .env exists
echo [4/4] Configuring Frontend Environment...
if not exist ".env.local" (
    echo   - Creating default frontend .env.local file...
    echo NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1> .env.local
)
cd ..

:: 5. Launch Both Servers
echo.
echo ==========================================================
echo   Setup Complete! Launching Servers Concurrently...
echo ==========================================================
echo.
echo Backend API    : http://localhost:8000
echo Frontend Web   : http://localhost:3000
echo.
echo Two new terminal windows will open. To stop the application,
echo simply close those windows.
echo.

:: Launch backend in a new window
echo Starting Backend...
start "Backend Server (FastAPI)" cmd /k "cd backend && venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak >nul

:: Launch frontend in a new window
echo Starting Frontend...
start "Frontend Server (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo Services should now be running. You can close this terminal if desired.
pause
