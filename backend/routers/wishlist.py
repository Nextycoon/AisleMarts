from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from pydantic import BaseModel
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from db import db

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])

class WishlistItemIn(BaseModel):
    user_id: str
    product_id: str  # incoming as string

def to_object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=400, detail="Invalid product_id")
    return ObjectId(value)

@router.get("", summary="List wishlist")
async def list_wishlist(user_id: str = Query(...)):
    cursor = db().wishlist.find({"user_id": user_id})
    items = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        doc["product_id"] = str(doc["product_id"])
        items.append(doc)
    return items

@router.post("/add", summary="Add to wishlist")
async def add_wishlist(body: WishlistItemIn):
    pid = to_object_id(body.product_id)
    existing = await db().wishlist.find_one({"user_id": body.user_id, "product_id": pid})
    if existing:
        return {"status": "exists", "id": str(existing["_id"])}
    res = await db().wishlist.insert_one({"user_id": body.user_id, "product_id": pid})
    return {"status": "added", "id": str(res.inserted_id)}