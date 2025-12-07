from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, update

from app.api import deps
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationResponse

router = APIRouter()


@router.get("/", response_model=List[NotificationResponse])
async def read_notifications(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's notifications.
    """
    query = select(Notification).where(Notification.user_id == current_user.id).order_by(desc(Notification.created_at))
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(
    notification_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark a notification as read.
    """
    result = await db.execute(select(Notification).where(Notification.id == notification_id, Notification.user_id == current_user.id))
    notification = result.scalars().first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


@router.put("/read-all")
async def mark_all_as_read(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark all notifications as read.
    """
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.commit()
    return {"message": "All notifications marked as read"}
