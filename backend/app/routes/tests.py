from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.test import Test, TestQuestion
from app.models.subject import Subject
from app.models.classroom import Classroom
from app.models.user import User
from app.schemas.test import TestCreate, TestResponse, TestUpdate
from app.models.enums import RoleEnum

router = APIRouter()


@router.post("/", response_model=TestResponse)
async def create_test(
    *,
    db: AsyncSession = Depends(deps.get_db),
    test_in: TestCreate,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Create a new test with questions. Instructor only.
    """
    # Verify context (Subject or Classroom)
    if test_in.subject_id:
        result = await db.execute(select(Subject).where(Subject.id == test_in.subject_id))
        if not result.scalars().first():
            raise HTTPException(status_code=404, detail="Subject not found")
            
    if test_in.classroom_id:
        result = await db.execute(select(Classroom).where(Classroom.id == test_in.classroom_id))
        if not result.scalars().first():
            raise HTTPException(status_code=404, detail="Classroom not found")

    # Create Test
    test_data = test_in.model_dump(exclude={"questions"})
    test = Test(**test_data)
    db.add(test)
    await db.commit()
    await db.refresh(test)
    
    # Create Questions
    for q_in in test_in.questions:
        question = TestQuestion(
            **q_in.model_dump(),
            test_id=test.id
        )
        db.add(question)
    
    await db.commit()
    
    # Reload with questions
    result = await db.execute(
        select(Test).options(selectinload(Test.questions)).where(Test.id == test.id)
    )
    return result.scalars().first()


@router.get("/{test_id}", response_model=TestResponse)
async def read_test(
    test_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get test details.
    """
    result = await db.execute(
        select(Test).options(selectinload(Test.questions)).where(Test.id == test_id)
    )
    test = result.scalars().first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test


@router.get("/course/{course_id}", response_model=List[TestResponse])
async def read_course_tests(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get tests for a specific course.
    """
    # Tests are linked to Subject or Classroom.
    # We'll fetch tests linked to subjects of this course.
    # (Tests linked to classrooms are harder to fetch directly unless we join classrooms too, 
    # but usually tests are subject-based or we can iterate).
    
    # For now, let's assume tests are primarily subject-based for the course view.
    
    query = (
        select(Test)
        .join(Subject, Test.subject_id == Subject.id)
        .where(
            Subject.course_id == course_id,
            Test.is_active == True
        )
        .options(selectinload(Test.questions))
        .order_by(desc(Test.created_at))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/instructor/my-tests", response_model=List[TestResponse])
async def get_instructor_tests(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_instructor),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get all tests created by the current instructor.
    Returns tests from subjects/courses owned by the instructor.
    """
    from app.models.course import Course
    
    # Get courses created by this instructor
    instructor_courses_query = await db.execute(
        select(Course.id).where(Course.created_by == current_user.id)
    )
    instructor_course_ids = [row[0] for row in instructor_courses_query.all()]
    
    if not instructor_course_ids:
        return []
    
    # Get subjects from instructor's courses
    subjects_query = await db.execute(
        select(Subject.id).where(Subject.course_id.in_(instructor_course_ids))
    )
    subject_ids = [row[0] for row in subjects_query.all()]
    
    if not subject_ids:
        return []
    
    # Get tests from these subjects
    query = (
        select(Test)
        .options(selectinload(Test.questions))
        .where(Test.subject_id.in_(subject_ids))
        .order_by(desc(Test.created_at))
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/available/list", response_model=List[TestResponse])
async def get_available_tests(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Get all published and active tests available to the current student.
    Returns tests from courses the student is enrolled in.
    """
    from app.models.enrollment import Enrollment
    from app.models.subject import Subject
    from app.models.course import Course
    from app.models.enums import TestStatusEnum
    
    # Get courses the student is enrolled in
    enrolled_courses_query = await db.execute(
        select(Enrollment.course_id).where(Enrollment.user_id == current_user.id)
    )
    enrolled_course_ids = [row[0] for row in enrolled_courses_query.all()]
    
    if not enrolled_course_ids:
        return []
    
    # Get subjects from enrolled courses
    subjects_query = await db.execute(
        select(Subject.id).where(Subject.course_id.in_(enrolled_course_ids))
    )
    subject_ids = [row[0] for row in subjects_query.all()]
    
    # Get published tests from these subjects
    query = (
        select(Test)
        .options(selectinload(Test.questions))
        .where(
            Test.subject_id.in_(subject_ids),
            Test.status == TestStatusEnum.published.value,
            Test.is_active == True
        )
        .order_by(desc(Test.created_at))
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/{test_id}", response_model=TestResponse)
async def update_test(
    *,
    db: AsyncSession = Depends(deps.get_db),
    test_id: int,
    test_in: TestUpdate,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Update a test. Instructor only.
    """
    result = await db.execute(select(Test).where(Test.id == test_id).options(selectinload(Test.questions)))
    test = result.scalars().first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    # Check permissions (Instructor who created the course/subject or Admin)
    # Since we don't have created_by on Test directly, we check via Subject -> Course
    # For simplicity, we'll assume if they can access it via instructor routes, they might be the owner.
    # But ideally we should check ownership.
    # Let's check Subject -> Course -> created_by

    if current_user.role != RoleEnum.admin:
        
        if test.subject_id:
            result_subject = await db.execute(select(Subject).where(Subject.id == test.subject_id))
            subject = result_subject.scalars().first()
            if subject:
                from app.models.course import Course
                result_course = await db.execute(select(Course).where(Course.id == subject.course_id))
                course = result_course.scalars().first()
                if not course or course.created_by != current_user.id:
                     raise HTTPException(status_code=403, detail="Not enough permissions")
                     
        elif test.classroom_id:
            # Check classroom instructor
            result_classroom = await db.execute(select(Classroom).where(Classroom.id == test.classroom_id))
            classroom = result_classroom.scalars().first()
            if not classroom or classroom.instructor_id != current_user.id:
                 raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = test_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(test, field, value)

    db.add(test)
    await db.commit()
    await db.refresh(test)
    return test


@router.delete("/{test_id}")
async def delete_test(
    *,
    db: AsyncSession = Depends(deps.get_db),
    test_id: int,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:

    """
    Delete a test. Instructor only.
    """
    result = await db.execute(select(Test).where(Test.id == test_id))
    test = result.scalars().first()

    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    # Check permissions

    if current_user.role != RoleEnum.admin:
        if test.subject_id:
            result_subject = await db.execute(select(Subject).where(Subject.id == test.subject_id))
            subject = result_subject.scalars().first()

            if subject:
                from app.models.course import Course
                result_course = await db.execute(select(Course).where(Course.id == subject.course_id))
                course = result_course.scalars().first()

                if not course or course.created_by != current_user.id:
                     raise HTTPException(status_code=403, detail="Not enough permissions")

        elif test.classroom_id:
            result_classroom = await db.execute(select(Classroom).where(Classroom.id == test.classroom_id))
            classroom = result_classroom.scalars().first()
            if not classroom or classroom.instructor_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not enough permissions")

    await db.delete(test)
    await db.commit()
    return {"message": "Test deleted successfully"}
