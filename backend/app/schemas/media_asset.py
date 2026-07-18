from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class MediaAssetUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)


class MediaAssetResponse(BaseModel):
    id: int
    name: str
    original_name: str
    url: str
    content_type: str
    size: int
    category: str
    description: Optional[str] = None
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MediaBulkDeleteRequest(BaseModel):
    ids: List[int] = Field(default_factory=list)
