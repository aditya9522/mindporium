import shutil
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Any
from uuid import uuid4

router = APIRouter()

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=dict)
async def upload_file(file: UploadFile = File(...)) -> Any:
    """
    Upload a file.
    """
    try:
        file_extension = os.path.splitext(file.filename)[1]
        file_name = f"{uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"url": f"/static/uploads/{file_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not upload file: {str(e)}")
