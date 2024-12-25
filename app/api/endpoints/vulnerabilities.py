from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.vulnerability import VulnerabilityCreate, Vulnerability as VulnerabilitySchema
from app.crud import crud_vulnerability
from app.core.deps import get_db, require_role
from app.models.user import Role
from app.utils.docker_runner import run_poc_in_sandbox
from app.models.vulnerability import Vulnerability  

router = APIRouter()

@router.post("/{project_id}/vulnerabilities", response_model=VulnerabilitySchema)
def create_vulnerability(
    project_id: int,
    vulnerability: VulnerabilityCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(Role.pentester))
):
    return crud_vulnerability.create_vulnerability(db=db, vulnerability=vulnerability, project_id=project_id)

@router.post("/execute/{vulnerability_id}")
def execute_vulnerability_poc(
    vulnerability_id: int,
    db: Session = Depends(get_db),
    #current_user = Depends(require_role(Role.client))
):
    vuln = db.query(Vulnerability).filter(Vulnerability.id == vulnerability_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    result = run_poc_in_sandbox(vuln.poc_code)
    return {"output": result}