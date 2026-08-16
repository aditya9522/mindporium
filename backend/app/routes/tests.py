from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, or_
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.test import Test, TestQuestion
from app.models.subject import Subject
from app.models.classroom import Classroom
from app.models.user import User
from app.schemas.test import TestCreate, TestResponse, TestUpdate
from app.models.enums import RoleEnum, TestStatusEnum
from app.services.notification_service import notification_service
from app.models.enrollment import Enrollment
from app.models.submission import Submission

router = APIRouter()


@router.post("/", response_model=TestResponse)
async def create_test(
    *,
    db: AsyncSession = Depends(deps.get_db),
    test_in: TestCreate,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Create a new test with questions. Instructor only.
    """
    if not test_in.subject_id and not test_in.classroom_id:
        raise HTTPException(status_code=400, detail="Test must belong to a Subject or Classroom")

    # Verify context (Subject or Classroom)
    if test_in.subject_id:
        result = await db.execute(select(Subject).where(Subject.id == test_in.subject_id))
        subject = result.scalars().first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
            
        if current_user.role != RoleEnum.admin:
            from app.models.course import Course
            result_course = await db.execute(select(Course).options(selectinload(Course.instructors)).where(Course.id == subject.course_id))
            course = result_course.scalars().first()
            is_assigned = any(instructor.id == current_user.id for instructor in course.instructors) if course else False
            if not course or (course.created_by != current_user.id and not is_assigned):
                raise HTTPException(status_code=403, detail="Not enough permissions")
            
    if test_in.classroom_id:
        result = await db.execute(select(Classroom).where(Classroom.id == test_in.classroom_id))
        classroom = result.scalars().first()
        if not classroom:
            raise HTTPException(status_code=404, detail="Classroom not found")
            
        if current_user.role != RoleEnum.admin and classroom.instructor_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")

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
    test = result.scalars().first()

    # Notify students if published
    if test and test.status == TestStatusEnum.published.value:
        # Get course ID from subject or classroom
        course_id = None
        if test.subject_id:
            res = await db.execute(select(Subject.course_id).where(Subject.id == test.subject_id))
            course_id = res.scalar()
        
        if course_id:
            enrollments_result = await db.execute(
                select(Enrollment.user_id).where(Enrollment.course_id == course_id)
            )
            student_ids = [row[0] for row in enrollments_result.all()]
            if student_ids:
                background_tasks.add_task(
                    notification_service.notify_test_published,
                    user_ids=student_ids,
                    test_title=test.title
                )
                
    return test


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

    if current_user.role == RoleEnum.student:
        if not test.is_active or test.status != TestStatusEnum.published.value:
            raise HTTPException(status_code=403, detail="This test is not available")

        course_id = await resolve_test_course_id(db, test)
        if course_id:
            enrollment_result = await db.execute(
                select(Enrollment.id).where(
                    Enrollment.user_id == current_user.id,
                    Enrollment.course_id == course_id,
                )
            )
            if not enrollment_result.scalar_one_or_none():
                raise HTTPException(status_code=403, detail="You are not enrolled for this test")

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
    
    # Use a single query to fetch tests linked to subjects in courses owned by the instructor
    query = (
        select(Test)
        .join(Subject, Test.subject_id == Subject.id)
        .join(Course, Subject.course_id == Course.id)
        .where(
            or_(
                Course.created_by == current_user.id,
                Course.instructors.any(User.id == current_user.id)
            )
        )
        .options(selectinload(Test.questions))
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
    
    classroom_ids_query = await db.execute(
        select(Classroom.id).where(Classroom.subject_id.in_(subject_ids))
    )
    classroom_ids = [row[0] for row in classroom_ids_query.all()]
    test_scope_filters = [Test.subject_id.in_(subject_ids)]
    if classroom_ids:
        test_scope_filters.append(Test.classroom_id.in_(classroom_ids))

    # Get published tests from enrolled course subjects and their classrooms.
    query = (
        select(Test)
        .options(selectinload(Test.questions))
        .where(
            or_(*test_scope_filters),
            Test.status == TestStatusEnum.published.value,
            Test.is_active == True,
            ~Test.id.in_(
                select(Submission.test_id).where(Submission.user_id == current_user.id)
            )
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
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Update a test. Instructor only.
    """
    result = await db.execute(select(Test).where(Test.id == test_id).options(selectinload(Test.questions)))
    test = result.scalars().first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    if current_user.role != RoleEnum.admin:
        
        if test.subject_id:
            result_subject = await db.execute(select(Subject).where(Subject.id == test.subject_id))
            subject = result_subject.scalars().first()
            if subject:
                from app.models.course import Course
                result_course = await db.execute(select(Course).options(selectinload(Course.instructors)).where(Course.id == subject.course_id))
                course = result_course.scalars().first()
                is_assigned = any(instructor.id == current_user.id for instructor in course.instructors) if course else False
                if not course or (course.created_by != current_user.id and not is_assigned):
                     raise HTTPException(status_code=403, detail="Not enough permissions")
                     
        elif test.classroom_id:
            # Check classroom instructor
            result_classroom = await db.execute(select(Classroom).where(Classroom.id == test.classroom_id))
            classroom = result_classroom.scalars().first()
            if not classroom or classroom.instructor_id != current_user.id:
                 raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = test_in.model_dump(exclude_unset=True, exclude={"questions"})

    was_published = test.status == TestStatusEnum.published.value
    
    for field, value in update_data.items():
        setattr(test, field, value)

    if getattr(test_in, "questions", None) is not None:
        existing_questions = {q.id: q for q in test.questions}
        incoming_ids = set()
        
        for q_in in test_in.questions:
            if hasattr(q_in, "id") and q_in.id and q_in.id in existing_questions:
                incoming_ids.add(q_in.id)
                q_model = existing_questions[q_in.id]
                for key, val in q_in.model_dump(exclude_unset=True).items():
                    if key != "id":
                        setattr(q_model, key, val)
            else:
                qd = q_in.model_dump(exclude_unset=True)
                if "id" in qd:
                    del qd["id"]
                new_q = TestQuestion(
                    **qd,
                    test_id=test.id
                )
                db.add(new_q)
                
        for q_id, q_model in existing_questions.items():
            if q_id not in incoming_ids:
                await db.delete(q_model)

    db.add(test)
    await db.commit()
    await db.refresh(test)

    # Notify if newly published
    if not was_published and test.status == TestStatusEnum.published.value:
        course_id = None
        if test.subject_id:
            res = await db.execute(select(Subject.course_id).where(Subject.id == test.subject_id))
            course_id = res.scalar()
        
        if course_id:
            enrollments_result = await db.execute(
                select(Enrollment.user_id).where(Enrollment.course_id == course_id)
            )
            student_ids = [row[0] for row in enrollments_result.all()]
            if student_ids:
                background_tasks.add_task(
                    notification_service.notify_test_published,
                    user_ids=student_ids,
                    test_title=test.title
                )

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
                result_course = await db.execute(select(Course).options(selectinload(Course.instructors)).where(Course.id == subject.course_id))
                course = result_course.scalars().first()

                is_assigned = any(instructor.id == current_user.id for instructor in course.instructors) if course else False
                if not course or (course.created_by != current_user.id and not is_assigned):
                     raise HTTPException(status_code=403, detail="Not enough permissions")

        elif test.classroom_id:
            result_classroom = await db.execute(select(Classroom).where(Classroom.id == test.classroom_id))
            classroom = result_classroom.scalars().first()
            if not classroom or classroom.instructor_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not enough permissions")

    await db.delete(test)
    await db.commit()
    return {"message": "Test deleted successfully"}


async def resolve_test_course_id(db: AsyncSession, test: Test) -> int | None:
    if test.subject_id:
        result = await db.execute(
            select(Subject.course_id).where(Subject.id == test.subject_id)
        )
        return result.scalar_one_or_none()

    if test.classroom_id:
        result = await db.execute(
            select(Classroom).where(Classroom.id == test.classroom_id)
        )
        classroom = result.scalar_one_or_none()
        if classroom and classroom.subject_id:
            subject_result = await db.execute(
                select(Subject.course_id).where(Subject.id == classroom.subject_id)
            )
            return subject_result.scalar_one_or_none()

    return None
