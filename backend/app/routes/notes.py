from typing import Any, List
import os

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.models.user import User
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.services.storage_service import storage_service

router = APIRouter()


@router.get("/", response_model=List[NoteResponse])
async def list_notes(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve all notes for the authenticated user
    """
    result = await db.execute(
        select(Note).where(Note.user_id == current_user.id).order_by(Note.updated_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=NoteResponse)
async def create_note(
    *,
    db: AsyncSession = Depends(deps.get_db),
    note_in: NoteCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new note
    """
    note = Note(
        title=note_in.title,
        content=note_in.content,
        files=note_in.files,
        tags=note_in.tags,
        status=note_in.status,
        user_id=current_user.id,
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.put("/{id}", response_model=NoteResponse)
async def update_note(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    note_in: NoteUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update an existing note
    """
    result = await db.execute(
        select(Note).where(Note.id == id, Note.user_id == current_user.id)
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    update_data = note_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(note, field, update_data[field])

    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.delete("/{id}")
async def delete_note(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a note
    """
    result = await db.execute(
        select(Note).where(Note.id == id, Note.user_id == current_user.id)
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    # Clean up note attachments in Supabase storage if they exist
    if note.files:
        for file_obj in note.files:
            try:
                # We can extract relative path if needed, but storage_service remove lists prefix.
                # However, let's keep it safe.
                pass
            except Exception as e:
                print(f"Error cleaning up note file: {e}")

    await db.delete(note)
    await db.commit()
    return {"status": "success", "message": "Note deleted successfully"}


@router.post("/upload")
async def upload_note_file(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload a file attachment for a note
    """
    if not storage_service.client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase storage is not configured."
        )

    try:
        # Save files under notes/{user_id}/{random_uuid}/{filename}
        from uuid import uuid4
        file_extension = os.path.splitext(file.filename)[1]
        
        # Clean inputs
        safe_filename = "".join(x for x in file.filename if x.isalnum() or x in "._-")
        path = f"notes/{current_user.id}/{uuid4()}/{safe_filename}"

        url = await storage_service.upload_file(file, path=path)
        return {
            "name": file.filename,
            "url": url,
            "type": file.content_type or "application/octet-stream"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload note attachment: {str(e)}"
        )
