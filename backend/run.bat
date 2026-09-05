@echo off
REM Quick Start Script for Student Complaint System Backend (Windows)
REM Run this script to set up and start the backend server

title Student Complaint System Backend
color 0A
echo.
echo ================================
echo Student Complaint System Backend
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org
    pause
    exit /b 1
)

echo [OK] Python found: 
python --version
echo.

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created
) else (
    echo [OK] Virtual environment already exists
)

echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo [OK] Virtual environment activated
echo.

REM Install requirements
echo Installing dependencies...
pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt

if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed
echo.

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo [OK] .env file created
    echo Note: Please review and update .env if needed
    echo.
)

REM Start the server
echo Starting FastAPI server...
echo.
echo Documentation: http://localhost:8000/docs
echo Alternative Docs: http://localhost:8000/redoc
echo Health Check: http://localhost:8000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
