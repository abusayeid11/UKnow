@echo off
echo Starting UKnow Backend Server...

cd backend
call venv\Scripts\activate

echo Backend server starting on http://localhost:5000
python app.py
