# P0cit - Penetration Testing Management Platform

P0cit is a comprehensive platform for managing penetration testing projects, vulnerabilities, and client collaboration.

## Features

- **Project Management**: Create, manage, and track penetration testing projects
- **Vulnerability Tracking**: Document and track vulnerabilities with severity ratings
- **Client Collaboration**: Share findings with clients securely
- **Role-Based Access**: Different views for pentesters, clients, and administrators
- **Modern UI**: Clean, intuitive user interface inspired by Notion

## Architecture

- **Backend**: FastAPI (Python) RESTful API
- **Frontend**: Next.js (React) with Tailwind CSS
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication

## Getting Started

### Prerequisites

- Docker
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/p0cit.git
   cd p0cit
   ```

2. Run the setup script
   ```bash
   # If docker-compose is available:
   ./start.sh
   
   # Alternative method using Docker commands directly (for WSL or if docker-compose is not available):
   ./docker-start.sh
   ```

The script will:
- Build and start the backend API (FastAPI)
- Build and start the frontend (Next.js)
- Set up the PostgreSQL database
- Configure all the necessary connections

### Accessing the Application

After starting the application, you can access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/api/docs

### Stopping the Application

To stop the application:

```bash
# If using docker-compose:
docker-compose down

# Alternative method using Docker commands directly:
./docker-stop.sh
```

### Default Login

Use the following credentials for initial access:
- Username: `admin`
- Password: `admin`

You can create additional users through the admin interface.

## Development

### Project Structure
```
p0cit/
├── app/               # Backend code (FastAPI)
├── frontend/          # Frontend code (Next.js)
├── docker-compose.yml # Docker configuration
├── Dockerfile         # Backend Docker configuration
└── start.sh           # Startup script
```

### Development Workflow

1. Start the services in development mode:
   ```bash
   docker-compose up
   ```

2. Make changes to the backend code in the `app/` directory
3. Make changes to the frontend code in the `frontend/` directory
4. The development servers will automatically reload with your changes

## Database Management

### Reset Database
```bash
./reset_db.sh
```

### Migrate Database
```bash
./migrate_db.sh
```

### Create Admin User
```bash
./create_admin.sh --interactive
```

### Create Client User
```bash
./create_client.sh --interactive
```

## License

[MIT License](LICENSE) 