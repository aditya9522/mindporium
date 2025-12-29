from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_, func, distinct
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.subject import Subject
from app.models.feedback import CourseFeedback
from app.models.user import User
from app.schemas.course import CourseCreate, CourseResponse, CourseUpdate, CourseDetailResponse
from app.models.enums import RoleEnum
from app.services.notification_service import notification_service
from app.core.redis import redis_manager
import json

router = APIRouter()


@router.get("/", response_model=List[CourseResponse])
async def read_courses(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
) -> Any:
    """
    Retrieve courses. Public endpoint.
    """
    # 1. Try cache
    cache_key = f"courses:public:{skip}:{limit}:{search or ''}"
    cached_data = await redis_manager.get(cache_key)
    if cached_data:
        return json.loads(cached_data)

    query = select(Course).where(Course.is_published == True)
    
    if search:
        query = query.where(Course.title.ilike(f"%{search}%"))
        
    query = query.offset(skip).limit(limit).order_by(desc(Course.created_at))
    result = await db.execute(query)
    courses = result.scalars().all()
    
    # 2. Store in cache (60 seconds)
    # Serialize to compatible JSON
    data_to_cache = [CourseResponse.model_validate(c).model_dump(mode='json') for c in courses]
    await redis_manager.set(cache_key, json.dumps(data_to_cache), expire=60)
    
    return courses


@router.post("/", response_model=CourseResponse)
async def create_course(
    *,
    db: AsyncSession = Depends(deps.get_db),
    course_in: CourseCreate,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Create new course. Instructor only.
    """
    course = Course(
        **course_in.model_dump(),
        created_by=current_user.id
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    
    # Notify all students about new course if published
    if course.is_published:
        students_result = await db.execute(select(User).where(User.role == RoleEnum.student))
        students = students_result.scalars().all()
        if students:
            background_tasks.add_task(
                notification_service.notify_course_created,
                user_ids=[s.id for s in students],
                course_title=course.title,
                instructor_name=current_user.full_name
            )
    
    return course


@router.get("/{course_id}", response_model=CourseDetailResponse)
async def read_course(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get course by ID.
    """
    result = await db.execute(
        select(Course)
        .options(selectinload(Course.instructors))
        .where(Course.id == course_id)
    )
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    *,
    db: AsyncSession = Depends(deps.get_db),
    course_id: int,
    course_in: CourseUpdate,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Update a course. Instructor only.
    """
    result = await db.execute(
        select(Course)
        .options(selectinload(Course.instructors))
        .where(Course.id == course_id)
    )
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check permissions (Admin can edit all, Instructor only their own or assigned)
    is_assigned = False
    if course.instructors:
        for instructor in course.instructors:
             if instructor.id == current_user.id:
                 is_assigned = True
                 break

    if current_user.role != RoleEnum.admin and course.created_by != current_user.id and not is_assigned:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = course_in.model_dump(exclude_unset=True)
    
    # Handle instructors assignment
    if "instructors" in update_data:
        instructor_ids = update_data.pop("instructors")
        if instructor_ids is not None:
             # Verify all instructors exist and are actually instructors
             instructors_result = await db.execute(
                 select(User).where(User.id.in_(instructor_ids), User.role == RoleEnum.instructor)
             )
             instructors = instructors_result.scalars().all()
             if len(instructors) != len(instructor_ids):
                 raise HTTPException(status_code=400, detail="One or more instructors not found or invalid")
             
             course.instructors = instructors

    for field, value in update_data.items():
        setattr(course, field, value)

    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course


@router.delete("/{course_id}", response_model=CourseResponse)
async def delete_course(
    *,
    db: AsyncSession = Depends(deps.get_db),
    course_id: int,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Delete a course. Instructor only.
    """
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check permissions
    if current_user.role != RoleEnum.admin and course.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    from app.services.storage_service import storage_service
    await storage_service.delete_folder(f"courses/{course.id}")
    
    await db.delete(course)
    await db.commit()
    return course


@router.get("/instructor/my-courses", response_model=List[CourseResponse])
async def get_my_courses(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Get all courses created by the current instructor.
    """
    query = select(Course).where(
        or_(
            Course.created_by == current_user.id,
            Course.instructors.any(User.id == current_user.id)
        )
    )
    
    if search:
        query = query.where(Course.title.ilike(f"%{search}%"))
        
    query = query.offset(skip).limit(limit).order_by(desc(Course.created_at))
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/admin/all", response_model=List[CourseResponse])
async def read_all_courses_admin(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve all courses (including drafts) for admin.
    """
    query = select(
        Course,
        func.count(distinct(Enrollment.id)).label("enrollments_count"),
        func.count(distinct(Subject.id)).label("subjects_count"),
        func.avg(CourseFeedback.rating).label("rating")
    ).outerjoin(Enrollment, Course.id == Enrollment.course_id) \
     .outerjoin(Subject, Course.id == Subject.course_id) \
     .outerjoin(CourseFeedback, Course.id == CourseFeedback.course_id)
    
    if search:
        query = query.where(Course.title.ilike(f"%{search}%"))
        
    query = query.group_by(Course.id).offset(skip).limit(limit).order_by(desc(Course.created_at))
    
    result = await db.execute(query)
    rows = result.all()
    
    courses_with_stats = []
    for course, enroll_count, subj_count, rating in rows:
        setattr(course, "enrollments_count", enroll_count)
        setattr(course, "subjects_count", subj_count)
        setattr(course, "rating", round(float(rating or 0.0), 1))
        courses_with_stats.append(course)
        
    return courses_with_stats
