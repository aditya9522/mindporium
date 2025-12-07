from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.models.enums import RoleEnum

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_user_me(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    if user_in.email:
        result = await db.execute(select(User).where(User.email == user_in.email))
        existing_user = result.scalars().first()
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=400,
                detail="This email is already assigned to another user",
            )
            
    user_data = user_in.model_dump(exclude_unset=True)
    for field, value in user_data.items():
        setattr(current_user, field, value)

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.get("/", response_model=list[UserResponse])
async def read_users(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    role: str | None = None,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve users. Admin only.
    """
    query = select(User)
    if role:
        query = query.where(User.role == role)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/instructors", response_model=list[UserResponse])
async def read_instructors_public(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all instructors (Public).
    """
    query = select(User).where(User.role == RoleEnum.instructor, User.is_active == True)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/students", response_model=list[dict])
async def read_students(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve all students with enrollment statistics.
    Only accessible by admins and instructors.
    """
    # Check if user is admin or instructor
    if current_user.role not in [RoleEnum.admin, RoleEnum.instructor]:
        raise HTTPException(
            status_code=403,
            detail="Only admins and instructors can view student list"
        )
    
    from app.models.enrollment import Enrollment
    from sqlalchemy import func
    
    # Get students with enrollment count
    query = select(
        User,
        func.count(Enrollment.id).label('enrolled_courses')
    ).outerjoin(
        Enrollment, User.id == Enrollment.user_id
    ).where(
        User.role == RoleEnum.student,
        User.is_active == True
    ).group_by(User.id).offset(skip).limit(limit)
    
    result = await db.execute(query)
    rows = result.all()
    
    students = []
    for user, enrolled_courses in rows:
        students.append({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "photo": user.photo,
            "enrolled_courses": enrolled_courses,
            "completed_courses": 0,  # TODO: Calculate from resource_completion
            "average_grade": 0,  # TODO: Calculate from submissions
            "created_at": user.created_at.isoformat() if user.created_at else None
        })
    
    return students


@router.get("/instructors/{instructor_id}")
async def read_instructor_public(
    instructor_id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get a specific instructor's details with dashboard statistics (Public).
    """
    # Get instructor details
    result = await db.execute(
        select(User).where(
            User.id == instructor_id,
            User.role == RoleEnum.instructor,
            User.is_active == True
        )
    )
    instructor = result.scalars().first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")
        
    from app.models.course import Course
    from app.models.enrollment import Enrollment
    from app.models.feedback import InstructorFeedback
    from sqlalchemy import func
    
    # Get stats
    # 1. Total Courses
    courses_count = await db.execute(
        select(func.count(Course.id))
        .join(Course.instructors)
        .where(
            User.id == instructor_id,
            Course.is_published == True
        )
    )
    
    # 2. Total Students
    students_count = await db.execute(
        select(func.count(Enrollment.id))
        .join(Course, Enrollment.course_id == Course.id)
        .join(Course.instructors)
        .where(User.id == instructor_id)
    )
    
    # 3. Average Rating
    rating_stats = await db.execute(
        select(func.avg(InstructorFeedback.rating), func.count(InstructorFeedback.id))
        .where(InstructorFeedback.instructor_id == instructor_id)
    )
    avg_rating, reviews_count = rating_stats.first() or (0, 0)
    
    return {
        "id": instructor.id,
        "full_name": instructor.full_name,
        "email": instructor.email,
        "photo": instructor.photo,
        "banner_image": instructor.banner_image,
        "bio": instructor.bio,
        "experience": instructor.experience,
        "social_links": instructor.social_links,
        "role": instructor.role,
        "stats": {
            "total_courses": courses_count.scalar() or 0,
            "total_students": students_count.scalar() or 0,
            "average_rating": round(float(avg_rating or 0), 1),
            "reviews_count": reviews_count or 0
        }
    }


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a user. Admin only.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_data = user_in.model_dump(exclude_unset=True)
    for field, value in user_data.items():
        setattr(user, field, value)

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}")
async def delete_user(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a user. Admin only.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Prevent deleting self
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    await db.delete(user)
    await db.commit()
    return {"message": "User deleted successfully"}
