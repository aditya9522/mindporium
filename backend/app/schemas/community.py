from typing import Optional, List, Any
from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import UserResponse

# --- Community Schemas ---

class CommunityBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    banner: Optional[str] = None
    is_private: bool = False

class CommunityCreate(CommunityBase):
    pass

class CommunityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    banner: Optional[str] = None
    is_private: Optional[bool] = None
    is_active: Optional[bool] = None

class CommunityResponse(CommunityBase):
    id: int
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    member_count: int = 0
    post_count: int = 0
    is_active: bool

    class Config:
        from_attributes = True

# --- Post Schemas ---

class PostBase(BaseModel):
    title: str
    content: str
    attachments: Optional[str] = None

class PostCreate(PostBase):
    community_id: int

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    attachments: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_locked: Optional[bool] = None

class PostResponse(PostBase):
    id: int
    community_id: int
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# --- Comment Schemas ---

class CommentBase(BaseModel):
    content: str
    parent_comment_id: Optional[int] = None

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    post_id: int
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    like_count: int = 0
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
