"""
Media routes for v1 API - Phase 3 preview (locked functionality)
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from ...db import db
from ..deps import get_current_shopper
from ...config import settings

router = APIRouter(prefix="/v1/media", tags=["media"])

class MediaItem(BaseModel):
    id: str
    type: str  # "reel", "story", "product_showcase"
    title: str
    thumbnail: str
    duration: Optional[int] = None
    views: int = 0
    likes: int = 0

class MediaFeedResponse(BaseModel):
    items: List[MediaItem]
    locked: bool = True
    locked_message: str
    unlock_criteria: str

@router.get("/feed", response_model=MediaFeedResponse)
async def get_media_feed(
    page: int = 1,
    per_page: int = 20,
    type_filter: Optional[str] = None,
    shopper=Depends(get_current_shopper)
):
    """Get media feed - Phase 3 functionality (locked)"""
    
    # Phase 3 is locked - return empty feed with lock message
    return MediaFeedResponse(
        items=[],
        locked=True,
        locked_message="🔐 Media Hub - Coming in Phase 3!",
        unlock_criteria="Unlock at 1M+ shopper downloads + Series A funding"
    )

@router.post("/reel")
async def create_reel(
    shopper=Depends(get_current_shopper)
):
    """Create new reel - Phase 3 functionality (locked)"""
    
    raise HTTPException(
        status_code=403,
        detail={
            "error": "Phase 3 Feature Locked",
            "message": "🔐 Reel creation available in Phase 3",
            "locked_until": "1M+ shopper downloads + Series A funding",
            "preview": "Street Fashion Reels + AI-Controlled Media Coming Soon!"
        }
    )

@router.get("/reels/trending")
async def get_trending_reels(
    limit: int = 10,
    shopper=Depends(get_current_shopper)
):
    """Get trending reels - Phase 3 functionality (locked)"""
    
    return {
        "items": [],
        "locked": True,
        "message": "🔐 Trending Reels - Phase 3 Feature",
        "preview": "AI-curated street fashion reels from shoppers worldwide",
        "unlock_criteria": "Available after Series A funding"
    }

@router.get("/business-media")
async def get_business_media(
    shopper=Depends(get_current_shopper)
):
    """Get business media content - Phase 3 functionality (locked)"""
    
    return {
        "items": [],
        "locked": True,
        "message": "🔐 Business Media Hub - Phase 3 Feature", 
        "preview": "Vendor-driven content & indirect advertising platform",
        "unlock_criteria": "Available after Series A funding",
        "features": [
            "🎬 Vendor product showcases",
            "📊 AI-optimized content distribution", 
            "💰 Revenue-sharing advertising model",
            "🌍 Multi-screen casting capabilities"
        ]
    }

@router.get("/cast-targets")
async def get_cast_targets(
    shopper=Depends(get_current_shopper)
):
    """Get available casting targets - Phase 3 functionality (locked)"""
    
    return {
        "devices": [],
        "locked": True,
        "message": "🔐 Multi-Screen Casting - Phase 3 Feature",
        "preview": "Cast shopping content to TVs, tablets, and smart displays",
        "unlock_criteria": "Available after Series A funding"
    }