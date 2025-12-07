from datetime import timedelta, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import ValidationError

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.token import Token, TokenPayload
from app.schemas.user import (
    UserCreate, 
    UserResponse, 
    PasswordSetup,
    ForgotPasswordRequest,
    VerifyOTPRequest,
    ResetPasswordRequest,
    PasswordResetResponse
)
from app.services.user_service import user_service
from app.services.email import email_service
from jose import jwt, JWTError

router = APIRouter()


@router.post("/login", response_model=Token)
async def login_access_token(
    db: AsyncSession = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # 1. Fetch user by email
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()

    # 2. Authenticate
    if not user or not security.verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # 3. Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": security.create_refresh_token(user.id),
        "token_type": "bearer",
    }


@router.post("/register", response_model=UserResponse)
async def register_user(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user without the need to be logged in
    """
    # 1. Check if user exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system",
        )
    
    # 2. Create user
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        password=security.get_password_hash(user_in.password),
        role=user_in.role,
        is_active=user_in.is_active,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


@router.post("/setup-password", response_model=UserResponse)
async def setup_password(
    *,
    db: AsyncSession = Depends(deps.get_db),
    setup_in: PasswordSetup,
) -> Any:
    """
    Set password using a valid token (e.g. from welcome email).
    """
    try:
        payload = jwt.decode(
            setup_in.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
        
    try:
        user = await user_service.setup_password(db, int(token_data.sub), setup_in.new_password)
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/forgot-password", response_model=PasswordResetResponse)
async def forgot_password(
    *,
    db: AsyncSession = Depends(deps.get_db),
    request: ForgotPasswordRequest,
) -> Any:
    """
    Request password reset - sends OTP to user's email
    """
    # 1. Find user by email
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalars().first()
    
    if not user:
        # Don't reveal if user exists or not for security
        return PasswordResetResponse(
            message="If an account with that email exists, an OTP has been sent.",
            success=True
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive"
        )
    
    # 2. Generate OTP
    otp = security.generate_otp()
    
    # 3. Save OTP to database
    user.password_reset_otp = otp
    user.otp_created_at = datetime.utcnow()
    user.otp_attempts = 0  # Reset attempts counter
    
    await db.commit()
    
    # 4. Send OTP via email
    try:
        await email_service.send_password_reset_otp_email(
            email_to=user.email,
            full_name=user.full_name,
            otp=otp
        )
    except Exception as e:
        # Log error but don't reveal to user
        print(f"Failed to send OTP email: {e}")
    
    return PasswordResetResponse(
        message="If an account with that email exists, an OTP has been sent.",
        success=True
    )


@router.post("/verify-otp", response_model=PasswordResetResponse)
async def verify_otp(
    *,
    db: AsyncSession = Depends(deps.get_db),
    request: VerifyOTPRequest,
) -> Any:
    """
    Verify OTP - required before password reset
    """
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalars().first()
    
    if not user or not user.password_reset_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    if not security.is_otp_valid(user.otp_created_at, settings.OTP_EXPIRY_MINUTES):
        user.password_reset_otp = None
        user.otp_created_at = None
        user.otp_attempts = 0
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
    
    if user.otp_attempts >= settings.OTP_MAX_ATTEMPTS:
        user.password_reset_otp = None
        user.otp_created_at = None
        user.otp_attempts = 0
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts. Please request a new OTP."
        )
    
    if user.password_reset_otp != request.otp:
        user.otp_attempts += 1
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OTP. {settings.OTP_MAX_ATTEMPTS - user.otp_attempts} attempts remaining."
        )
    
    user.is_verified = True
    await db.commit()
    
    return PasswordResetResponse(
        message="OTP verified successfully. You can now reset your password.",
        success=True
    )



@router.post("/reset-password", response_model=PasswordResetResponse)
async def reset_password(
    *,
    db: AsyncSession = Depends(deps.get_db),
    request: ResetPasswordRequest,
) -> Any:
    """
    Reset password - requires OTP to be verified first
    """
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalars().first()
    
    if not user or not user.password_reset_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please verify OTP first"
        )
    
    if not security.is_otp_valid(user.otp_created_at, settings.OTP_EXPIRY_MINUTES):
        user.password_reset_otp = None
        user.otp_created_at = None
        user.otp_attempts = 0
        user.is_verified = False
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
    
    if user.password_reset_otp != request.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    user.password = security.get_password_hash(request.new_password)
    user.password_reset_otp = None
    user.otp_created_at = None
    user.otp_attempts = 0
    
    await db.commit()
    
    return PasswordResetResponse(
        message="Password has been reset successfully",
        success=True
    )

