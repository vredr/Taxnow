"""
TaxNow - Cloud Storage Module
Cloudinary integration for file uploads
"""

import os
import io
from typing import Optional, Dict, Any
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")

# Configure Cloudinary
if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True
    )
    CLOUDINARY_ENABLED = True
    print("✅ Cloudinary configured")
else:
    CLOUDINARY_ENABLED = False
    print("⚠️ Cloudinary not configured - using local storage")

class CloudStorage:
    """Cloud storage handler for file uploads"""
    
    @staticmethod
    def is_enabled() -> bool:
        """Check if cloud storage is enabled"""
        return CLOUDINARY_ENABLED
    
    @staticmethod
    async def upload_file(
        file_content: bytes,
        filename: str,
        folder: str = "taxnow_uploads",
        resource_type: str = "raw"
    ) -> Dict[str, Any]:
        """Upload file to Cloudinary"""
        if not CLOUDINARY_ENABLED:
            raise Exception("Cloudinary not configured")
        
        try:
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                io.BytesIO(file_content),
                folder=folder,
                resource_type=resource_type,
                public_id=os.path.splitext(filename)[0],
                overwrite=True
            )
            
            return {
                "success": True,
                "url": result.get("secure_url"),
                "public_id": result.get("public_id"),
                "format": result.get("format"),
                "size": result.get("bytes"),
                "filename": filename
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    async def delete_file(public_id: str) -> bool:
        """Delete file from Cloudinary"""
        if not CLOUDINARY_ENABLED:
            return False
        
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result.get("result") == "ok"
        except Exception as e:
            print(f"Failed to delete file: {e}")
            return False
    
    @staticmethod
    def get_file_url(public_id: str, resource_type: str = "raw") -> str:
        """Get file URL from Cloudinary"""
        url, _ = cloudinary_url(
            public_id,
            resource_type=resource_type,
            secure=True
        )
        return url
