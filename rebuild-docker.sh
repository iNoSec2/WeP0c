#!/bin/bash

echo "Stopping running containers..."
docker-compose down

echo "Rebuilding frontend container..."
docker-compose build frontend

echo "Starting all containers..."
docker-compose up -d

echo "Done! The application should now be running with all required dependencies."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8001"
