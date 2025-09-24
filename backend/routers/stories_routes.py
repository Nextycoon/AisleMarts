"""
🎬 Stories API Routes - Phase 2 Implementation
Supports cursor pagination, creator management, and story lifecycle
"""
from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
import time
import json

router = APIRouter(prefix="/api", tags=["Stories"])

# Mock creator data (matches Phase 2 implementation)
MOCK_CREATORS = [
    {"id": "luxefashion", "displayName": "Lux Fashion", "tier": "gold", "avatarUrl": "https://picsum.photos/seed/luxe/100/100", "popularity": 0.95},
    {"id": "techguru", "displayName": "Tech Guru", "tier": "blue", "avatarUrl": "https://picsum.photos/seed/tech/100/100", "popularity": 0.88},
    {"id": "fitnessjane", "displayName": "Fitness Jane", "tier": "gold", "avatarUrl": "https://picsum.photos/seed/fitness/100/100", "popularity": 0.92},
    {"id": "beautyqueen", "displayName": "Beauty Queen", "tier": "gold", "avatarUrl": "https://picsum.photos/seed/beauty/100/100", "popularity": 0.90},
    {"id": "foodiefun", "displayName": "Foodie Fun", "tier": "blue", "avatarUrl": "https://picsum.photos/seed/food/100/100", "popularity": 0.82},
    {"id": "traveladdict", "displayName": "Travel Addict", "tier": "blue", "avatarUrl": "https://picsum.photos/seed/travel/100/100", "popularity": 0.85},
    {"id": "homedecor", "displayName": "Home Decor", "tier": "grey", "avatarUrl": "https://picsum.photos/seed/home/100/100", "popularity": 0.75},
    {"id": "artcreative", "displayName": "Art Creative", "tier": "unverified", "avatarUrl": "https://picsum.photos/seed/art/100/100", "popularity": 0.65},
]

# Generate mock stories
def generate_stories(creator_id: str, count: int = 3) -> List[dict]:
    """Generate mock stories for a creator"""
    stories = []
    now = int(time.time() * 1000)  # Current time in milliseconds
    
    story_types = ["moment", "product", "bts"]
    media_urls = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
    ]
    
    for i in range(count):
        story_type = story_types[i % len(story_types)]
        story = {
            "id": f"{creator_id}_story_{i}",
            "creatorId": creator_id,
            "type": story_type,
            "mediaUrl": media_urls[i % len(media_urls)],
            "expiresAt": now + (24 * 60 * 60 * 1000),  # 24 hours from now
        }
        
        # Add product ID for product stories
        if story_type == "product":
            story["productId"] = f"product_{creator_id}_{i}"
            
        stories.append(story)
    
    return stories

@router.get("/creators")
async def get_creators():
    """Get all creators for infinity stories"""
    return MOCK_CREATORS

@router.get("/stories")
async def get_stories(
    cursor: Optional[str] = Query(None, description="Pagination cursor"),
    limit: int = Query(24, description="Number of stories to return")
):
    """Get paginated stories with cursor-based pagination"""
    
    # Generate stories for all creators
    all_stories = []
    for creator in MOCK_CREATORS:
        creator_stories = generate_stories(creator["id"], 3)
        all_stories.extend(creator_stories)
    
    # Sort by creation time (simulate real-time ordering)
    all_stories.sort(key=lambda x: x["expiresAt"], reverse=True)
    
    # Handle pagination
    start_index = 0
    if cursor:
        try:
            start_index = int(cursor)
        except ValueError:
            start_index = 0
    
    end_index = start_index + limit
    page_stories = all_stories[start_index:end_index]
    
    # Determine next cursor
    next_cursor = None
    if end_index < len(all_stories):
        next_cursor = str(end_index)
    
    return {
        "data": page_stories,
        "cursor": next_cursor
    }

@router.get("/stories/health")
async def stories_health():
    """Health check for stories system"""
    return {
        "status": "healthy",
        "creators_count": len(MOCK_CREATORS),
        "stories_per_creator": 3,
        "total_stories": len(MOCK_CREATORS) * 3,
        "features": [
            "cursor_pagination",
            "virtual_scrolling_ready",
            "preload_coordinator_compatible",
            "24h_expiry_simulation",
            "commerce_integration"
        ]
    }