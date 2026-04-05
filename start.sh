#!/bin/bash
echo "=========================================================="
echo "      ACIAS - Full-Stack Application Setup & Run"
echo "=========================================================="
echo ""

# 1. Check Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed or not in PATH."
    echo "Please install Python 3.10+ and try again."
    exit 1
fi

# 2. Check Node.js
if ! command -v npm &> /dev/null; then
    echo "[ERROR] Node.js (npm) is not installed or not in PATH."
    echo "Please install Node.js and try again."
    exit 1
fi

# 3. Setup Backend
echo "[1/4] Setting up Python Virtual Environment..."
cd backend || exit
if [ ! -f "venv/bin/activate" ] && [ ! -f "venv/Scripts/activate" ]; then
    echo "  - Creating new virtual environment..."
    python3 -m venv venv
fi

echo "[2/4] Installing Backend Dependencies..."
# Handle both Windows (Git Bash/WSL) and Unix paths
if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

pip install --upgrade pip > /dev/null
pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "  - Creating default backend .env file..."
    echo "DEBUG=True" > .env
    echo "ENVIRONMENT=development" >> .env
fi
deactivate
cd .. || exit

# 4. Setup Frontend
echo "[3/4] Installing Frontend Dependencies..."
cd frontend || exit
npm install

echo "[4/4] Configuring Frontend Environment..."
if [ ! -f ".env.local" ]; then
    echo "  - Creating default frontend .env.local file..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
fi
cd .. || exit

# 5. Launch Both Servers
echo ""
echo "=========================================================="
echo "  Setup Complete! Launching Servers Concurrently..."
echo "=========================================================="
echo ""
echo "Backend API  : http://localhost:8000"
echo "Frontend     : http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

# Launch backend in background
cd backend || exit
if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
deactivate
cd .. || exit

# Setup trap to catch Ctrl+C and kill background process
trap "echo -e '\nShutting down backend...'; kill $BACKEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Launch frontend in foreground
cd frontend || exit
npm run dev

# Cleanup if frontend exits normally
kill $BACKEND_PID 2>/dev/null
