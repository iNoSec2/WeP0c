from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_role
from app.models.user import User
from app.models.mission_comment import MissionComment
from app.schemas.mission_comment import MissionCommentCreate, MissionCommentResponse, MissionCommentUpdate
from app.schemas.user import Role
from app.crud.crud_mission_comment import create_comment, get_comments_by_mission, get_comment, update_comment, delete_comment

router = APIRouter()

@router.post("/missions/{mission_id}/comments", response_model=MissionCommentResponse)
async def create_mission_comment(
    mission_id: str,
    comment_data: MissionCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new comment for a mission
    """
    # Create the comment
    comment = create_comment(
        db=db, 
        comment=comment_data, 
        mission_id=mission_id, 
        author_id=current_user.id
    )
    return comment

@router.get("/missions/{mission_id}/comments", response_model=List[MissionCommentResponse])
async def read_mission_comments(
    mission_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all comments for a mission
    """
    comments = get_comments_by_mission(db=db, mission_id=mission_id)
    return comments

@router.get("/missions/{mission_id}/comments/{comment_id}", response_model=MissionCommentResponse)
async def read_mission_comment(
    mission_id: str,
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific comment
    """
    comment = get_comment(db=db, comment_id=comment_id)
    if not comment or str(comment.mission_id) != mission_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    return comment

@router.put("/missions/{mission_id}/comments/{comment_id}", response_model=MissionCommentResponse)
async def update_mission_comment(
    mission_id: str,
    comment_id: str,
    comment_data: MissionCommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a mission comment
    """
    # Check if comment exists
    comment = get_comment(db=db, comment_id=comment_id)
    if not comment or str(comment.mission_id) != mission_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if the user is the author or has admin privileges
    if str(comment.author_id) != str(current_user.id) and current_user.role not in [Role.SUPER_ADMIN, Role.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this comment"
        )
    
    # Update the comment
    updated_comment = update_comment(db=db, comment_id=comment_id, comment_data=comment_data)
    return updated_comment

@router.delete("/missions/{mission_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mission_comment(
    mission_id: str,
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a mission comment
    """
    # Check if comment exists
    comment = get_comment(db=db, comment_id=comment_id)
    if not comment or str(comment.mission_id) != mission_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if the user is the author or has admin privileges
    if str(comment.author_id) != str(current_user.id) and current_user.role not in [Role.SUPER_ADMIN, Role.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this comment"
        )
    
    # Delete the comment
    delete_comment(db=db, comment_id=comment_id)
    return None

# POC Comments routes
@router.post("/missions/{mission_id}/pocs/{poc_id}/comments", response_model=MissionCommentResponse)
async def create_poc_comment(
    mission_id: str,
    poc_id: str,
    comment_data: MissionCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new comment for a POC
    """
    # Create the comment with POC reference
    comment_data_with_poc = MissionCommentCreate(
        content=comment_data.content,
        poc_id=poc_id
    )
    
    comment = create_comment(
        db=db, 
        comment=comment_data_with_poc, 
        mission_id=mission_id, 
        author_id=current_user.id
    )
    return comment

@router.get("/missions/{mission_id}/pocs/{poc_id}/comments", response_model=List[MissionCommentResponse])
async def read_poc_comments(
    mission_id: str,
    poc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all comments for a POC
    """
    # Filter comments by mission and POC
    comments = get_comments_by_mission(
        db=db, 
        mission_id=mission_id, 
        poc_id=poc_id
    )
    return comments

@router.put("/missions/{mission_id}/pocs/{poc_id}/comments/{comment_id}", response_model=MissionCommentResponse)
async def update_poc_comment(
    mission_id: str,
    poc_id: str,
    comment_id: str,
    comment_data: MissionCommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a POC comment
    """
    # Check if comment exists and belongs to the POC
    comment = get_comment(db=db, comment_id=comment_id)
    if not comment or str(comment.mission_id) != mission_id or str(comment.poc_id) != poc_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if the user is the author or has admin privileges
    if str(comment.author_id) != str(current_user.id) and current_user.role not in [Role.SUPER_ADMIN, Role.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this comment"
        )
    
    # Update the comment
    updated_comment = update_comment(db=db, comment_id=comment_id, comment_data=comment_data)
    return updated_comment

@router.delete("/missions/{mission_id}/pocs/{poc_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_poc_comment(
    mission_id: str,
    poc_id: str,
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a POC comment
    """
    # Check if comment exists and belongs to the POC
    comment = get_comment(db=db, comment_id=comment_id)
    if not comment or str(comment.mission_id) != mission_id or str(comment.poc_id) != poc_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Check if the user is the author or has admin privileges
    if str(comment.author_id) != str(current_user.id) and current_user.role not in [Role.SUPER_ADMIN, Role.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this comment"
        )
    
    # Delete the comment
    delete_comment(db=db, comment_id=comment_id)
    return None 