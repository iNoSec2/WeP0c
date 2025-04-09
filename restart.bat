@echo off
echo Stopping containers...
docker-compose down

echo Building containers with updated configuration...
docker-compose build

echo Starting containers...
docker-compose up -d

echo Containers restarted successfully!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8001
echo.
echo Login with:
echo Email: admin@example.com
echo Password: admin
echo.
echo You may need to clear your browser cache or use an incognito window

pause 