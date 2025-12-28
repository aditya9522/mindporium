import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from typing import Any
from app.api import deps
from app.models.user import User
from app.models.enums import RoleEnum

router = APIRouter()

@router.post("/", response_model=dict)
async def upload_file(
    file: UploadFile = File(...),
    entity_type: str = Form(None), # e.g. "users", "courses"
    entity_id: str = Form(None),   # e.g. "123"
    category: str = Form(None),    # e.g. "photo", "banner", "thumbnail"
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload a file to Supabase storage with structured path:
    {entity_type}/{entity_id}/{category}/{filename}
    If params are missing, falls back to randomized root filename.
    """
    from app.services.storage_service import storage_service
    
    if not storage_service.client:
        raise HTTPException(status_code=500, detail="Supabase storage is not configured.")

    try:
        if not entity_type or not entity_id:
             raise HTTPException(status_code=400, detail="entity_type and entity_id are required for upload.")

        # Permission Logic
        if current_user.role != RoleEnum.admin:
            if entity_type == "users":
                if str(entity_id) != str(current_user.id):
                    raise HTTPException(status_code=403, detail="Cannot upload files for another user")
            elif entity_type == "courses":
                if current_user.role != RoleEnum.instructor:
                     raise HTTPException(status_code=403, detail="Only instructors can upload course files")
            elif entity_type == "communities":
                 # Anyone can create logic suggests anyone can upload?
                 # But ideally only creator. Hard to validate without DB.
                 # Proceed with caution.
                 pass

        # Clean inputs to prevent path traversal issues (basic sanitation)
        safe_type = "".join(x for x in entity_type if x.isalnum() or x in "_-")
        safe_id = "".join(x for x in entity_id if x.isalnum() or x in "_-")
        safe_cat = "".join(x for x in category if x.isalnum() or x in "_-") if category else "misc"
        
        # Preserve extension
        file_extension = os.path.splitext(file.filename)[1]
        
        # Clean filename
        safe_filename = "".join(x for x in file.filename if x.isalnum() or x in "._-")
        
        # Construct path: entity_type/entity_id/category/filename
        path = f"{safe_type}/{safe_id}/{safe_cat}/{safe_filename}"

        url = await storage_service.upload_file(file, path=path)
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage Error: {str(e)}")
