# /app/backend/routers/recommendations_v2.py
from fastapi import APIRouter, Depends, Query
from .deps import get_db

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

@router.get("")
async def recs(mood: str = Query(default="luxury"), db=Depends(get_db)):
    # mood boost
    mood_filter = {"badges": mood} if mood in ("Luxury", "Trending", "Deal") else {}
    base = db.products.find(mood_filter)
    items = await base.to_list(100)
    
    # simple scoring: mood boost + popularity + rating  
    for it in items:
        pop = it.get("popularity", 1)
        rating = it.get("rating", 4.5)
        mood_bonus = 1.2 if it.get("badges") == mood else 1.0
        it["score"] = pop * mood_bonus + rating * 0.5
    
    items.sort(key=lambda x: x.get("score", 0), reverse=True)
    return items[:12]