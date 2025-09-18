# routers/ai.py
from fastapi import APIRouter, Depends
from .deps import get_db

router = APIRouter(prefix="/ai", tags=["ai"])

BADGE_MAP = {"luxury": "Luxury", "trending": "Trending", "deal": "Deal"}

@router.get("/recommend")
async def recommend(user_id: str | None = None,
                    mood: str | None = None,
                    brand: str | None = None,
                    max_price: float | None = None,
                    db=Depends(get_db)):
    filt = {}
    b = BADGE_MAP.get((mood or "").lower())
    if b: filt["badges"] = b
    if brand: filt["brand"] = brand
    if max_price is not None: filt["price"] = {"$lte": float(max_price)}
    cursor = db.products.find(filt).limit(12)
    items = await cursor.to_list(length=None)
    return {"items": items, "strategy": {"badge": b, "brand": brand, "max_price": max_price}}