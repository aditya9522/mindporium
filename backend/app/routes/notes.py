from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.models.user import User
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.services.storage_service import storage_service

router = APIRouter()


def _file_url(file_obj: dict[str, Any]) -> str | None:
    url = file_obj.get("url") if isinstance(file_obj, dict) else None
    return url if isinstance(url, str) and url else None


def _file_urls(files: list[dict[str, Any]] | None) -> set[str]:
    return {url for url in (_file_url(file_obj) for file_obj in (files or [])) if url}


async def _delete_unreferenced_note_files(
    db: AsyncSession,
    user_id: int,
    urls: set[str],
    exclude_note_id: int | None = None,
) -> None:
    if not urls:
        return

    result = await db.execute(select(Note).where(Note.user_id == user_id))
    notes = result.scalars().all()
    referenced_urls: set[str] = set()

    for note in notes:
        if exclude_note_id is not None and note.id == exclude_note_id:
            continue
        referenced_urls.update(_file_urls(note.files))

    for url in urls - referenced_urls:
        await storage_service.delete_file_by_url(url)


@router.get("/", response_model=List[NoteResponse])
async def list_notes(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve all notes for the authenticated user, pinned first."""
    result = await db.execute(
        select(Note)
        .where(Note.user_id == current_user.id)
        .order_by(Note.is_pinned.desc(), Note.updated_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=NoteResponse)
async def create_note(
    *,
    db: AsyncSession = Depends(deps.get_db),
    note_in: NoteCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Create a new note."""
    note = Note(
        title=note_in.title,
        content=note_in.content,
        files=note_in.files,
        tags=note_in.tags,
        status=note_in.status,
        is_pinned=note_in.is_pinned or False,
        color=note_in.color,
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
    """Update an existing note."""
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
    removed_file_urls: set[str] = set()

    if "files" in update_data:
        removed_file_urls = _file_urls(note.files) - _file_urls(update_data["files"])

    for field in update_data:
        setattr(note, field, update_data[field])

    await _delete_unreferenced_note_files(
        db,
        current_user.id,
        removed_file_urls,
        exclude_note_id=note.id,
    )

    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.patch("/{id}/pin", response_model=NoteResponse)
async def toggle_pin_note(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Toggle the pinned state of a note."""
    result = await db.execute(
        select(Note).where(Note.id == id, Note.user_id == current_user.id)
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    note.is_pinned = not note.is_pinned
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.patch("/{id}/color", response_model=NoteResponse)
async def set_note_color(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    color: str | None = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Set or clear the color label of a note. Pass color=null to clear."""
    result = await db.execute(
        select(Note).where(Note.id == id, Note.user_id == current_user.id)
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    note.color = color
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.post("/{id}/duplicate", response_model=NoteResponse)
async def duplicate_note(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Duplicate an existing note."""
    result = await db.execute(
        select(Note).where(Note.id == id, Note.user_id == current_user.id)
    )
    original = result.scalars().first()
    if not original:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    duplicate = Note(
        title=f"{original.title} (Copy)",
        content=original.content,
        files=list(original.files or []),
        tags=list(original.tags or []),
        status="draft",
        is_pinned=False,
        color=original.color,
        user_id=current_user.id,
    )
    db.add(duplicate)
    await db.commit()
    await db.refresh(duplicate)
    return duplicate


@router.delete("/attachment")
async def delete_unattached_note_file(
    *,
    db: AsyncSession = Depends(deps.get_db),
    url: str = Query(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Delete an uploaded note attachment if no note still references it."""
    path = storage_service.path_from_public_url(url)
    if not path or not path.startswith(f"notes/{current_user.id}/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid note attachment URL"
        )

    await _delete_unreferenced_note_files(db, current_user.id, {url})
    return {"status": "success", "message": "Attachment cleanup completed"}


@router.delete("/{id}")
async def delete_note(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Delete a note."""
    result = await db.execute(
        select(Note).where(Note.id == id, Note.user_id == current_user.id)
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    await _delete_unreferenced_note_files(
        db,
        current_user.id,
        _file_urls(note.files),
        exclude_note_id=note.id,
    )

    await db.delete(note)
    await db.commit()
    return {"status": "success", "message": "Note deleted successfully"}


@router.post("/upload")
async def upload_note_file(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Upload a file attachment for a note."""
    if not storage_service.client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase storage is not configured."
        )

    try:
        from uuid import uuid4
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
