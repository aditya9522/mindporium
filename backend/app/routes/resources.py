from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.api import deps
from app.models.resource import Resource
from app.models.course import Course
from app.models.subject import Subject
from app.models.user import User
from app.schemas.resource import ResourceCreate, ResourceResponse, ResourceUpdate
from app.models.enums import RoleEnum

router = APIRouter()


@router.post("/", response_model=ResourceResponse)
async def create_resource(
    *,
    db: AsyncSession = Depends(deps.get_db),
    resource_in: ResourceCreate,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Create a new resource. Instructor only.
    """
    # Verify ownership
    if resource_in.subject_id:
        result = await db.execute(select(Subject).where(Subject.id == resource_in.subject_id))
        subject = result.scalars().first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # Check course ownership
        result_course = await db.execute(select(Course).where(Course.id == subject.course_id))
        course = result_course.scalars().first()
        if current_user.role != RoleEnum.admin and course.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")

    resource = Resource(**resource_in.model_dump())
    db.add(resource)
    await db.commit()
    await db.refresh(resource)
    return resource


@router.get("/subject/{subject_id}", response_model=List[ResourceResponse])
async def read_subject_resources(
    subject_id: int,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Get resources for a subject.
    """
    query = select(Resource).where(Resource.subject_id == subject_id).order_by(Resource.order_index)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/course/{course_id}", response_model=List[ResourceResponse])
async def read_course_resources(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get resources for a course (via subjects).
    """
    query = (
        select(Resource)
        .join(Subject, Resource.subject_id == Subject.id)
        .where(Subject.course_id == course_id)
        .order_by(Resource.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/{resource_id}")
async def delete_resource(
    *,
    db: AsyncSession = Depends(deps.get_db),
    resource_id: int,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Delete a resource.
    """
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalars().first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    # Check permissions
    if resource.subject_id:
        result_subject = await db.execute(select(Subject).where(Subject.id == resource.subject_id))
        subject = result_subject.scalars().first()
        if subject:
            result_course = await db.execute(select(Course).where(Course.id == subject.course_id))
            course = result_course.scalars().first()
            
            if current_user.role != RoleEnum.admin and course.created_by != current_user.id:
                raise HTTPException(status_code=403, detail="Not enough permissions")
    
    await db.delete(resource)
    await db.commit()
    return {"message": "Resource deleted"}
