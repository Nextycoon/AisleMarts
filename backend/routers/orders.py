from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId
from routers.deps import get_db  # Motor client
from fastapi import Request
import os, json, hmac, hashlib

router = APIRouter(prefix="/api/orders", tags=["orders"])

class Item(BaseModel):
    productId: str
    name: str
    qty: int
    price: int  # in cents
    currency: str = "usd"
    image: Optional[str] = None

class Order(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    deviceId: Optional[str] = None
    userId: Optional[str] = None
    email: Optional[str] = None
    items: List[Item]
    amount: int
    currency: str
    status: str = "created"
    provider: str = "stripe"
    payment_intent_id: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

def _oid(o):
    return str(o) if isinstance(o, ObjectId) else o

@router.get("", response_model=List[Order])
async def list_orders(deviceId: Optional[str] = None, userId: Optional[str] = None, db=Depends(get_db)):
    q = {}
    if deviceId: q["deviceId"] = deviceId
    if userId: q["userId"] = userId
    cursor = db.orders.find(q).sort("createdAt", -1)
    out = []
    async for doc in cursor:
        doc["_id"] = _oid(doc["_id"])
        out.append(Order(**doc))
    return out

@router.get("/{orderId}", response_model=Order)
async def get_order(orderId: str, db=Depends(get_db)):
    doc = await db.orders.find_one({"_id": ObjectId(orderId)})
    if not doc:
        raise HTTPException(404, "Order not found")
    doc["_id"] = _oid(doc["_id"])
    return Order(**doc)

# Stripe Webhook (write-through)
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
@router.post("/stripe/webhook")
async def stripe_webhook(request: Request, db=Depends(get_db), stripe_signature: str = Header(None, alias="Stripe-Signature")):
    payload = await request.body()
    # lightweight, signature optional in dev
    event = None
    try:
        event = json.loads(payload.decode("utf-8"))
    except Exception:
        raise HTTPException(400, "Invalid payload")

    etype = event.get("type")
    data = event.get("data", {}).get("object", {})
    if etype == "payment_intent.succeeded":
        pi = data
        md = pi.get("metadata", {}) or {}
        # Expect metadata to carry deviceId, items (json), email
        try:
            items = json.loads(md.get("items_json", "[]"))
        except Exception:
            items = []
        order_doc = {
            "deviceId": md.get("deviceId"),
            "userId": md.get("userId"),
            "email": md.get("email"),
            "items": items,
            "amount": pi.get("amount_received") or pi.get("amount"),
            "currency": pi.get("currency", "usd"),
            "status": "paid",
            "provider": "stripe",
            "payment_intent_id": pi.get("id"),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }
        # idempotency by payment_intent_id
        await db.orders.update_one(
            {"payment_intent_id": pi.get("id")},
            {"$setOnInsert": order_doc},
            upsert=True,
        )
    elif etype == "payment_intent.payment_failed":
        # record failed intents as well (optional)
        pi = data
        md = pi.get("metadata", {}) or {}
        await db.orders.update_one(
            {"payment_intent_id": pi.get("id")},
            {"$set": {
                "deviceId": md.get("deviceId"),
                "userId": md.get("userId"),
                "email": md.get("email"),
                "status": "failed",
                "updatedAt": datetime.utcnow(),
            }},
            upsert=True,
        )
    return {"received": True}