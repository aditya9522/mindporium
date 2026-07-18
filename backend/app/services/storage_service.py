import os
from urllib.parse import unquote, urlparse
from supabase import create_client, Client
from fastapi import UploadFile, HTTPException
from typing import Optional
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.client: Optional[Client] = None
        
        url = settings.SUPABASE_URL
        if url and not url.endswith('/'):
            url += '/'

        # Use Service Role Key if available to bypass RLS
        key = settings.SUPABASE_SERVICE_ROLE_KEY
        
        if url and key:
            try:
                self.client = create_client(url, key)
            except Exception as e:
                print(f"Failed to initialize Supabase client: {e}")

    async def upload_file(self, file: UploadFile, path: str = None) -> str:
        if not self.client:
            raise HTTPException(status_code=500, detail="Storage service not configured (Supabase credentials missing)")

        try:
            file_content = await file.read()
            file_ext = os.path.splitext(file.filename)[1]
            
            # Clean up existing files in same category if path provided
            if path:
                file_name = path
                if '/' in path:
                     folder_path = os.path.dirname(path)
                     try:
                         bucket_name = settings.SUPABASE_BUCKET
                         existing_items = self.client.storage.from_(bucket_name).list(folder_path)
                         if existing_items:
                             files_to_remove = []
                             for item in existing_items:
                                 if item.get('name'):
                                     files_to_remove.append(f"{folder_path}/{item['name']}")
                             if files_to_remove:
                                 self.client.storage.from_(bucket_name).remove(files_to_remove)
                     except Exception as cleanup_warn:
                         print(f"Cleanup warning: {cleanup_warn}")
            else:
                from uuid import uuid4
                file_name = f"{uuid4()}{file_ext}"

            bucket_name = settings.SUPABASE_BUCKET
            
            res = self.client.storage.from_(bucket_name).upload(
                file_name,
                file_content,
                {"content-type": file.content_type, "upsert": "true"}
            )
            
            public_url = self.client.storage.from_(bucket_name).get_public_url(file_name)
            
            await file.seek(0)
            
            return public_url
        except Exception as e:
            await file.seek(0)
            print(f"Failed to upload to storage: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to upload to storage: {str(e)}")

    async def delete_folder(self, folder_path: str) -> None:
        """
        Delete all files in a folder (by prefix).
        """
        if not self.client:
           return

        try:
            bucket_name = settings.SUPABASE_BUCKET
            # List items in the folder (these might be files or subfolders)
            items = self.client.storage.from_(bucket_name).list(folder_path)
            
            if not items:
                return

            # Iterate items in folder_path (likely categories)
            for item in items:
                name = item.get('name')
                if not name: continue
                
                # Assume it might be a subfolder (category) and list inside it
                sub_path = f"{folder_path}/{name}"
                sub_items = self.client.storage.from_(bucket_name).list(sub_path)
                
                if sub_items:
                    # If it has items, these are likely the files. Delete them.
                    files_to_remove = [f"{sub_path}/{f['name']}" for f in sub_items if f.get('name')]
                    if files_to_remove:
                        self.client.storage.from_(bucket_name).remove(files_to_remove)
                
            # Finally, try to batch remove any direct files in the root folder_path just in case
            direct_files = [f"{folder_path}/{i['name']}" for i in items if i.get('name')]
            if direct_files:
                 self.client.storage.from_(bucket_name).remove(direct_files)

        except Exception as e:
            print(f"Failed to cleanup storage for {folder_path}: {e}")

    def path_from_public_url(self, url: str) -> Optional[str]:
        if not url:
            return None

        parsed = urlparse(url)
        marker = f"/storage/v1/object/public/{settings.SUPABASE_BUCKET}/"
        if marker not in parsed.path:
            return None

        return unquote(parsed.path.split(marker, 1)[1])

    async def delete_file_by_url(self, url: str) -> None:
        if not self.client:
            return

        path = self.path_from_public_url(url)
        if not path:
            return

        try:
            self.client.storage.from_(settings.SUPABASE_BUCKET).remove([path])
        except Exception as e:
            print(f"Failed to delete storage file {path}: {e}")

storage_service = StorageService()
