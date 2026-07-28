@echo off
cd /d "%~dp0"

start "Frontend" cmd /k "cd frontend && npm start"
start "Backend" cmd /k "cd backend && python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000"