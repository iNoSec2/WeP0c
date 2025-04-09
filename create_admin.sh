#!/bin/bash
# Script to create a super admin user in the Docker container
set -e

CONTAINER_NAME="p0cit-app"
SCRIPT="app.create_super_admin"

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Create a super admin user for P0cit application"
    echo
    echo "Options:"
    echo "  -u, --username USERNAME    Specify the admin username"
    echo "  -e, --email EMAIL          Specify the admin email"
    echo "  -p, --password PASSWORD    Specify the admin password"
    echo "  -i, --interactive          Use interactive mode (prompt for inputs)"
    echo "  -h, --help                 Show this help message"
    echo
    echo "Examples:"
    echo "  $0 -i                      Interactive mode"
    echo "  $0 -u admin -e admin@example.com -p secure123"
    echo
}

# Function to validate non-empty input
validate_input() {
    local input="$1"
    local name="$2"
    
    if [ -z "$input" ]; then
        echo "Error: $name cannot be empty"
        return 1
    fi
    return 0
}

# Check if Docker is running
if ! docker.exe info >/dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if the container is running
if ! docker.exe ps | grep -q "$CONTAINER_NAME"; then
    echo "Error: Container '$CONTAINER_NAME' is not running."
    echo "Please start the application with './start.sh' first."
    exit 1
fi

# Parse command line arguments
INTERACTIVE=false
USERNAME=""
EMAIL=""
PASSWORD=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -i|--interactive)
            INTERACTIVE=true
            shift
            ;;
        -u|--username)
            USERNAME="$2"
            shift 2
            ;;
        -e|--email)
            EMAIL="$2"
            shift 2
            ;;
        -p|--password)
            PASSWORD="$2"
            shift 2
            ;;
        *)
            echo "Unknown parameter: $1"
            show_help
            exit 1
            ;;
    esac
done

# Interactive mode
if [ "$INTERACTIVE" = true ]; then
    echo "Creating super admin user (interactive mode)"
    echo "-------------------------------------------"
    
    read -p "Username: " USERNAME
    read -p "Email: " EMAIL
    read -s -p "Password: " PASSWORD
    echo
    read -s -p "Confirm password: " PASSWORD_CONFIRM
    echo
    
    if [ "$PASSWORD" != "$PASSWORD_CONFIRM" ]; then
        echo "Error: Passwords do not match."
        exit 1
    fi
fi

# Validate inputs
if ! validate_input "$USERNAME" "Username"; then
    exit 1
fi

if ! validate_input "$EMAIL" "Email"; then
    exit 1
fi

if ! validate_input "$PASSWORD" "Password"; then
    exit 1
fi

# Create a temporary Python script
cat > temp_create_admin.py << 'EOL'
from app.db.session import SessionLocal
from app.models.user import User
from app.schemas.user import Role
from app.core.security import get_password_hash
import uuid

# Create super admin user
db = SessionLocal()
try:
    # Create new super admin
    username = 'admin'
    email = 'admin@p0cit.com'
    password = 'Admin123!'
    
    user = User(
        id=uuid.uuid4(),
        username=username,
        email=email,
        hashed_password=get_password_hash(password),
        is_active=True,
        is_superuser=True,
        role=Role.SUPER_ADMIN,
        full_name='Super Administrator'
    )
    db.add(user)
    db.commit()
    print(f'Super admin user created successfully!')
    print(f'Username: {username}')
    print(f'Email: {email}')
    print(f'Password: {password}')
except Exception as e:
    print(f'Error creating super admin: {e}')
    db.rollback()
finally:
    db.close()
EOL

# Copy the script to the container
docker cp temp_create_admin.py p0cit-app:/app/

# Execute the script inside the container
docker exec p0cit-app python /app/temp_create_admin.py

# Clean up
rm temp_create_admin.py 