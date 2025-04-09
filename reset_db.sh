#!/bin/bash
# Script to reset the database schema in the Docker container

echo "WARNING: This will delete ALL data in the database!"
read -p "Are you sure you want to continue? (y/N): " confirm

if [[ $confirm != "y" && $confirm != "Y" ]]; then
    echo "Database reset cancelled."
    exit 0
fi

echo "Resetting database..."

# Run the Python reset script inside the Docker container
docker compose exec web python -m app.reset_db

echo "Database reset completed!"

# Now create the admin user
read -p "Do you want to create a super admin user now? (y/n): " create_admin

if [[ $create_admin == "y" || $create_admin == "Y" ]]; then
    read -p "Enter admin username: " username
    read -p "Enter admin email: " email
    read -p "Enter admin password: " -s password
    echo ""
    
    ./create_admin.sh "$username" "$email" "$password"
fi 