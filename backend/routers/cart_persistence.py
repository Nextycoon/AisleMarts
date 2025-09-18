# /app/backend/routers/cart_persistence.py
from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel
from datetime import datetime
from .deps import get_db
from bson import ObjectId

router = APIRouter(prefix="/api/cart", tags=["cart"])

class CartItem(BaseModel):
    productId: str
    qty: int

def _oid(x): return ObjectId(x) if ObjectId.is_valid(x) else x

@router.get("/current")
async def current_cart(db=Depends(get_db), x_device_id: str | None = Header(None), user_id: str | None = Header(None)):
    key = {"userId": user_id} if user_id else {"deviceId": x_device_id}
    doc = await db.carts.find_one(key) or {**key, "items": [], "updatedAt": datetime.utcnow()}
    return {"items": doc.get("items", []), "updatedAt": doc.get("updatedAt")}

@router.post("/add")
async def add_to_cart(item: CartItem, db=Depends(get_db), x_device_id: str | None = Header(None), user_id: str | None = Header(None)):
    key = {"userId": user_id} if user_id else {"deviceId": x_device_id}
    doc = await db.carts.find_one(key) or {**key, "items": []}
    items = doc.get("items", [])
    found = next((i for i in items if i["productId"] == item.productId), None)
    if found: found["qty"] += item.qty
    else: items.append({"productId": item.productId, "qty": item.qty})
    await db.carts.update_one(key, {"$set": {"items": items, "updatedAt": datetime.utcnow()}}, upsert=True)
    return {"ok": True, "items": items}

@router.post("/persist")
async def persist_cart(payload: dict, db=Depends(get_db), x_device_id: str | None = Header(None), user_id: str | None = Header(None)):
    """
    Merges client-side items into server cart (idempotent).
    payload = { items: [{productId, qty}] }
    """
    key = {"userId": user_id} if user_id else {"deviceId": x_device_id}
    server = await db.carts.find_one(key) or {**key, "items": []}
    merged = {i["productId"]: i["qty"] for i in server.get("items", [])}
    for it in payload.get("items", []):
        merged[it["productId"]] = merged.get(it["productId"], 0) + max(0, int(it["qty"]))
    items = [{"productId": k, "qty": v} for k, v in merged.items() if v > 0]
    await db.carts.update_one(key, {"$set": {"items": items, "updatedAt": datetime.utcnow()}}, upsert=True)
    return {"ok": True, "items": items}

@router.post("/clear")
async def clear_cart(db=Depends(get_db), x_device_id: str | None = Header(None), user_id: str | None = Header(None)):
    key = {"userId": user_id} if user_id else {"deviceId": x_device_id}
    await db.carts.update_one(key, {"$set": {"items": [], "updatedAt": datetime.utcnow()}}, upsert=True)
    return {"ok": True}