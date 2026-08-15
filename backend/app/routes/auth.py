from datetime import timedelta, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import ValidationError, BaseModel
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.token import Token, TokenPayload
from app.schemas.user import (
    UserCreate, 
    UserResponse, 
    GoogleLoginRequest,
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

    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()


    if not user or not security.verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")


    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": security.create_refresh_token(user.id),
        "token_type": "bearer",
    }


@router.post("/google", response_model=Token)
async def login_google(
    *,
    db: AsyncSession = Depends(deps.get_db),
    request_data: GoogleLoginRequest,
) -> Any:
    """
    Verify Google ID Token and login the user only if they exist
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth is not configured on the server."
        )

    try:
        idinfo = google_id_token.verify_oauth2_token(
            request_data.id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        google_id = idinfo['sub']
        email = idinfo['email']
        full_name = idinfo.get('name', '')
        photo = idinfo.get('picture', None)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Google token: {str(e)}"
        )

    # 1. Search for user by google_id
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalars().first()

    if not user:
        # 2. Search for user by email
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()

        if user:
            # Link Google account
            user.google_id = google_id
            if photo and not user.photo:
                user.photo = photo
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found. Please sign up first."
            )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": security.create_refresh_token(user.id),
        "token_type": "bearer",
    }


@router.post("/google/signup", response_model=Token)
async def signup_google(
    *,
    db: AsyncSession = Depends(deps.get_db),
    request_data: GoogleLoginRequest,
) -> Any:
    """
    Verify Google ID Token and register the user (or login if they already exist)
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth is not configured on the server."
        )

    try:
        idinfo = google_id_token.verify_oauth2_token(
            request_data.id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        google_id = idinfo['sub']
        email = idinfo['email']
        full_name = idinfo.get('name', '')
        photo = idinfo.get('picture', None)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Google token: {str(e)}"
        )

    # 1. Search for user by google_id
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalars().first()

    if not user:
        # 2. Search for user by email
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()

        if user:
            # Link Google account
            user.google_id = google_id
            if photo and not user.photo:
                user.photo = photo
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            # 3. Create new student user
            user = User(
                email=email,
                full_name=full_name,
                google_id=google_id,
                photo=photo,
                is_active=True,
                is_verified=True,  # pre-verified by Google
                role="student"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

            # 4. Handle referral if provided
            if request_data.referral_code:
                from app.models.referral import Referral
                result_ref = await db.execute(select(Referral).where(Referral.referral_code == request_data.referral_code))
                referral = result_ref.scalars().first()
                if referral and referral.status == "pending":
                    referral.status = "registered"
                    referral.referred_email = user.email
                    db.add(referral)
                    await db.commit()

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

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

    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system",
        )
    

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

    if user_in.referral_code:
        from app.models.referral import Referral
        from sqlalchemy import update
        # Find pending referral by this code
        result_ref = await db.execute(select(Referral).where(Referral.referral_code == user_in.referral_code))
        referral = result_ref.scalars().first()
        if referral and referral.status == "pending":
            referral.status = "registered"
            referral.referred_email = user.email
            db.add(referral)
            await db.commit()
    
    return user


@router.get("/referrals/info")
async def get_referral_info(
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """
    Get user's active referrals and custom invite link.
    """
    from app.models.referral import Referral
    import uuid

    # Fetch existing referrals
    result = await db.execute(select(Referral).where(Referral.referrer_id == current_user.id))
    referrals = result.scalars().all()

    # Generate a unique static code for the user if they want to share it directly
    # A simple approach: first 4 letters of name + user_id + random hash
    base = current_user.full_name.replace(" ", "").lower()[:4]
    custom_code = f"{base}{current_user.id}ref"
    
    referral_link = f"{settings.FRONTEND_URL}/register?ref={custom_code}"

    return {
        "referral_code": custom_code,
        "referral_link": referral_link,
        "referrals": [
            {"email": r.referred_email, "status": r.status, "date": r.created_at} 
            for r in referrals
        ]
    }


class ReferralInviteRequest(BaseModel):
    email: str

@router.post("/referrals/invite")
async def invite_referral(
    request: ReferralInviteRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    """
    Send email invitation with referral link.
    """
    from app.models.referral import Referral
    from pydantic import EmailStr
    
    email = request.email
    base = current_user.full_name.replace(" ", "").lower()[:4]
    custom_code = f"{base}{current_user.id}ref"
    
    # Check if referral already exists
    result = await db.execute(select(Referral).where(
        (Referral.referrer_id == current_user.id) & 
        (Referral.referred_email == email)
    ))
    existing = result.scalars().first()
    
    if not existing:
        new_ref = Referral(
            referrer_id=current_user.id,
            referred_email=email,
            referral_code=custom_code,
            status="pending"
        )
        db.add(new_ref)
        await db.commit()
        
    referral_link = f"{settings.FRONTEND_URL}/register?ref={custom_code}"
    
    # background_tasks.add_task(email_service.send_referral_email, email, referral_link)
    
    return {"message": f"Invitation sent to {email}", "success": True, "referral_link": referral_link}



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
    background_tasks: BackgroundTasks = BackgroundTasks(),
    request: ForgotPasswordRequest,
) -> Any:
    """
    Request password reset - sends OTP to user's email
    """

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
    

    otp = security.generate_otp()
    

    user.password_reset_otp = otp
    user.otp_created_at = datetime.utcnow()
    user.otp_attempts = 0
    
    await db.commit()
    

    background_tasks.add_task(
        email_service.send_password_reset_otp_email,
        email_to=user.email,
        full_name=user.full_name,
        otp=otp
    )
    
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
    
    user.password = security.get_password_hash(request.new_password)
    user.password_reset_otp = None
    user.otp_created_at = None
    user.otp_attempts = 0
    
    await db.commit()
    
    return PasswordResetResponse(
        message="Password has been reset successfully",
        success=True
    )

