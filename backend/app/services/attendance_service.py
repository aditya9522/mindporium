from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.attendance import Attendance
from app.models.enums import AttendanceStatusEnum
from app.db.database import get_sessionmaker

class AttendanceService:
    async def mark_attendance_join(self, classroom_id: int, user_id: int, ip_address: str = None):
        async_session = get_sessionmaker()
        async with async_session() as db:
            # Check if already has an open attendance session? 
            # Or just create new one. For simplicity, create new one.
            attendance = Attendance(
                classroom_id=classroom_id,
                user_id=user_id,
                joined_at=datetime.utcnow(),
                ip_address=ip_address,
                status=AttendanceStatusEnum.present
            )
            db.add(attendance)
            await db.commit()
            await db.refresh(attendance)
            return attendance.id

    async def mark_attendance_leave(self, attendance_id: int):
        if not attendance_id:
            return
            
        async_session = get_sessionmaker()
        async with async_session() as db:
            result = await db.execute(select(Attendance).where(Attendance.id == attendance_id))
            attendance = result.scalars().first()
            if attendance:
                attendance.left_at = datetime.utcnow()
                # Calculate duration
                if attendance.joined_at:
                    delta = attendance.left_at - attendance.joined_at
                    attendance.duration_minutes = int(delta.total_seconds() / 60)
                
                db.add(attendance)
                await db.commit()

attendance_service = AttendanceService()
