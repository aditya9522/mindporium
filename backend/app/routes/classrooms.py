import uuid
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.classroom import Classroom
from app.models.class_message import ClassMessage
from app.models.user import User
from app.schemas.classroom import ClassroomCreate, ClassroomResponse, ClassroomUpdate, ClassMessageCreate, ClassMessageResponse
from app.models.enums import RoleEnum, ClassroomProviderEnum

router = APIRouter()


@router.post("/", response_model=ClassroomResponse)
async def create_classroom(
    *,
    db: AsyncSession = Depends(deps.get_db),
    classroom_in: ClassroomCreate,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Create a new classroom (Schedule a class).
    """
    # Generate unique meeting ID if custom provider
    meeting_id = str(uuid.uuid4()) if classroom_in.provider == ClassroomProviderEnum.custom else None
    
    classroom = Classroom(
        **classroom_in.model_dump(),
        instructor_id=current_user.id,
        meeting_id=meeting_id
    )
    db.add(classroom)
    await db.commit()
    await db.refresh(classroom)
    return classroom


@router.get("/", response_model=List[ClassroomResponse])
async def read_classrooms(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    List classrooms.
    """
    # If student, maybe show only enrolled courses' classes? 
    # For now, show all public/active classes for simplicity or filter by instructor
    query = select(Classroom).where(Classroom.is_active == True).options(selectinload(Classroom.instructor))
    query = query.offset(skip).limit(limit).order_by(desc(Classroom.start_time))
    result = await db.execute(query)
    return result.scalars().all()




@router.get("/course/{course_id}", response_model=List[ClassroomResponse])
async def read_course_classrooms(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get classrooms for a specific course.
    """
    from app.models.subject import Subject
    
    query = (
        select(Classroom)
        .join(Subject, Classroom.subject_id == Subject.id)
        .where(Subject.course_id == course_id)
        .options(selectinload(Classroom.instructor))
        .order_by(desc(Classroom.start_time))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{classroom_id}", response_model=ClassroomResponse)
async def read_classroom(
    classroom_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get classroom details.
    """
    result = await db.execute(select(Classroom).where(Classroom.id == classroom_id).options(selectinload(Classroom.instructor)))
    classroom = result.scalars().first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    return classroom


@router.put("/{classroom_id}/assign-instructor/{instructor_id}", response_model=ClassroomResponse)
async def assign_instructor(
    classroom_id: int,
    instructor_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Assign an instructor to a classroom. Admin only.
    """
    # Check classroom
    result = await db.execute(select(Classroom).where(Classroom.id == classroom_id))
    classroom = result.scalars().first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
        
    # Check instructor
    result_user = await db.execute(select(User).where(User.id == instructor_id))
    instructor = result_user.scalars().first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")
        
    if instructor.role not in [RoleEnum.instructor, RoleEnum.admin]:
        raise HTTPException(status_code=400, detail="User is not an instructor")
        
    classroom.instructor_id = instructor.id
    db.add(classroom)
    await db.commit()
    await db.refresh(classroom)
    return classroom


from app.models.subject import Subject
from app.models.enrollment import Enrollment

@router.post("/{classroom_id}/join")
async def join_classroom(
    classroom_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get connection details (TURN credentials, WebSocket URL) to join the class.
    """
    from app.core.config import settings
    
    result = await db.execute(select(Classroom).where(Classroom.id == classroom_id))
    classroom = result.scalars().first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")

    # Check enrollment if subject is linked
    if classroom.subject_id:
        result_subject = await db.execute(select(Subject).where(Subject.id == classroom.subject_id))
        subject = result_subject.scalars().first()
        
        if subject:
            # Check if user is enrolled in the course
            result_enrollment = await db.execute(
                select(Enrollment).where(
                    Enrollment.course_id == subject.course_id,
                    Enrollment.user_id == current_user.id
                )
            )
            enrollment = result_enrollment.scalars().first()
            
            # Allow if enrolled, or if user is the instructor/admin
            is_authorized = (
                enrollment is not None or 
                current_user.role in [RoleEnum.instructor, RoleEnum.admin] or
                classroom.instructor_id == current_user.id
            )
            
            if not is_authorized:
                 raise HTTPException(status_code=403, detail="You must be enrolled in the course to join this class")
    
    return {
        "classroom_id": classroom.id,
        "meeting_id": classroom.meeting_id,
        "websocket_url": f"ws/classroom/{classroom_id}", # Frontend will append base URL
        "turn_server": {
            "urls": [f"turn:{settings.TURN_URL}"],
            "username": settings.TURN_USERNAME,
            "credential": settings.TURN_PASSWORD,
        },
        "user": {
            "id": current_user.id,
            "name": current_user.full_name,
            "role": current_user.role,
            "photo": current_user.photo
        }
    }


@router.put("/{classroom_id}/start", response_model=ClassroomResponse)
async def start_classroom(
    classroom_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Start a classroom session. Instructor only.
    """
    result = await db.execute(select(Classroom).where(Classroom.id == classroom_id))
    classroom = result.scalars().first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
        
    # Check permissions
    if current_user.role != RoleEnum.admin and classroom.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    classroom.status = "live"
    # classroom.start_time = datetime.utcnow() # Optional: update actual start time
    db.add(classroom)
    await db.commit()
    await db.refresh(classroom)
    return classroom


@router.put("/{classroom_id}/end", response_model=ClassroomResponse)
async def end_classroom(
    classroom_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    End a classroom session. Instructor only.
    """
    result = await db.execute(select(Classroom).where(Classroom.id == classroom_id))
    classroom = result.scalars().first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
        
    if current_user.role != RoleEnum.admin and classroom.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    classroom.status = "completed"
    # classroom.end_time = datetime.utcnow()
    db.add(classroom)
    await db.commit()
    await db.refresh(classroom)
    return classroom


@router.put("/{classroom_id}", response_model=ClassroomResponse)
async def update_classroom(
    *,
    db: AsyncSession = Depends(deps.get_db),
    classroom_id: int,
    classroom_in: ClassroomUpdate,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:

    """
    Update a classroom. Instructor only.
    """

    result = await db.execute(select(Classroom).where(Classroom.id == classroom_id).options(selectinload(Classroom.instructor)))
    classroom = result.scalars().first()
    
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
        
    # Check permissions
    if current_user.role != RoleEnum.admin and classroom.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = classroom_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(classroom, field, value)
        
    db.add(classroom)
    await db.commit()
    await db.refresh(classroom)
    return classroom


@router.delete("/{classroom_id}")
async def delete_classroom(
    *,
    db: AsyncSession = Depends(deps.get_db),
    classroom_id: int,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:

    """
    Delete a classroom. Instructor only.
    """

    result = await db.execute(select(Classroom).where(Classroom.id == classroom_id))
    classroom = result.scalars().first()

    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")

    # Check permissions
    if current_user.role != RoleEnum.admin and classroom.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    await db.delete(classroom)
    await db.commit()
    return {"message": "Classroom deleted successfully"}


@router.get("/{classroom_id}/messages", response_model=List[ClassMessageResponse])
async def read_classroom_messages(
    classroom_id: int,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get messages for a classroom.
    """
    result = await db.execute(select(Classroom).where(Classroom.id == classroom_id))
    classroom = result.scalars().first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
        
    query = (
        select(ClassMessage)
        .where(ClassMessage.classroom_id == classroom_id)
        .options(selectinload(ClassMessage.user))
        .order_by(ClassMessage.created_at.asc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/{classroom_id}/messages", response_model=ClassMessageResponse)
async def create_classroom_message(
    classroom_id: int,
    message_in: ClassMessageCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Post a message to a classroom.
    """
    result = await db.execute(select(Classroom).where(Classroom.id == classroom_id))
    classroom = result.scalars().first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
        
    message = ClassMessage(
        classroom_id=classroom_id,
        user_id=current_user.id,
        message_text=message_in.message_text,
        message_type=message_in.message_type
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    
    query = select(ClassMessage).where(ClassMessage.id == message.id).options(selectinload(ClassMessage.user))
    result = await db.execute(query)
    return result.scalars().first()
