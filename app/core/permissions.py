from fastapi import Depends, HTTPException, Header
from typing import List, Optional, Callable, Set, Union
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import Role


class PermissionDependency:
    """
    Reusable permission dependency that supports:
    - Multiple allowed roles
    - Role overrides for admins
    - Fine-grained permission handling
    """

    def __init__(
        self,
        allowed_roles: Set[Role],
        override_header: str = "X-Override-Role",
        allow_override: bool = True,
    ):
        self.allowed_roles = allowed_roles
        self.override_header = override_header
        self.allow_override = allow_override

    async def __call__(
        self,
        current_user: User = Depends(get_current_user),
        override_role: Optional[str] = Header(None, alias="X-Override-Role"),
    ):
        # Check if user's role is directly allowed
        if current_user.role in self.allowed_roles:
            return current_user

        # Check if override is allowed and user is admin
        if (
            self.allow_override
            and current_user.role == Role.SUPER_ADMIN
            and override_role == "true"
        ):
            return current_user

        # Permission denied
        raise HTTPException(
            status_code=403,
            detail=f"User with role {current_user.role} does not have permission for this operation. Allowed roles: {', '.join(role.value for role in self.allowed_roles)}",
        )


# Common permission profiles for reuse
class Permissions:
    # Allow only pentesters
    PENTESTER_ONLY = PermissionDependency(allowed_roles={Role.PENTESTER})

    # Allow pentesters with admin override
    PENTESTER_WITH_OVERRIDE = PermissionDependency(
        allowed_roles={Role.PENTESTER, Role.SUPER_ADMIN}, allow_override=True
    )

    # Allow pentesters, clients, and admins
    PENTESTER_AND_CLIENT = PermissionDependency(
        allowed_roles={Role.PENTESTER, Role.CLIENT, Role.SUPER_ADMIN, Role.ADMIN},
        allow_override=True,
    )

    # Only admins allowed
    ADMIN_ONLY = PermissionDependency(
        allowed_roles={Role.SUPER_ADMIN, Role.ADMIN},
        allow_override=False,  # No override needed since admin is already allowed
    )

    # Anyone logged in can access
    ANY_USER = PermissionDependency(
        allowed_roles={Role.SUPER_ADMIN, Role.ADMIN, Role.PENTESTER, Role.CLIENT},
        allow_override=False,
    )

    @staticmethod
    def custom_roles(
        roles: List[Role], allow_override: bool = True
    ) -> PermissionDependency:
        """Create a custom permission dependency with specific roles"""
        return PermissionDependency(
            allowed_roles=set(roles), allow_override=allow_override
        )
