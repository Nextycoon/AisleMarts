# routers/cart.py
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import Dict, Any
from .deps import get_db

router = APIRouter(prefix="/cart", tags=["cart"])

def _totals(items):
    subtotal = sum(float(i["price"]) * int(i["qty"]) for i in items)
    return {"subtotal": subtotal, "shipping": 0.0, "tax": 0.0, "total": subtotal}

@router.get("")
async def get_cart(user_id: str, db=Depends(get_db)):
    cart = await db.carts.find_one({"user_id": user_id}) or {"user_id": user_id, "items": []}
    return {"items": cart.get("items", []), **_totals(cart.get("items", []))}

@router.post("/add")
async def add(user_id: str, pid: str, qty: int = 1, db=Depends(get_db)):
    product = await db.products.find_one({"id": pid})
    if not product: raise HTTPException(404, "Product not found")
    line = {"id": product["id"], "title": product["title"], "price": float(product["price"]), "qty": int(qty), "thumb": product.get("thumb")}
    # merge qty if already exists
    await db.carts.update_one(
        {"user_id": user_id, "items.id": {"$ne": pid}},
        {"$push": {"items": line}}, upsert=True
    )
    await db.carts.update_one(
        {"user_id": user_id, "items.id": pid},
        {"$inc": {"items.$[it].qty": int(qty)}},
        array_filters=[{"it.id": pid}]
    )
    cart = await db.carts.find_one({"user_id": user_id})
    return {"ok": True, **_totals(cart.get("items", []))}

@router.delete("/remove")
async def remove(user_id: str, pid: str, db=Depends(get_db)):
    await db.carts.update_one({"user_id": user_id}, {"$pull": {"items": {"id": pid}}})
    cart = await db.carts.find_one({"user_id": user_id}) or {"items": []}
    return {"ok": True, **_totals(cart.get("items", []))}

@router.post("/clear")
async def clear(user_id: str, db=Depends(get_db)):
    await db.carts.update_one({"user_id": user_id}, {"$set": {"items": []}}, upsert=True)
    return {"ok": True, **_totals([])}

@router.post("/checkout/preview")
async def preview(user_id: str, db=Depends(get_db)):
    cart = await db.carts.find_one({"user_id": user_id}) or {"items": []}
    return {"items": cart["items"], **_totals(cart["items"])}

@router.post("/checkout/confirm")
async def confirm(user_id: str, db=Depends(get_db)):
    cart = await db.carts.find_one({"user_id": user_id}) or {"items": []}
    if not cart["items"]:
        raise HTTPException(400, "Cart is empty")
    order = {
        "user_id": user_id,
        "items": cart["items"],
        **_totals(cart["items"]),
        "status": "placed",
        "payment": "demo",
        "created_at": datetime.utcnow()
    }
    res = await db.orders.insert_one(order)
    await db.carts.update_one({"user_id": user_id}, {"$set": {"items": []}}, upsert=True)
    return {"order_id": str(res.inserted_id), "status": "placed"}