#!/bin/bash
# Script to update the database schema in the Docker container

echo "Running database migrations..."

# Run the Python migration script inside the Docker container
docker compose exec web python -m app.update_schema

echo "Migration completed!"

# Now try creating the admin user
read -p "Do you want to create a super admin user now? (y/n): " create_admin

if [[ $create_admin == "y" || $create_admin == "Y" ]]; then
    read -p "Enter admin username: " username
    read -p "Enter admin email: " email
    read -p "Enter admin password: " -s password
    echo ""
    
    ./create_admin.sh "$username" "$email" "$password"
fi 