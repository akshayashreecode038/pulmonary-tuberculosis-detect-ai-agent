@echo off
echo Starting TB-Detect-AI FastAPI Backend Server...
python -m uvicorn ai_agent.api.main:app --host 127.0.0.1 --port 8000 --reload
pause
