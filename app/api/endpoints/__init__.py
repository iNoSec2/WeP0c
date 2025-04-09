# app/api/endpoints/__init__.py
from app.api.endpoints.users import router as users
from app.api.endpoints.projects import router as projects
from app.api.endpoints.vulnerabilities import router as vulnerabilities
from app.api.endpoints.admin import router as admin
from app.api.endpoints.auth import router as auth
from app.api.endpoints.dashboard import router as dashboard

__all__ = ["users", "projects", "vulnerabilities", "admin", "dashboard"] 