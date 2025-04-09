from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.schemas.vulnerability import Vulnerability, VulnerabilityCreate, VulnerabilityUploadPoc
from app.crud import crud_vulnerability
from app.core.deps import get_db, require_role, get_current_user
from app.models.user import User
from app.schemas.user import Role
from app.models.vulnerability import PoCType
from app.utils.poc_runner import poc_runner
from app.utils.file_handler import file_handler
import markdown2

router = APIRouter(tags=["vulnerabilities"])

@router.post("/vulnerabilities/{project_id}", response_model=Vulnerability)
async def create_vulnerability(
    project_id: UUID,
    vulnerability: VulnerabilityCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(Role.PENTESTER))
):
    """Create a new vulnerability with markdown support"""
    # Convert markdown to HTML for preview
    vulnerability.description_html = markdown2.markdown(
        vulnerability.description_md,
        extras=["fenced-code-blocks", "tables", "break-on-newline"]
    )
    return crud_vulnerability.create_vulnerability(db=db, vulnerability=vulnerability, project_id=project_id)

@router.get("/vulnerabilities/{project_id}", response_model=List[Vulnerability])
async def get_project_vulnerabilities(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)  # Both pentesters and clients can view
):
    """Get all vulnerabilities for a project with rendered HTML"""
    vulnerabilities = crud_vulnerability.get_vulnerabilities_by_project(db=db, project_id=project_id)
    for vuln in vulnerabilities:
        vuln.description_html = markdown2.markdown(
            vuln.description_md,
            extras=["fenced-code-blocks", "tables", "break-on-newline"]
        )
    return vulnerabilities

@router.get("/vulnerabilities/{vulnerability_id}", response_model=Vulnerability)
async def get_vulnerability(
    vulnerability_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_db)  # Both pentesters and clients can view
):
    vulnerability = crud_vulnerability.get_vulnerability(db=db, vulnerability_id=vulnerability_id)
    if not vulnerability:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    return vulnerability

@router.post("/vulnerabilities/upload_poc/{vulnerability_id}")
async def upload_poc_file(
    vulnerability_id: UUID,
    poc_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_role(Role.PENTESTER))
):
    """Upload a PoC file for a vulnerability"""
    # Check file extension
    if not poc_file.filename.endswith(('.zip')):
        raise HTTPException(status_code=400, detail="Only ZIP files are allowed for PoC uploads")

    # Check if vulnerability exists
    vulnerability = crud_vulnerability.get_vulnerability(db=db, vulnerability_id=vulnerability_id)
    if not vulnerability:
        raise HTTPException(status_code=404, detail="Vulnerability not found")

    # Save the file
    file_path = await file_handler.save_poc_file(poc_file, vulnerability_id)

    # Update the vulnerability with the file path
    updated_vulnerability = crud_vulnerability.update_vulnerability_poc_zip(
        db=db, vulnerability_id=vulnerability_id, poc_zip_path=file_path
    )

    return {"message": "PoC file uploaded successfully", "file_path": file_path}

@router.post("/vulnerabilities/execute/{vulnerability_id}")
async def execute_vulnerability_poc(
    vulnerability_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)  # Both pentesters and clients can execute
):
    """Execute a vulnerability PoC in a sandboxed environment"""
    vulnerability = crud_vulnerability.get_vulnerability(db=db, vulnerability_id=vulnerability_id)
    if not vulnerability:
        raise HTTPException(status_code=404, detail="Vulnerability not found")

    if not vulnerability.poc_code:
        raise HTTPException(status_code=400, detail="No PoC code available for execution")

    # Execute the PoC in a sandboxed Docker container
    result = poc_runner.run_poc(
        poc_type=vulnerability.poc_type,
        poc_code=vulnerability.poc_code,
        poc_zip_path=vulnerability.poc_zip_path
    )

    return {
        "vulnerability_id": vulnerability_id,
        "success": result["success"],
        "output": result["output"],
        "exit_code": result["exit_code"]
    }

@router.get("/recent", response_model=List[Vulnerability])
async def get_recent_vulnerabilities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 5
):
    """Get recent vulnerabilities with optional limit parameter."""
    vulnerabilities = crud_vulnerability.get_recent(db, limit=limit)

    # Process markdown to HTML for each vulnerability
    for vuln in vulnerabilities:
        if vuln.description_md:
            vuln.description_html = markdown2.markdown(
                vuln.description_md,
                extras=["fenced-code-blocks", "tables", "break-on-newline"]
            )

        # Make sure POC code is properly formatted for display
        if vuln.poc_code and not vuln.poc_html:
            vuln.poc_html = markdown2.markdown(
                f"```\n{vuln.poc_code}\n```",
                extras=["fenced-code-blocks", "tables", "break-on-newline"]
            )

    return vulnerabilities