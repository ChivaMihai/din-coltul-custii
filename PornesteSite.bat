@echo off
cd /d "%~dp0"

start "Frontend" cmd /k "cd frontend && npm start"
start "Backend" cmd /k "cd backend && python -m uvicorn server:app --reload --port 8000"