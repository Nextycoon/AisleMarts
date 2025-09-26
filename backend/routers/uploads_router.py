"""
AisleMarts Signed Upload System - Production File Handling
Secure file uploads with pre-signed URLs and validation
"""

from fastapi import APIRouter, HTTPException, Depends, Request, status
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
import uuid
import mimetypes
import os
from datetime import datetime, timedelta
import logging

from middleware.auth import get_current_user, AuthToken
from middleware.rate_limiting import rate_limit_file_upload

router = APIRouter()
logger = logging.getLogger(__name__)

# Configuration
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB
ALLOWED_EXTENSIONS = {
    '.jpg', '.jpeg', '.png', '.gif', '.webp',  # Images
    '.pdf', '.doc', '.docx',                   # Documents  
    '.xls', '.xlsx',                          # Spreadsheets
    '.zip', '.rar',                           # Archives
    '.mp4', '.mov', '.avi',                   # Videos (for demos)
}

ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'application/x-rar-compressed',
    'video/mp4', 'video/quicktime', 'video/x-msvideo'
}

# Mock S3/CDN configuration (replace with actual cloud storage)
UPLOAD_BASE_URL = "https://cdn.aislemarts.com/uploads"
UPLOAD_BUCKET = "aislemarts-uploads"

class SignedUploadRequest(BaseModel):
    """Request for pre-signed upload URL"""
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str = Field(..., min_length=5, max_length=100)
    file_size: int = Field(..., ge=1, le=MAX_FILE_SIZE)
    upload_context: str = Field(..., pattern=r'^(rfq|affiliate|product|profile|general)$')
    metadata: Optional[Dict[str, str]] = Field(default_factory=dict, max_items=10)
    
    @validator('filename')
    def validate_filename(cls, v):
        # Remove path components for security
        filename = os.path.basename(v)
        if not filename:
            raise ValueError("Invalid filename")
        
        # Check extension
        _, ext = os.path.splitext(filename.lower())
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError(f"File extension '{ext}' not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
        
        # Check for dangerous characters
        dangerous_chars = ['..', '/', '\\', '<', '>', '|', ':', '*', '?', '"']
        for char in dangerous_chars:
            if char in filename:
                raise ValueError(f"Filename contains invalid character: {char}")
        
        return filename
    
    @validator('content_type')
    def validate_content_type(cls, v):
        if v not in ALLOWED_MIME_TYPES:
            raise ValueError(f"Content type '{v}' not allowed")
        return v
    
    @validator('file_size')
    def validate_file_size(cls, v):
        if v > MAX_FILE_SIZE:
            raise ValueError(f"File size {v} exceeds maximum {MAX_FILE_SIZE} bytes ({MAX_FILE_SIZE // 1024 // 1024}MB)")
        return v

class SignedUploadResponse(BaseModel):
    """Response with signed upload URL and metadata"""
    upload_url: str
    file_key: str
    expires_at: datetime
    max_file_size: int
    allowed_content_types: List[str]
    upload_id: str

class UploadConfirmRequest(BaseModel):
    """Confirm successful upload"""
    upload_id: str = Field(..., min_length=10)
    file_key: str = Field(..., min_length=10) 
    actual_size: Optional[int] = Field(None, ge=1)
    upload_context: str = Field(..., regex=r'^(rfq|affiliate|product|profile|general)$')

# In-memory store for upload tracking (use Redis/DB in production)
upload_sessions = {}

@router.post("/v1/uploads/signed-url", response_model=SignedUploadResponse, tags=["uploads"])
async def create_signed_upload_url(
    request: Request,
    upload_request: SignedUploadRequest,
    current_user: AuthToken = Depends(get_current_user),
    _: bool = Depends(rate_limit_file_upload)
):
    """Generate pre-signed URL for secure file upload"""
    
    try:
        # Generate unique identifiers
        upload_id = str(uuid.uuid4())
        file_key = f"{upload_request.upload_context}/{current_user.user_id}/{upload_id}/{upload_request.filename}"
        
        # Create upload session
        expires_at = datetime.utcnow() + timedelta(minutes=15)  # 15 minute expiry
        
        upload_session = {
            "upload_id": upload_id,
            "file_key": file_key,
            "user_id": current_user.user_id,
            "filename": upload_request.filename,
            "content_type": upload_request.content_type,
            "expected_size": upload_request.file_size,
            "upload_context": upload_request.upload_context,
            "metadata": upload_request.metadata,
            "created_at": datetime.utcnow(),
            "expires_at": expires_at,
            "status": "pending",
            "ip_address": request.client.host if request.client else None
        }
        
        upload_sessions[upload_id] = upload_session
        
        # Generate signed URL (mock implementation)
        # In production, use AWS S3 generate_presigned_url or equivalent
        signed_url = generate_mock_signed_url(file_key, upload_request.content_type, expires_at)
        
        # Log upload request
        logger.info(f"📁 Upload URL generated: {upload_id} for user {current_user.user_id}")
        
        return SignedUploadResponse(
            upload_url=signed_url,
            file_key=file_key,
            expires_at=expires_at,
            max_file_size=MAX_FILE_SIZE,
            allowed_content_types=[upload_request.content_type],
            upload_id=upload_id
        )
        
    except Exception as e:
        logger.error(f"Error generating signed URL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate upload URL"
        )

@router.post("/v1/uploads/confirm", tags=["uploads"])
async def confirm_upload(
    confirm_request: UploadConfirmRequest,
    current_user: AuthToken = Depends(get_current_user)
):
    """Confirm successful file upload and finalize"""
    
    try:
        upload_session = upload_sessions.get(confirm_request.upload_id)
        
        if not upload_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Upload session not found"
            )
        
        # Verify ownership
        if upload_session["user_id"] != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this upload session"
            )
        
        # Check expiry
        if datetime.utcnow() > upload_session["expires_at"]:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Upload session has expired"
            )
        
        # Verify file key matches
        if upload_session["file_key"] != confirm_request.file_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File key mismatch"
            )
        
        # Update session status
        upload_session["status"] = "completed"
        upload_session["confirmed_at"] = datetime.utcnow()
        upload_session["actual_size"] = confirm_request.actual_size
        
        # Generate final file URL
        final_url = f"{UPLOAD_BASE_URL}/{confirm_request.file_key}"
        
        # In production, you might want to:
        # 1. Verify the file actually exists in storage
        # 2. Run virus scanning
        # 3. Generate thumbnails for images
        # 4. Update database records
        
        logger.info(f"✅ Upload confirmed: {confirm_request.upload_id}")
        
        return {
            "success": True,
            "file_url": final_url,
            "file_key": confirm_request.file_key,
            "upload_id": confirm_request.upload_id,
            "message": "File upload confirmed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error confirming upload: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to confirm upload"
        )

