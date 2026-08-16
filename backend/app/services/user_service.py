import uuid
from datetime import timedelta
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core import security
from app.models.user import User
from app.models.enums import RoleEnum
from app.schemas.user import UserCreateInstructor, UserCreateAdmin

class UserService:
    def create_setup_token(self, user: User) -> str:
        return security.create_access_token(
            subject=user.id,
            expires_delta=timedelta(days=7)
        )

    async def create_instructor(self, db: AsyncSession, user_in: UserCreateInstructor) -> User:
        # 1. Check if user exists
        result = await db.execute(select(User).where(User.email == user_in.email))
        if result.scalars().first():
            raise ValueError("User with this email already exists")

        # 2. Create user with temporary random password
        temp_password = str(uuid.uuid4())
        hashed_password = security.get_password_hash(temp_password)
        
        user = User(
            email=user_in.email,
            full_name=user_in.full_name,
            password=hashed_password,
            role=RoleEnum.instructor,
            is_active=True,
            is_verified=True, # Trusted since admin created
            bio=user_in.bio,
            experience=user_in.experience
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        return user

    async def create_admin(self, db: AsyncSession, user_in: UserCreateAdmin) -> User:
        # 1. Check if user exists
        result = await db.execute(select(User).where(User.email == user_in.email))
        if result.scalars().first():
            raise ValueError("User with this email already exists")

        # 2. Create user with temporary random password
        temp_password = str(uuid.uuid4())
        hashed_password = security.get_password_hash(temp_password)
        
        user = User(
            email=user_in.email,
            full_name=user_in.full_name,
            password=hashed_password,
            role=RoleEnum.admin,
            is_active=True,
            is_verified=True, # Trusted since admin created
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        return user

    async def setup_password(self, db: AsyncSession, user_id: int, new_password: str) -> User:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            raise ValueError("User not found")
        
        user.password = security.get_password_hash(new_password)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

user_service = UserService()
