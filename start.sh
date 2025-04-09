#!/bin/bash
# Startup script for P0cit full-stack deployment

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to development mode
MODE="dev"

# Process command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --prod|--production) MODE="prod" ;;
        --dev|--development) MODE="dev" ;;
        --help)
            echo "Usage: $0 [--dev|--prod]"
            echo "  --dev, --development: Run in development mode (default)"
            echo "  --prod, --production: Run in production mode"
            exit 0
            ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

echo -e "${GREEN}=== P0cit - Penetration Testing Management Platform ===${NC}"
echo -e "${YELLOW}Starting services in ${MODE} mode...${NC}"

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker and Docker Compose first.${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Function to clean up if there's an error
cleanup() {
    echo -e "\n${RED}An error occurred. Stopping containers...${NC}"
    docker-compose down
    exit 1
}

# Trap Ctrl+C and errors
trap cleanup INT TERM

# Stop any existing containers
echo -e "${YELLOW}Stopping any existing containers...${NC}"
docker-compose down

# Build and start the containers
echo -e "${YELLOW}Building containers...${NC}"

COMPOSE_ARGS=""
if [ "$MODE" == "prod" ]; then
    # For production mode, use a different compose file or set production env vars
    export NODE_ENV=production
    echo -e "${YELLOW}Setting up production environment...${NC}"
    
    # You could use a production-specific compose file
    # COMPOSE_ARGS="-f docker-compose.yml -f docker-compose.prod.yml"
else
    # For development mode
    export NODE_ENV=development
    echo -e "${YELLOW}Setting up development environment with hot-reloading...${NC}"
fi

if ! docker-compose $COMPOSE_ARGS build; then
    echo -e "${RED}Failed to build containers.${NC}"
    exit 1
fi

echo -e "${YELLOW}Starting containers...${NC}"
if ! docker-compose $COMPOSE_ARGS up -d; then
    echo -e "${RED}Failed to start containers.${NC}"
    exit 1
fi

# Check if the services are running
echo -e "${YELLOW}Checking if services are running...${NC}"
sleep 5

# Check backend
if ! curl -s http://localhost:8001 > /dev/null; then
    echo -e "${RED}Backend service is not responding. Check logs with 'docker-compose logs api'.${NC}"
    echo -e "${YELLOW}You can restart the services with './start.sh'.${NC}"
else
    echo -e "${GREEN}Backend service is running.${NC}"
fi

# Print success message with service URLs
echo -e "${GREEN}Services started successfully!${NC}"
echo "- Backend API: http://localhost:8001"
echo "- Frontend: http://localhost:3000"
echo "- API Documentation: http://localhost:8001/api/docs"
echo ""
echo -e "${YELLOW}To view container logs:${NC}"
echo "  docker-compose logs -f"
echo -e "${YELLOW}To stop all services:${NC}"
echo "  docker-compose down"
echo ""

if [ "$MODE" == "dev" ]; then
    echo -e "${YELLOW}Development mode: Changes to your code will automatically reload.${NC}"
else
    echo -e "${YELLOW}Production mode: Application is running in optimized mode.${NC}"
fi 