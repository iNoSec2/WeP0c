#!/bin/bash
# Script to create a client user in the P0cit application

# Show usage if --help flag is passed
if [[ "$1" == "--help" ]]; then
  echo "Usage: $0 [--interactive]"
  echo "  --interactive: Run in interactive mode (ask for credentials)"
  echo "  --username NAME: Specify username"
  echo "  --password PASS: Specify password"
  echo "  --email EMAIL: Specify email (optional)"
  exit 0
fi

# Docker container name
CONTAINER_NAME="p0cit-app"

# Check if Docker container is running
if ! docker ps | grep -q $CONTAINER_NAME; then
  echo "Error: Docker container '$CONTAINER_NAME' is not running."
  echo "Please start the application first with 'docker-compose up -d'"
  exit 1
fi

# Default to non-interactive mode
INTERACTIVE=false
USERNAME=""
PASSWORD=""
EMAIL=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --interactive)
      INTERACTIVE=true
      shift
      ;;
    --username)
      USERNAME="$2"
      shift 2
      ;;
    --password)
      PASSWORD="$2"
      shift 2
      ;;
    --email)
      EMAIL="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Command to execute
CMD="python -m app.create_client"

# Add arguments based on mode
if [ "$INTERACTIVE" = true ]; then
  CMD="$CMD --interactive"
else
  # Check if username and password are provided
  if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
    echo "Error: Username and password are required in non-interactive mode"
    echo "Use --username NAME --password PASS or use --interactive"
    exit 1
  fi
  
  CMD="$CMD --username $USERNAME --password $PASSWORD"
  
  # Add email if provided
  if [ -n "$EMAIL" ]; then
    CMD="$CMD --email $EMAIL"
  fi
fi

echo "Creating client user..."
docker exec -it $CONTAINER_NAME $CMD

# Check exit status
if [ $? -eq 0 ]; then
  echo "Client user creation completed."
else
  echo "Error: Client user creation failed."
  exit 1
fi 