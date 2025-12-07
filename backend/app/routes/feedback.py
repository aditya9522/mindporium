from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.feedback import AppFeedback, CourseFeedback, InstructorFeedback
from app.models.user import User
from app.models.course import Course
from app.schemas.feedback import (
    AppFeedbackCreate, 
    CourseFeedbackCreate, 
    InstructorFeedbackCreate, 
    AppFeedbackResponse,
    CourseFeedbackResponse,
    InstructorFeedbackResponse,
    FeedbackResponse
)

router = APIRouter()


@router.post("/app", response_model=FeedbackResponse)
async def create_app_feedback(
    *,
    db: AsyncSession = Depends(deps.get_db),
    feedback_in: AppFeedbackCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Submit feedback for the application.
    """
    feedback = AppFeedback(
        **feedback_in.model_dump(),
        user_id=current_user.id
    )
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)
    return feedback


@router.post("/course", response_model=FeedbackResponse)
async def create_course_feedback(
    *,
    db: AsyncSession = Depends(deps.get_db),
    feedback_in: CourseFeedbackCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Submit feedback for a course.
    """
    # Check course
    result = await db.execute(select(Course).where(Course.id == feedback_in.course_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Course not found")

    feedback = CourseFeedback(
        **feedback_in.model_dump(),
        user_id=current_user.id
    )
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)
    return feedback


@router.post("/instructor", response_model=FeedbackResponse)
async def create_instructor_feedback(
    *,
    db: AsyncSession = Depends(deps.get_db),
    feedback_in: InstructorFeedbackCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Submit feedback for an instructor.
    """
    # Check instructor
    result = await db.execute(select(User).where(User.id == feedback_in.instructor_id))
    instructor = result.scalars().first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")
        
    feedback = InstructorFeedback(
        **feedback_in.model_dump(),
        user_id=current_user.id
    )
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)
    return feedback


@router.put("/app/{feedback_id}", response_model=FeedbackResponse)
async def update_app_feedback(
    *,
    db: AsyncSession = Depends(deps.get_db),
    feedback_id: int,
    feedback_in: AppFeedbackCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update app feedback. Only the user who created it can update.
    """
    result = await db.execute(select(AppFeedback).where(AppFeedback.id == feedback_id))
    feedback = result.scalars().first()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    if feedback.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this feedback")
    
    feedback.subject = feedback_in.subject
    feedback.message = feedback_in.message
    feedback.rating = feedback_in.rating
    feedback.category = feedback_in.category
    await db.commit()
    await db.refresh(feedback)
    return feedback


@router.put("/course/{feedback_id}", response_model=FeedbackResponse)
async def update_course_feedback(
    *,
    db: AsyncSession = Depends(deps.get_db),
    feedback_id: int,
    feedback_in: CourseFeedbackCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update course feedback. Only the user who created it can update.
    """
    result = await db.execute(select(CourseFeedback).where(CourseFeedback.id == feedback_id))
    feedback = result.scalars().first()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    if feedback.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this feedback")
    
    feedback.rating = feedback_in.rating
    feedback.review_text = feedback_in.review_text
    await db.commit()
    await db.refresh(feedback)
    return feedback


@router.put("/instructor/{feedback_id}", response_model=FeedbackResponse)
async def update_instructor_feedback(
    *,
    db: AsyncSession = Depends(deps.get_db),
    feedback_id: int,
    feedback_in: InstructorFeedbackCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update instructor feedback. Only the user who created it can update.
    """
    result = await db.execute(select(InstructorFeedback).where(InstructorFeedback.id == feedback_id))
    feedback = result.scalars().first()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    if feedback.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this feedback")
    
    feedback.rating = feedback_in.rating
    feedback.comments = feedback_in.comments
    await db.commit()
    await db.refresh(feedback)
    return feedback


@router.delete("/app/{feedback_id}")
async def delete_app_feedback(
    *,
    db: AsyncSession = Depends(deps.get_db),
    feedback_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete app feedback. Only the user who created it or admin can delete.
    """
    result = await db.execute(select(AppFeedback).where(AppFeedback.id == feedback_id))
    feedback = result.scalars().first()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Allow deletion by owner or admin
    if feedback.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this feedback")
    
    await db.delete(feedback)
    await db.commit()
    return {"message": "Feedback deleted successfully"}


@router.delete("/course/{feedback_id}")
async def delete_course_feedback(
    *,
    db: AsyncSession = Depends(deps.get_db),
    feedback_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete course feedback. Only the user who created it or admin can delete.
    """
    result = await db.execute(select(CourseFeedback).where(CourseFeedback.id == feedback_id))
    feedback = result.scalars().first()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    if feedback.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this feedback")
    
    await db.delete(feedback)
    await db.commit()
    return {"message": "Feedback deleted successfully"}


@router.delete("/instructor/{feedback_id}")
async def delete_instructor_feedback(
    *,
    db: AsyncSession = Depends(deps.get_db),
    feedback_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete instructor feedback. Only the user who created it or admin can delete.
    """
    result = await db.execute(select(InstructorFeedback).where(InstructorFeedback.id == feedback_id))
    feedback = result.scalars().first()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    if feedback.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this feedback")
    
    await db.delete(feedback)
    await db.commit()
    return {"message": "Feedback deleted successfully"}


@router.get("/app", response_model=List[AppFeedbackResponse])
async def read_app_feedbacks(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get all app feedbacks with detailed user information. Admin only.
    """
    result = await db.execute(
        select(AppFeedback)
        .options(selectinload(AppFeedback.user))
        .offset(skip)
        .limit(limit)
        .order_by(AppFeedback.created_at.desc())
    )
    return result.scalars().all()


@router.get("/my-feedback", response_model=List[AppFeedbackResponse])
async def read_my_feedback(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's feedback submissions.
    """
    result = await db.execute(
        select(AppFeedback)
        .where(AppFeedback.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .order_by(AppFeedback.created_at.desc())
    )
    return result.scalars().all()




@router.get("/app/analysis")
async def read_app_feedback_analysis(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get app feedback analysis (stats, sentiment, distribution).
    """
    # Fetch all app feedbacks
    result = await db.execute(select(AppFeedback))
    feedbacks = result.scalars().all()
    
    total = len(feedbacks)
    if total == 0:
        return {
            "total_reviews": 0,
            "average_rating": 0,
            "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
            "sentiment_analysis": {"positive": 0, "neutral": 0, "negative": 0}
        }
        
    avg_rating = sum(f.rating for f in feedbacks) / total
    
    # Distribution
    dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for f in feedbacks:
        if f.rating in dist:
            dist[f.rating] += 1
            
    # Simple rule-based sentiment (mocking LLM for now)
    # 4-5 stars: Positive
    # 3 stars: Neutral
    # 1-2 stars: Negative
    sentiment = {"positive": 0, "neutral": 0, "negative": 0}
    for f in feedbacks:
        if f.rating >= 4:
            sentiment["positive"] += 1
        elif f.rating == 3:
            sentiment["neutral"] += 1
        else:
            sentiment["negative"] += 1
            
    return {
        "total_reviews": total,
        "average_rating": round(avg_rating, 1),
        "rating_distribution": dist,
        "sentiment_analysis": sentiment
    }


@router.get("/instructor", response_model=List[FeedbackResponse])
async def read_instructor_feedbacks(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_instructor),
) -> Any:
    """
    Get feedbacks for the current instructor.
    """
    result = await db.execute(
        select(InstructorFeedback)
        .options(selectinload(InstructorFeedback.user))
        .where(InstructorFeedback.instructor_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/course/{course_id}", response_model=List[FeedbackResponse])
async def read_course_feedbacks(
    course_id: int,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get feedbacks for a specific course.
    """
    # Check permissions (Instructor of course or Admin or enrolled student?)
    # For now, allow all authenticated users to see reviews (like Udemy)
    result = await db.execute(
        select(CourseFeedback)
        .options(selectinload(CourseFeedback.user))
        .where(CourseFeedback.course_id == course_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
