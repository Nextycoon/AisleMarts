# routers/products.py
from fastapi import APIRouter, Depends
from typing import Optional, List, Any
from .deps import get_db

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/collections")
async def collections(db=Depends(get_db)):
    meta = await db.meta.find_one({"_id":"collections"}) or {}
    return {
        "Luxury": meta.get("Luxury", []),
        "Trending": meta.get("Trending", []),
        "Deal": meta.get("Deal", []),
    }

@router.get("/search")
async def search(q: Optional[str] = None, badge: Optional[str] = None,
                 brand: Optional[str] = None, max_price: Optional[float] = None,
                 db=Depends(get_db)) -> Any:
    filt = {}
    if q:
        # Simple $regex; swap for Atlas Search if available
        filt["title"] = {"$regex": q, "$options": "i"}
    if badge:
        filt["badges"] = badge
    if brand:
        filt["brand"] = brand
    if max_price is not None:
        filt["price"] = {"$lte": float(max_price)}
    cursor = db.products.find(filt).limit(24)
    items: List[dict] = await cursor.to_list(length=None)
    return {"items": items, "count": len(items)}