from typing import Any, List
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.enums import RoleEnum
from app.models.media_asset import MediaAsset
from app.models.user import User
from app.schemas.media_asset import MediaAssetResponse, MediaAssetUpdate, MediaBulkDeleteRequest
from app.services.storage_service import storage_service

router = APIRouter()


def _category_for(content_type: str) -> str:
    if content_type.startswith("image/"):
        return "image"
    if content_type.startswith("video/"):
        return "video"
    if content_type.startswith("audio/"):
        return "audio"
    if content_type == "application/pdf":
        return "pdf"
    if content_type.startswith("text/"):
        return "text"
    return "document"


def _safe_filename(filename: str | None) -> str:
    fallback = "upload"
    cleaned = "".join(char for char in (filename or fallback) if char.isalnum() or char in "._-")
    return cleaned or fallback


def _can_manage(asset: MediaAsset, user: User) -> bool:
    return user.role == RoleEnum.admin.value or asset.owner_id == user.id


async def _get_asset_or_404(db: AsyncSession, asset_id: int, user: User) -> MediaAsset:
    result = await db.execute(select(MediaAsset).where(MediaAsset.id == asset_id))
    asset = result.scalars().first()
    if not asset or not _can_manage(asset, user):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media asset not found")
    return asset


async def _delete_asset(asset: MediaAsset, db: AsyncSession) -> None:
    await storage_service.delete_file_by_url(asset.url)
    await db.delete(asset)


@router.get("/", response_model=List[MediaAssetResponse])
async def list_media_assets(
    *,
    db: AsyncSession = Depends(deps.get_db),
    category: str | None = Query(default=None),
    owner_id: int | None = Query(default=None),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    query = select(MediaAsset)

    if current_user.role == RoleEnum.admin.value and owner_id is not None:
        query = query.where(MediaAsset.owner_id == owner_id)
    elif current_user.role != RoleEnum.admin.value:
        query = query.where(MediaAsset.owner_id == current_user.id)

    if category and category != "all":
        query = query.where(MediaAsset.category == category)

    result = await db.execute(query.order_by(MediaAsset.updated_at.desc()))
    return result.scalars().all()


@router.post("/upload", response_model=MediaAssetResponse)
async def upload_media_asset(
    *,
    db: AsyncSession = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if not storage_service.client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase storage is not configured.",
        )

    raw = await file.read()
    size = len(raw)
    await file.seek(0)

    safe_filename = _safe_filename(file.filename)
    content_type = file.content_type or "application/octet-stream"
    path = f"media-library/{current_user.id}/{uuid4()}/{safe_filename}"
    url = await storage_service.upload_file(file, path=path)

    asset = MediaAsset(
        name=file.filename or safe_filename,
        original_name=file.filename or safe_filename,
        url=url,
        content_type=content_type,
        size=size,
        category=_category_for(content_type),
        owner_id=current_user.id,
    )
    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset


@router.put("/{asset_id}", response_model=MediaAssetResponse)
async def update_media_asset(
    *,
    db: AsyncSession = Depends(deps.get_db),
    asset_id: int,
    asset_in: MediaAssetUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    asset = await _get_asset_or_404(db, asset_id, current_user)
    update_data = asset_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(asset, field, value)

    db.add(asset)
    await db.commit()
    await db.refresh(asset)
    return asset


@router.delete("/{asset_id}")
async def delete_media_asset(
    *,
    db: AsyncSession = Depends(deps.get_db),
    asset_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    asset = await _get_asset_or_404(db, asset_id, current_user)
    await _delete_asset(asset, db)
    await db.commit()
    return {"status": "success", "message": "Media asset deleted"}


@router.post("/bulk-delete")
async def bulk_delete_media_assets(
    *,
    db: AsyncSession = Depends(deps.get_db),
    payload: MediaBulkDeleteRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if not payload.ids:
        return {"status": "success", "deleted": 0}

    result = await db.execute(select(MediaAsset).where(MediaAsset.id.in_(payload.ids)))
    assets = [asset for asset in result.scalars().all() if _can_manage(asset, current_user)]

    for asset in assets:
        await _delete_asset(asset, db)

    await db.commit()
    return {"status": "success", "deleted": len(assets)}


@router.post("/clean")
async def clean_media_library(
    *,
    db: AsyncSession = Depends(deps.get_db),
    owner_id: int | None = Query(default=None),
    category: str | None = Query(default=None),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    query = select(MediaAsset)
    if current_user.role == RoleEnum.admin.value:
        if owner_id is not None:
            query = query.where(MediaAsset.owner_id == owner_id)
    else:
        query = query.where(MediaAsset.owner_id == current_user.id)

    if category and category != "all":
        query = query.where(MediaAsset.category == category)

    result = await db.execute(query)
    assets = result.scalars().all()

    for asset in assets:
        await _delete_asset(asset, db)

    await db.commit()
    return {"status": "success", "deleted": len(assets)}
