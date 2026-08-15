import datetime
from sqlalchemy import update
from app.models.user import User
from app.db.database import get_sessionmaker

async def update_user_activity(user_id: int, last_active: datetime.datetime, current_streak: int):
    now = datetime.datetime.utcnow()
    session_maker = get_sessionmaker()
    
    async with session_maker() as db:
        try:
            if not last_active:
                await db.execute(
                    update(User)
                    .where(User.id == user_id)
                    .values(last_active_at=now, streak_count=1)
                )
                await db.commit()
                return

            last_date = last_active.date()
            curr_date = now.date()
            delta_days = (curr_date - last_date).days

            if delta_days == 1:
                # Consecutive day - increment streak
                await db.execute(
                    update(User)
                    .where(User.id == user_id)
                    .values(last_active_at=now, streak_count=current_streak + 1)
                )
                await db.commit()
            elif delta_days > 1:
                # Streak broken - reset to 1
                await db.execute(
                    update(User)
                    .where(User.id == user_id)
                    .values(last_active_at=now, streak_count=1)
                )
                await db.commit()
            elif delta_days == 0:
                # Same day - just update timestamp (throttle to 1 hour)
                if (now - last_active).total_seconds() > 3600:
                    await db.execute(
                        update(User)
                        .where(User.id == user_id)
                        .values(last_active_at=now)
                    )
                    await db.commit()
        except Exception:
            await db.rollback()
            raise
