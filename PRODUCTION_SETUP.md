# P0cit Production Setup Guide

This document outlines the steps to prepare P0cit for production deployment with all the enhanced features implemented.

## Recent Changes and Enhancements

We've made several important changes to the codebase to make it production-ready:

1. **Authentication Improvements**:
   - Enhanced JWT token handling
   - Added Microsoft OAuth integration
   - Improved token security and validation
   - Fixed role-based permission checks

2. **UI and UX Improvements**:
   - Added Markdown support with code highlighting for POCs
   - Enhanced frontend role-based access control
   - Improved error handling and user feedback

3. **New Features**:
   - Added comments system for POCs and pentests
   - Enhanced markdown display for better documentation
   - Implemented proper code highlighting

4. **Security Enhancements**:
   - Removed database initialization scripts with hardcoded credentials
   - Improved API endpoint security
   - Enhanced permission checking

## Remaining Tasks

To complete the production setup, follow these steps:

### 1. Configure Microsoft OAuth (if needed)

If you want to use Microsoft authentication:

1. Register an application in the Microsoft Azure Portal
2. Set up the required environment variables:
   ```
   MICROSOFT_CLIENT_ID=your_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret
   MICROSOFT_TENANT_ID=your_tenant_id
   ```

### 2. Database Setup

The database initialization has been updated to:
- Only create schema without test data
- Remove hardcoded credentials
- Provide a clean way to set up the first admin user

Follow these steps to set up your database:

```bash
# Initialize the database schema
python -m app.init_db

# Create a super admin user
python -m app.create_super_admin <username> <email> <password>
```

### 3. Frontend Configuration

Update your frontend environment variables in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://your-api-url
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id (if using Microsoft OAuth)
```

### 4. Production Deployment

For a production deployment, you can:

1. **Use Docker Compose**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Or deploy manually**:
   - Backend: Use a production ASGI server like Uvicorn with Gunicorn
     ```bash
     gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 4 --bind 0.0.0.0:8000
     ```
   - Frontend: Build and deploy the Next.js application
     ```bash
     cd frontend
     npm run build
     # Deploy the .next directory to your web server
     ```

### 5. Security Considerations

Before going to production, ensure the following:

- Set a strong `SECRET_KEY` in your `.env` file
- Use HTTPS for all communications
- Set up proper database backups
- Configure rate limiting for API endpoints
- Review and limit CORS settings for production

## Verifying Functionality

After deployment, verify that all key functionalities are working:

1. **User Authentication**:
   - Register a new user
   - Login with email/password
   - Verify Microsoft login if configured

2. **User Management**:
   - Create users with different roles
   - Verify proper permissions based on roles

3. **Project Management**:
   - Create new projects
   - Assign users to projects

4. **POC Management**:
   - Create POCs with code snippets
   - Verify markdown rendering and code highlighting
   - Test commenting functionality

5. **General UI and Functionality**:
   - Test on different browsers
   - Check mobile responsiveness
   - Verify proper error handling

## Troubleshooting

If you encounter issues:

1. Check the application logs
2. Verify database connectivity
3. Ensure environment variables are correctly set
4. Check network configurations and CORS settings

### Common Issues

#### Import Error with ReportUpdate

If you see this error:
```
ImportError: cannot import name 'ReportUpdate' from 'app.schemas.user'
```

Fix it by modifying `/app/app/api/endpoints/pentesters.py` to remove or correct the invalid import. The schema may be located in another module like `app.schemas.report` or isn't needed.

To fix:
```bash
# Find the file first
find /app -name "pentesters.py"

# Then edit the file to fix the import statement
# Either comment out the ReportUpdate import or correct its path
```

## Contact and Support

For additional support, reach out to the development team or create an issue in the project repository. 