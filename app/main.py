# app/main.py
from fastapi import FastAPI
from app.api.endpoints import users, projects, vulnerabilities, invite
from app.database import engine
from app.models import Base


Base.metadata.create_all(bind=engine)

app = FastAPI()


app.include_router(users.router)
app.include_router(projects.router)
app.include_router(vulnerabilities.router)
app.include_router(invite.router)