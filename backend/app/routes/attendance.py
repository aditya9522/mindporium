from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from datetime import datetime

from app.api import deps
from app.models.attendance import Attendance
from app.models.classroom import Classroom
from app.models.user import User
from app.schemas.attendance import AttendanceCreate, AttendanceResponse, AttendanceUpdate
from app.models.enums import RoleEnum

router = APIRouter()


@router.post("/", response_model=AttendanceResponse)
async def mark_attendance(
    *,
    db: AsyncSession = Depends(deps.get_db),
    attendance_in: AttendanceCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark attendance (e.g. when joining a class).
    """
    # Check classroom
    result = await db.execute(select(Classroom).where(Classroom.id == attendance_in.classroom_id))
    classroom = result.scalars().first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")

    # Check if already marked?
    # Usually we might have multiple sessions. Allow new one.
    
    attendance = Attendance(
        classroom_id=attendance_in.classroom_id,
        user_id=current_user.id,
        joined_at=datetime.utcnow(),
        is_present=True,
        status="present"
    )
    db.add(attendance)
    await db.commit()
    await db.refresh(attendance)
    
    # Populate helper title
    attendance.classroom_title = classroom.title
    
    return attendance


@router.get("/me", response_model=List[AttendanceResponse])
async def read_my_attendance(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's attendance history.
    """
    query = (
        select(Attendance)
        .where(Attendance.user_id == current_user.id)
        .options(selectinload(Attendance.classroom))
        .order_by(desc(Attendance.joined_at))
        .offset(skip).limit(limit)
    )
    result = await db.execute(query)
    attendances = result.scalars().all()
    
    # Map title manually or use schema with simple mapping
    for att in attendances:
        if att.classroom:
            att.classroom_title = att.classroom.title
            
    return attendances


@router.get("/classroom/{classroom_id}", response_model=List[AttendanceResponse])
async def get_classroom_attendance(
    classroom_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Get attendance records for a specific classroom (Instructor).
    """
    # Check classroom
    result = await db.execute(select(Classroom).where(Classroom.id == classroom_id))
    classroom = result.scalars().first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")

    # Permission check: Admin or Instructor of the class
    if current_user.role != RoleEnum.admin and classroom.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(
        select(Attendance)
        .where(Attendance.classroom_id == classroom_id)
        .options(selectinload(Attendance.user), selectinload(Attendance.classroom))
        .order_by(desc(Attendance.joined_at))
    )
    attendances = result.scalars().all()
    
    for att in attendances:
        if att.classroom:
            att.classroom_title = att.classroom.title
            
    return attendances
