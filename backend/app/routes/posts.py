from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.community import CommunityPost, CommunityComment, Community, CommunityReaction
from app.models.user import User
from app.schemas.community import PostCreate, PostResponse, CommentCreate, CommentResponse

router = APIRouter()


@router.post("/", response_model=PostResponse)
async def create_post(
    *,
    db: AsyncSession = Depends(deps.get_db),
    post_in: PostCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new post in a community.
    """
    # Check community exists
    result = await db.execute(select(Community).where(Community.id == post_in.community_id))
    community = result.scalars().first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
        
    # Create post
    post = CommunityPost(
        **post_in.model_dump(),
        user_id=current_user.id
    )
    db.add(post)
    
    # Update community post count
    community.post_count += 1
    db.add(community)
    
    await db.commit()
    await db.refresh(post)
    return post


@router.get("/{post_id}", response_model=PostResponse)
async def read_post(
    post_id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get post details.
    """
    # Eager load user
    query = select(CommunityPost).options(selectinload(CommunityPost.user)).where(CommunityPost.id == post_id)
    result = await db.execute(query)
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    # Increment view count (simple implementation, not unique views)
    post.view_count += 1
    db.add(post)
    await db.commit()
    
    return post


@router.post("/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    *,
    db: AsyncSession = Depends(deps.get_db),
    post_id: int,
    comment_in: CommentCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Add a comment to a post.
    """
    # Check post
    result = await db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
    post = result.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    comment = CommunityComment(
        **comment_in.model_dump(),
        post_id=post_id,
        user_id=current_user.id
    )
    db.add(comment)
    
    # Update post comment count
    post.comment_count += 1
    db.add(post)
    
    await db.commit()
    await db.refresh(comment)
    return comment


@router.get("/{post_id}/comments", response_model=List[CommentResponse])
async def read_comments(
    post_id: int,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Get comments for a post.
    """
    query = select(CommunityComment).options(selectinload(CommunityComment.user)).where(
        CommunityComment.post_id == post_id,
        CommunityComment.parent_comment_id == None  # Top level comments only for now
    ).order_by(desc(CommunityComment.created_at))
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/{post_id}/like")
async def like_post(
    post_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Toggle like on a post.
    """
    # Check existing reaction
    result = await db.execute(
        select(CommunityReaction).where(
            CommunityReaction.post_id == post_id,
            CommunityReaction.user_id == current_user.id,
            CommunityReaction.reaction_type == "like"
        )
    )
    reaction = result.scalars().first()
    
    result_post = await db.execute(select(CommunityPost).where(CommunityPost.id == post_id))
    post = result_post.scalars().first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if reaction:
        # Unlike
        db.delete(reaction)
        if post.like_count > 0:
            post.like_count -= 1
        message = "Unliked"
    else:
        # Like
        new_reaction = CommunityReaction(
            post_id=post_id,
            user_id=current_user.id,
            reaction_type="like"
        )
        db.add(new_reaction)
        post.like_count += 1
        message = "Liked"
        
    db.add(post)
    await db.commit()
    return {"message": message, "like_count": post.like_count}
