from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api import deps
from app.models.system_setting import SystemSetting
from app.models.user import User
from app.schemas.system_setting import SystemSettingCreate, SystemSettingResponse, SystemSettingUpdate
from app.models.enums import RoleEnum

router = APIRouter()

@router.get("", response_model=List[SystemSettingResponse])
async def read_settings(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all settings. Admins see all, others see only public.
    """
    query = select(SystemSetting)
    if current_user.role != RoleEnum.admin:
        # Non-admins only see public settings
        query = query.where(SystemSetting.is_public == True)
        
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/public", response_model=List[SystemSettingResponse])
async def read_public_settings(
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get only public settings. No login required.
    """
    result = await db.execute(select(SystemSetting).where(SystemSetting.is_public == True))
    return result.scalars().all()

@router.post("", response_model=SystemSettingResponse)
async def create_setting(
    *,
    db: AsyncSession = Depends(deps.get_db),
    setting_in: SystemSettingCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create a new setting. Admin only.
    """
    setting = SystemSetting(**setting_in.model_dump())
    db.add(setting)
    await db.commit()
    await db.refresh(setting)
    return setting

@router.put("/{key:path}", response_model=SystemSettingResponse)
async def update_setting(
    *,
    db: AsyncSession = Depends(deps.get_db),
    key: str,
    setting_in: SystemSettingUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a setting. Admin only. Supports dot notation in keys.
    """
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
    setting = result.scalars().first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
        
    update_data = setting_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(setting, field, value)
        
    db.add(setting)
    await db.commit()
    await db.refresh(setting)
    return setting

@router.delete("/{key:path}")
async def delete_setting(
    *,
    db: AsyncSession = Depends(deps.get_db),
    key: str,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a setting. Admin only. Supports dot notation in keys.
    """
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
    setting = result.scalars().first()
    if not setting:
        return {"msg": "Setting not found"}
        
    await db.delete(setting)
    await db.commit()
    return {"msg": "Setting deleted"}
