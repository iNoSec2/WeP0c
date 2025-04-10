# app/api/endpoints/__init__.py
from fastapi import APIRouter
from app.api.endpoints import users, auth, projects, vulnerabilities, pentesters, admin, dashboard, mission_comments

api_router = APIRouter()
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, tags=["projects"])
api_router.include_router(vulnerabilities.router, tags=["vulnerabilities"])
api_router.include_router(pentesters.router, tags=["pentesters"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(dashboard.router, tags=["dashboard"])
api_router.include_router(mission_comments.router, tags=["comments"]) 