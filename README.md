# P0cit - Penetration Testing Management Platform

P0cit is a comprehensive platform designed to help penetration testers and security teams manage their penetration testing projects, share proofs of concept (PoC), and collaborate with clients. This production-ready version includes all the necessary features for a complete penetration testing workflow.

## Features

- **User Management**: Support for multiple user roles (Super Admin, Admin, Pentester, Client, User)
- **Project Management**: Create and manage penetration testing projects
- **PoC Management**: Share, execute, and document proof of concept exploits
- **Vulnerability Tracking**: Document and track vulnerabilities found during testing
- **Client Access**: Allow clients to view reports and comment on findings
- **Markdown Support**: Rich markdown editing with code highlighting for documentation
- **Comments System**: Discuss findings and PoCs with team members and clients
- **Microsoft SSO**: Authentication via Microsoft OAuth (frontend implemented, backend to be completed)
- **Role-Based Access Control**: Granular access control based on user roles

## Tech Stack

- **Backend**: FastAPI with SQLAlchemy ORM
- **Frontend**: Next.js with TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT tokens + Microsoft OAuth
- **Styling**: Tailwind CSS
- **Documentation**: Markdown with code highlighting

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL
- Docker (optional)

### Installation with Docker (Recommended)

The easiest way to get started is to use Docker Compose:

```bash
# Clone the repository
git clone https://github.com/yourusername/p0cit.git
cd p0cit

# Copy and configure environment files
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# Start the application with Docker Compose
docker-compose up -d

# Create a super admin user
docker-compose exec api python -m app.create_super_admin admin admin@example.com yourpassword
```

This will start all the necessary services:
- Backend API on port 8001
- Frontend on port 3000
- PostgreSQL database on port 5432

### Manual Installation

#### Backend

```bash
# Create a virtual environment
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration

# Initialize the database
python -m app.init_db

# Create a super admin user
python -m app.create_super_admin <username> <email> <password>

# Start the backend server
uvicorn app.main:app --reload
```

#### Frontend

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

## Setting Up Microsoft OAuth (Optional)

To enable Microsoft authentication:

1. Register a new application in the [Microsoft Azure Portal](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Add redirect URI: `http://localhost:3000/auth/microsoft/callback`
3. Note your Application (client) ID and create a client secret
4. Update these values in your `.env` file:

```
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_TENANT_ID=your_tenant_id
```

## User Roles

- **SUPER_ADMIN**: Full access to all features, user management, and system settings
- **ADMIN**: Manage projects, users, and platform settings
- **PENTESTER**: Create and manage pentest reports, vulnerabilities, and PoCs
- **CLIENT**: View assigned projects, reports, and add comments
- **USER**: Basic access to view allowed resources

## API Documentation

Once the application is running, you can access the API documentation at:

- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## Production Deployment

For production deployment instructions, see [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md).

## Development Notes

### Authentication Flow

The application uses JWT tokens for authentication. The token is stored in cookies for frontend access. The workflow is:

1. User logs in via username/password or Microsoft OAuth
2. Backend validates credentials and issues a JWT token
3. Token is stored in cookies and included in subsequent requests
4. Backend validates the token for protected routes

### Markdown and Code Highlighting

The platform supports rich markdown editing with code highlighting for documentation. This is implemented using:

- `markdown-it` for rendering markdown
- `react-markdown-editor-lite` for the editor component
- `highlight.js` for syntax highlighting
- Custom components for displaying code blocks with language detection

### Comments Feature

The platform supports comments on pentests and PoCs. This allows discussion between team members and clients about findings and vulnerabilities. Comments support markdown formatting for better readability.

### Role-Based Access Control

Access to resources is controlled by the user's role. The frontend and backend both implement checks to ensure users can only access resources appropriate for their role. The `RouteGuard` component in the frontend ensures that users can only access pages they have permission to view.

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.