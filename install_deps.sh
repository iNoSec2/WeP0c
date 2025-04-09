#!/bin/bash
# Script to install dependencies inside the Docker container

# Enter the web container
docker-compose exec web bash -c "pip install email-validator"

echo "Dependencies installed!" 