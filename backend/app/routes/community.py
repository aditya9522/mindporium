from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.community import Community, CommunitySubscription, CommunityPost
from app.models.user import User
from app.schemas.community import CommunityCreate, CommunityResponse, CommunityUpdate, PostResponse
from app.models.enums import RoleEnum

router = APIRouter()


@router.post("/", response_model=CommunityResponse)
async def create_community(
    *,
    db: AsyncSession = Depends(deps.get_db),
    community_in: CommunityCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new community.
    """
    community = Community(
        **community_in.model_dump(),
        created_by=current_user.id
    )
    db.add(community)
    await db.commit()
    await db.refresh(community)
    
    # Auto-subscribe creator as moderator
    subscription = CommunitySubscription(
        community_id=community.id,
        user_id=current_user.id,
        is_moderator=True
    )
    db.add(subscription)
    
    # Update member count
    community.member_count = 1
    db.add(community)
    
    await db.commit()
    return community


@router.get("/", response_model=List[CommunityResponse])
async def read_communities(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
) -> Any:
    """
    List communities.
    """
    query = select(Community).where(Community.is_active == True)
    
    if search:
        query = query.where(Community.name.ilike(f"%{search}%"))
        
    query = query.offset(skip).limit(limit).order_by(desc(Community.member_count))
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{community_id}", response_model=CommunityResponse)
async def read_community(
    community_id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get community details.
    """
    result = await db.execute(select(Community).where(Community.id == community_id))
    community = result.scalars().first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    return community


@router.post("/{community_id}/join")
async def join_community(
    community_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Join a community.
    """
    # Check existence
    result = await db.execute(select(Community).where(Community.id == community_id))
    community = result.scalars().first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
        
    # Check if already member
    result = await db.execute(
        select(CommunitySubscription).where(
            CommunitySubscription.community_id == community_id,
            CommunitySubscription.user_id == current_user.id
        )
    )
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Already a member")
        
    # Subscribe
    sub = CommunitySubscription(community_id=community_id, user_id=current_user.id)
    db.add(sub)
    
    # Update count
    community.member_count += 1
    db.add(community)
    
    await db.commit()
    return {"message": "Joined successfully"}


@router.post("/{community_id}/leave")
async def leave_community(
    community_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Leave a community.
    """
    result = await db.execute(
        select(CommunitySubscription).where(
            CommunitySubscription.community_id == community_id,
            CommunitySubscription.user_id == current_user.id
        )
    )
    sub = result.scalars().first()
    if not sub:
        raise HTTPException(status_code=400, detail="Not a member")
        
    db.delete(sub)
    
    # Update count
    result = await db.execute(select(Community).where(Community.id == community_id))
    community = result.scalars().first()
    if community and community.member_count > 0:
        community.member_count -= 1
        db.add(community)
        
    await db.commit()
    return {"message": "Left successfully"}


@router.get("/{community_id}/posts", response_model=List[PostResponse])
async def read_community_posts(
    community_id: int,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
) -> Any:

    query = (
        select(CommunityPost)
        .options(
            selectinload(CommunityPost.user)
        )
        .where(
            CommunityPost.community_id == community_id,
            CommunityPost.is_deleted == False
        )
        .order_by(desc(CommunityPost.is_pinned), desc(CommunityPost.created_at))
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.put("/{community_id}", response_model=CommunityResponse)
async def update_community(
    *,
    db: AsyncSession = Depends(deps.get_db),
    community_id: int,
    community_in: CommunityUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a community. Creator or Admin only.
    """
    result = await db.execute(select(Community).where(Community.id == community_id))
    community = result.scalars().first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
        
    if current_user.role != RoleEnum.admin and community.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = community_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(community, field, value)

    db.add(community)
    await db.commit()
    await db.refresh(community)
    return community


@router.delete("/{community_id}")
async def delete_community(
    *,
    db: AsyncSession = Depends(deps.get_db),
    community_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a community. Creator or Admin only.
    """
    result = await db.execute(select(Community).where(Community.id == community_id))
    community = result.scalars().first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
        
    if current_user.role != RoleEnum.admin and community.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    await db.delete(community)
    await db.commit()
    return {"message": "Community deleted successfully"}
