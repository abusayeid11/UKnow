@echo off
echo Setting up UKnow Backend...

cd backend

echo Creating virtual environment...
python -m venv venv
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt

echo Downloading spaCy language model...
python -m spacy download en_core_web_sm

echo Backend setup complete!
echo.
echo To start the backend server, run: start-backend.bat
pause
