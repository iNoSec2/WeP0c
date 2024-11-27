from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    client_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="projects")
    vulnerabilities = relationship("Vulnerability", back_populates="project")