@router.get("/v1/uploads/{upload_id}/status", tags=["uploads"])
async def get_upload_status(
    upload_id: str,
    current_user: AuthToken = Depends(get_current_user)
):
    """Get upload session status"""
    
    upload_session = upload_sessions.get(upload_id)
    
    if not upload_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload session not found"
        )
    
    # Verify ownership
    if upload_session["user_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this upload session"
        )
    
    return {
        "upload_id": upload_id,
        "status": upload_session["status"],
        "filename": upload_session["filename"],
        "created_at": upload_session["created_at"],
        "expires_at": upload_session["expires_at"],
        "file_key": upload_session.get("file_key"),
        "is_expired": datetime.utcnow() > upload_session["expires_at"]
    }

@router.delete("/v1/uploads/{upload_id}", tags=["uploads"])
async def cancel_upload(
    upload_id: str,
    current_user: AuthToken = Depends(get_current_user)
):
    """Cancel upload session"""
    
    upload_session = upload_sessions.get(upload_id)
    
    if not upload_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload session not found"
        )
    
    # Verify ownership
    if upload_session["user_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this upload session"
        )
    
    # Mark as cancelled
    upload_session["status"] = "cancelled"
    upload_session["cancelled_at"] = datetime.utcnow()
    
    # In production, also clean up any partially uploaded files
    
    return {
        "success": True,
        "message": "Upload session cancelled"
    }

@router.get("/v1/uploads/config", tags=["uploads"])
async def get_upload_config():
    """Get upload configuration and limits"""
    
    return {
        "max_file_size": MAX_FILE_SIZE,
        "max_file_size_mb": MAX_FILE_SIZE // 1024 // 1024,
        "allowed_extensions": list(ALLOWED_EXTENSIONS),
        "allowed_mime_types": list(ALLOWED_MIME_TYPES),
        "upload_timeout_minutes": 15,
        "contexts": ["rfq", "affiliate", "product", "profile", "general"],
        "recommendations": {
            "images": "Use JPEG or PNG format, max 5MB for best performance",
            "documents": "PDF preferred for maximum compatibility", 
            "videos": "MP4 format recommended, keep under 25MB"
        }
    }

def generate_mock_signed_url(file_key: str, content_type: str, expires_at: datetime) -> str:
    """
    Generate mock signed URL for development
    In production, replace with actual S3 presigned URL generation
    """
    
    # Mock implementation - in production use:
    # import boto3
    # s3_client = boto3.client('s3')
    # signed_url = s3_client.generate_presigned_url(
    #     'put_object',
    #     Params={'Bucket': UPLOAD_BUCKET, 'Key': file_key, 'ContentType': content_type},
    #     ExpiresIn=900  # 15 minutes
    # )
    
    # For development, return a mock URL that indicates the structure
    base_url = f"https://mock-s3.amazonaws.com/{UPLOAD_BUCKET}"
    timestamp = int(expires_at.timestamp())
    signature = f"mock-signature-{hash(file_key) % 10000}"
    
    return f"{base_url}/{file_key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature={signature}&X-Amz-Date={timestamp}"

# Cleanup task (run periodically in production)
async def cleanup_expired_sessions():
    """Clean up expired upload sessions"""
    current_time = datetime.utcnow()
    expired_sessions = [
        upload_id for upload_id, session in upload_sessions.items()
        if current_time > session["expires_at"] and session["status"] == "pending"
    ]
    
    for upload_id in expired_sessions:
        upload_sessions[upload_id]["status"] = "expired"
    
    logger.info(f"🧹 Cleaned up {len(expired_sessions)} expired upload sessions")