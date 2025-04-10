from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.schemas.vulnerability import (
    Vulnerability,
    VulnerabilityCreate,
    VulnerabilityUploadPoc,
)
from app.crud import crud_vulnerability
from app.core.deps import get_db, get_current_user
from app.core.permissions import Permissions
from app.models.user import User
from app.schemas.user import Role
from app.models.vulnerability import PoCType
from app.utils.poc_runner import poc_runner
from app.utils.file_handler import file_handler
import markdown2

router = APIRouter(tags=["vulnerabilities"])


@router.get("/recent", response_model=List[Vulnerability])
async def get_recent_vulnerabilities(
    db: Session = Depends(get_db),
    current_user: User = Depends(Permissions.ANY_USER),
    limit: int = 5,
):
    """Get recent vulnerabilities with optional limit parameter."""
    vulnerabilities = crud_vulnerability.get_recent(db, limit=limit)

    # Process markdown to HTML for each vulnerability
    for vuln in vulnerabilities:
        # Make sure POC code is properly formatted for display
        if vuln.poc_code and not hasattr(vuln, "poc_html"):
            # Add a dynamic attribute for the HTML version
            setattr(
                vuln,
                "poc_html",
                markdown2.markdown(
                    f"```\n{vuln.poc_code}\n```",
                    extras=["fenced-code-blocks", "tables", "break-on-newline"],
                ),
            )

    return vulnerabilities


@router.get("/all", response_model=List[Vulnerability])
async def get_all_vulnerabilities(
    db: Session = Depends(get_db),
    current_user: User = Depends(Permissions.ANY_USER),
):
    """Get all vulnerabilities in the system."""
    vulnerabilities = crud_vulnerability.get_all(db)

    # Process markdown to HTML for each vulnerability
    for vuln in vulnerabilities:
        # Make sure POC code is properly formatted for display
        if vuln.poc_code and not hasattr(vuln, "poc_html"):
            # Add a dynamic attribute for the HTML version
            setattr(
                vuln,
                "poc_html",
                markdown2.markdown(
                    f"```\n{vuln.poc_code}\n```",
                    extras=["fenced-code-blocks", "tables", "break-on-newline"],
                ),
            )

    return vulnerabilities


@router.post("/vulnerabilities/{project_id}", response_model=Vulnerability)
async def create_vulnerability(
    project_id: UUID,
    vulnerability: VulnerabilityCreate,
    db: Session = Depends(get_db),
    current_user=Depends(Permissions.PENTESTER_WITH_OVERRIDE),
    admin_override: Optional[str] = Header(None, alias="X-Admin-Override"),
):
    """Create a new vulnerability"""
    # Log the request details for debugging
    print(
        f"Creating vulnerability for project {project_id} by user {current_user.username} with role {current_user.role}"
    )
    if admin_override:
        print(f"Admin override header present: {admin_override}")

    # Print the vulnerability data for debugging
    print(f"Vulnerability data: {vulnerability.dict()}")

    # Ensure poc_zip_path is set if not provided
    if not vulnerability.poc_zip_path:
        vulnerability.poc_zip_path = "N/A"

    # Create the vulnerability
    try:
        result = crud_vulnerability.create_vulnerability(
            db=db,
            vulnerability=vulnerability,
            project_id=project_id,
            discovered_by=current_user.id,
        )
        print(f"Vulnerability created successfully: {result.id}")
        return result
    except Exception as e:
        print(f"Error creating vulnerability: {str(e)}")
        raise


@router.get("/vulnerabilities/{project_id}", response_model=List[Vulnerability])
async def get_project_vulnerabilities(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(Permissions.PENTESTER_AND_CLIENT),
):
    """Get all vulnerabilities for a project with rendered HTML"""
    vulnerabilities = crud_vulnerability.get_vulnerabilities_by_project(
        db=db, project_id=project_id
    )
    for vuln in vulnerabilities:
        # Add a dynamic attribute for HTML display if needed
        if not hasattr(vuln, "description_html"):
            setattr(
                vuln,
                "description_html",
                markdown2.markdown(
                    vuln.description,
                    extras=["fenced-code-blocks", "tables", "break-on-newline"],
                ),
            )
    return vulnerabilities


