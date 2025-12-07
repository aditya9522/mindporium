from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.models.enums import ResourceTypeEnum


class ResourceBase(BaseModel):
    title: str
    description: Optional[str] = None
    resource_type: ResourceTypeEnum
    file_url: Optional[str] = None
    external_link: Optional[str] = None
    subject_id: Optional[int] = None
    classroom_id: Optional[int] = None
    is_downloadable: bool = True
    order_index: int = 0


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    resource_type: Optional[ResourceTypeEnum] = None
    file_url: Optional[str] = None
    external_link: Optional[str] = None
    is_downloadable: Optional[bool] = None


class ResourceResponse(ResourceBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
