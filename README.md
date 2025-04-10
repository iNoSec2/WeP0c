# P0cit - Penetration Testing Management Platform

<div align="center">
  <img src="frontend/public/logo.png" alt="P0cit Logo" width="200"/>
  <p>A comprehensive platform for managing penetration testing projects, vulnerabilities, and client collaboration.</p>

  <div>
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI"/>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
    <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  </div>
</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation with Docker](#installation-with-docker-recommended)
  - [Manual Installation](#manual-installation)
- [Configuration](#-configuration)
- [User Roles & Permissions](#-user-roles--permissions)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🔍 Overview

P0cit is a secure, full-featured platform designed to streamline the penetration testing workflow. It enables security professionals to manage projects, document vulnerabilities, share proof of concept exploits, and collaborate with clients in a unified environment.

The platform is built with security and usability in mind, featuring role-based access control, secure PoC execution in isolated environments, and comprehensive reporting capabilities.

## ✨ Features

### Project Management
- Create and manage penetration testing projects
- Assign multiple pentesters to projects
- Track project status and timelines
- Client access to view project progress

### Vulnerability Management
- Document vulnerabilities with detailed descriptions
- Markdown support with syntax highlighting
- Severity and status tracking
- Vulnerability filtering and search

### PoC Management
- Create and share proof of concept exploits
- Secure execution in isolated Docker containers
- Support for multiple languages (Python, JavaScript, Bash)
- File attachments for complex PoCs

### User Management
- Comprehensive role-based access control
- Multiple user roles (Super Admin, Admin, Pentester, Client)
- Microsoft SSO integration (optional)
- User activity tracking

### Collaboration
- Comment system for discussions
- Client access to view findings
- Real-time notifications
- Shared dashboards

### Reporting
- Generate comprehensive reports
- Export in multiple formats
- Custom report templates
- Executive summaries and technical details

## 🏗 Architecture

P0cit follows a modern microservices architecture:

- **Backend**: FastAPI with SQLAlchemy ORM
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Database**: PostgreSQL
- **Authentication**: JWT tokens with optional Microsoft OAuth
- **PoC Execution**: Isolated Docker containers
- **File Storage**: Local filesystem with proper access controls

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose (for containerized setup)
- Python 3.8+ (for manual setup)
- Node.js 18+ (for manual setup)
- PostgreSQL (for manual setup)

### Installation with Docker (Recommended)

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/yourusername/p0cit.git
cd p0cit

# Copy and configure environment files
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# Start the application
docker-compose up -d

# Create a super admin user
docker-compose exec api python -m app.create_super_admin admin admin@example.com yourpassword
```

This will start all necessary services:
- Backend API on port 8001
- Frontend on port 3000
- PostgreSQL database on port 5432

Access the application at http://localhost:3000

### Manual Installation

#### Backend Setup

```bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration

# Initialize the database
alembic upgrade head

# Create a super admin user
python -m app.create_super_admin admin admin@example.com yourpassword

# Start the backend server
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local file with your configuration

# Start the development server
npm run dev
```

## ⚙️ Configuration

### Environment Variables

Key environment variables for the backend:

| Variable | Description | Default |
|----------|-------------|----------|
| `SECRET_KEY` | JWT secret key | Random generated key |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@db:5432/p0cit` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token expiration | 11520 (8 days) |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |
| `MICROSOFT_CLIENT_ID` | Microsoft OAuth client ID | None |
| `MICROSOFT_CLIENT_SECRET` | Microsoft OAuth client secret | None |
| `MICROSOFT_TENANT_ID` | Microsoft OAuth tenant ID | None |

Key environment variables for the frontend:

| Variable | Description | Default |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8001` |
| `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` | Microsoft OAuth client ID | None |
| `NEXT_PUBLIC_MICROSOFT_TENANT_ID` | Microsoft OAuth tenant ID | None |

### Microsoft OAuth Setup (Optional)

To enable Microsoft authentication:

1. Register a new application in the [Microsoft Azure Portal](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Add redirect URI: `http://localhost:3000/auth/microsoft/callback`
3. Note your Application (client) ID and create a client secret
4. Update these values in your environment files

## 👥 User Roles & Permissions

P0cit implements a comprehensive role-based access control system:

| Role | Description | Capabilities |
|------|-------------|---------------|
| **SUPER_ADMIN** | Platform administrator | Full access to all features, user management, and system settings |
| **ADMIN** | Administrative user | Manage projects, users, and platform settings |
| **PENTESTER** | Security professional | Create and manage pentest reports, vulnerabilities, and PoCs |
| **CLIENT** | End client | View assigned projects, reports, and add comments |

The permission system supports:
- Role-based access control
- Admin override capabilities
- Custom permission profiles
- Detailed access logs

## 📚 API Documentation

Once the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

The API documentation includes:
- Endpoint descriptions
- Request/response schemas
- Authentication requirements
- Permission requirements

## 💻 Development

### Project Structure

```
p0cit/
├── app/                    # Backend application
│   ├── api/                # API endpoints
│   ├── core/               # Core functionality
│   ├── crud/               # Database operations
│   ├── db/                 # Database configuration
│   ├── models/             # SQLAlchemy models
│   ├── schemas/            # Pydantic schemas
│   └── utils/              # Utility functions
├── frontend/               # Next.js frontend
│   ├── public/             # Static assets
│   └── src/                # Source code
│       ├── app/            # Next.js app router
│       ├── components/     # React components
│       ├── lib/            # Utility functions
│       └── providers/      # Context providers
├── alembic/                # Database migrations
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Docker configuration
└── requirements.txt        # Python dependencies
```

### Authentication Flow

The application uses JWT tokens for authentication:

1. User logs in via username/password or Microsoft OAuth
2. Backend validates credentials and issues a JWT token
3. Token is stored in cookies and included in subsequent requests
4. Backend validates the token for protected routes

### PoC Execution

PoCs are executed in isolated Docker containers:

1. PoC code is written in the web interface
2. Code is saved to a temporary directory
3. A Docker container is created with the appropriate runtime
4. Code is executed with strict resource limitations
5. Output is captured and returned to the user
6. Container and temporary files are cleaned up

## 🌐 Deployment

For production deployment, we recommend:

1. Using Docker Compose with production settings
2. Setting up a reverse proxy (Nginx, Traefik) with SSL
3. Configuring proper database backups
4. Setting up monitoring and alerting
5. Implementing rate limiting

See [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) for detailed instructions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## 📄 License

This project is licensed under the P0cit Non-Commercial Open Source License - see the [LICENSE](LICENSE) file for details.

Key points of the license:
- You are free to use, modify, and distribute the software
- You may not sell or commercialize the software without explicit permission
- Any modifications must be shared under the same license terms
- Internal use within organizations is permitted

---

<div align="center">
  <p>Developed with ❤️ by Amine Elsassi</p>
  <p>
    <a href="https://github.com/zwxxb">GitHub</a> •
    <a href="https://www.linkedin.com/in/aminelsassi/">LinkedIn</a>
  </p>
</div>