@router.get("/vulnerabilities/{vulnerability_id}", response_model=Vulnerability)
async def get_vulnerability(
    vulnerability_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(Permissions.PENTESTER_AND_CLIENT),
):
    vulnerability = crud_vulnerability.get_vulnerability(
        db=db, vulnerability_id=vulnerability_id
    )
    if not vulnerability:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    return vulnerability


@router.post("/vulnerabilities/upload_poc/{vulnerability_id}")
async def upload_poc_file(
    vulnerability_id: UUID,
    poc_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(Permissions.PENTESTER_WITH_OVERRIDE),
):
    """Upload a PoC file for a vulnerability"""
    # Check file extension
    if not poc_file.filename.endswith((".zip")):
        raise HTTPException(
            status_code=400, detail="Only ZIP files are allowed for PoC uploads"
        )

    # Check if vulnerability exists
    vulnerability = crud_vulnerability.get_vulnerability(
        db=db, vulnerability_id=vulnerability_id
    )
    if not vulnerability:
        raise HTTPException(status_code=404, detail="Vulnerability not found")

    # Save the file
    file_path = await file_handler.save_poc_file(poc_file, vulnerability_id)

    # Update the vulnerability with the file path
    updated_vulnerability = crud_vulnerability.update_vulnerability_poc_zip(
        db=db, vulnerability_id=vulnerability_id, poc_zip_path=file_path
    )

    return {"message": "PoC file uploaded successfully", "file_path": file_path}


@router.put("/vulnerabilities/{vulnerability_id}", response_model=Vulnerability)
async def update_vulnerability(
    vulnerability_id: UUID,
    vulnerability: VulnerabilityCreate,
    db: Session = Depends(get_db),
    current_user=Depends(Permissions.PENTESTER_WITH_OVERRIDE),
    admin_override: Optional[str] = Header(None, alias="X-Admin-Override"),
):
    """Update an existing vulnerability"""
    # Log the request details for debugging
    print(
        f"Updating vulnerability {vulnerability_id} by user {current_user.username} with role {current_user.role}"
    )
    if admin_override:
        print(f"Admin override header present: {admin_override}")

    # Print the vulnerability data for debugging
    print(f"Vulnerability update data: {vulnerability.dict()}")

    # Check if vulnerability exists
    existing_vulnerability = crud_vulnerability.get_vulnerability(
        db=db, vulnerability_id=vulnerability_id
    )
    if not existing_vulnerability:
        raise HTTPException(status_code=404, detail="Vulnerability not found")

    # Prepare update data
    update_data = vulnerability.dict(exclude_unset=True)

    # Ensure poc_zip_path is set if not provided
    if not update_data.get("poc_zip_path"):
        update_data["poc_zip_path"] = "N/A"

    # Update the vulnerability
    try:
        updated_vulnerability = crud_vulnerability.update_vulnerability(
            db=db, vulnerability_id=vulnerability_id, vulnerability_data=update_data
        )
        print(f"Vulnerability updated successfully: {updated_vulnerability.id}")
        return updated_vulnerability
    except Exception as e:
        print(f"Error updating vulnerability: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error updating vulnerability: {str(e)}"
        )


@router.post("/vulnerabilities/execute/{vulnerability_id}")
async def execute_vulnerability_poc(
    vulnerability_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(Permissions.PENTESTER_AND_CLIENT),
):
    """Execute a vulnerability PoC in a sandboxed environment"""
    vulnerability = crud_vulnerability.get_vulnerability(
        db=db, vulnerability_id=vulnerability_id
    )
    if not vulnerability:
        raise HTTPException(status_code=404, detail="Vulnerability not found")

    if not vulnerability.poc_code:
        raise HTTPException(
            status_code=400, detail="No PoC code available for execution"
        )

    # Execute the PoC in a sandboxed Docker container
    result = poc_runner.run_poc(
        poc_type=vulnerability.poc_type,
        poc_code=vulnerability.poc_code,
        poc_zip_path=vulnerability.poc_zip_path,
    )

    return {
        "vulnerability_id": vulnerability_id,
        "success": result["success"],
        "output": result["output"],
        "exit_code": result["exit_code"],
    }
