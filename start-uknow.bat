@echo off
echo Starting UKnow Application...

echo Starting backend server...
start "UKnow Backend" cmd /c start-backend.bat

echo Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

echo Starting frontend server...
start "UKnow Frontend" cmd /c start-frontend.bat

echo.
echo UKnow is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Wait a moment for both servers to fully start, then visit http://localhost:3000
pause
