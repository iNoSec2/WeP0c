# P0cit Permission System

## Overview

P0cit implements a robust role-based access control (RBAC) system, designed to provide flexible and secure permissions management. The system is built around:

1. Clearly defined user roles
2. Reusable permission dependencies
3. Role override capability for administrators
4. Custom permission profiles for different endpoint requirements

## User Roles

The application defines the following roles (from `app/schemas/user.py`):

- **SUPER_ADMIN**: Has unrestricted access to all endpoints and features
- **ADMIN**: Has administrative access for managing users and system configuration
- **PENTESTER**: Security professionals who create and manage vulnerabilities
- **CLIENT**: End users who can view projects and vulnerabilities related to their organization

## Permission Implementation

The permission system is implemented in `app/core/permissions.py` with two main components:

1. `PermissionDependency` class: A reusable FastAPI dependency that checks user roles
2. `Permissions` class: A collection of pre-configured permission profiles

### Using Permissions in Endpoints

To use the permission system in an endpoint, simply add a dependency like this:

```python
@router.post("/vulnerabilities/{project_id}")
async def create_vulnerability(
    project_id: UUID,
    vulnerability: VulnerabilityCreate,
    db: Session = Depends(get_db),
    current_user = Depends(Permissions.PENTESTER_WITH_OVERRIDE)
):
    # Your endpoint logic here
    # ...
```

## Available Permission Profiles

The following pre-configured permission profiles are available:

- `Permissions.PENTESTER_ONLY`: Only allows pentesters
- `Permissions.PENTESTER_WITH_OVERRIDE`: Allows pentesters and super admins with override header
- `Permissions.PENTESTER_AND_CLIENT`: Allows both pentesters and clients (with admin override)
- `Permissions.ADMIN_ONLY`: Only allows admin and super admin users
- `Permissions.ANY_USER`: Allows any authenticated user

## Custom Permission Profiles

You can create custom permission profiles using the static method:

```python
custom_perm = Permissions.custom_roles(
    roles=[Role.PENTESTER, Role.CLIENT], 
    allow_override=True
)
```

## Admin Role Override

Super admins can bypass role restrictions by including the `X-Override-Role: true` header in their requests. This functionality is automatically included in the frontend API routes for relevant endpoints.

## Frontend Implementation

In frontend API routes, you can implement the role override like this:

```typescript
// In your API route handler
const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Override-Role': 'true'
};

const response = await axios.post(`${backendURL}/api/vulnerabilities/${projectId}`, data, {
    headers
});
```

## Security Considerations

- The role override functionality is only available to super admins
- All permission checks are server-side
- The system logs access attempts and permission failures
- Regular security audits should be performed to ensure the system is functioning as expected 