from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.enums import RoleEnum
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_active: Optional[bool] = True


class UserCreate(UserBase):
    password: str
    role: RoleEnum = RoleEnum.student


class UserCreateInstructor(UserBase):
    bio: Optional[str] = None
    experience: Optional[str] = None
    # No password here, it will be set later


class UserCreateAdmin(UserBase):
    # No password here, it will be set later
    pass


class PasswordSetup(BaseModel):
    token: str
    new_password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    experience: Optional[str] = None
    social_links: Optional[dict] = None
    photo: Optional[str] = None
    banner_image: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[RoleEnum] = None


class UserResponse(UserBase):
    id: int
    role: RoleEnum
    is_verified: bool
    photo: Optional[str] = None
    banner_image: Optional[str] = None
    bio: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Password Reset Schemas
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)


class PasswordResetResponse(BaseModel):
    message: str
    success: bool

