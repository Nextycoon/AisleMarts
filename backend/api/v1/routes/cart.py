"""
Shopping cart routes for v1 API
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
from ...db import db
from ..deps import get_current_shopper, get_or_create_session

router = APIRouter(prefix="/v1/cart", tags=["cart"])

class CartItemAdd(BaseModel):
    product_id: str
    qty: int = 1
    color: Optional[str] = None
    size: Optional[str] = None
    options: Optional[dict] = None

class CartItemResponse(BaseModel):
    id: str
    product_id: str
    product_title: str
    product_brand: str
    product_images: List[str]
    qty: int
    color: Optional[str] = None
    size: Optional[str] = None
    unit_price: float
    total_price: float
    currency: str

class CartResponse(BaseModel):
    id: str
    items: List[CartItemResponse]
    item_count: int
    subtotal: float
    currency: str
    updated_at: datetime

@router.post("/add")
async def add_to_cart(
    item: CartItemAdd,
    shopper=Depends(get_current_shopper),
    session=Depends(get_or_create_session)
):
    """Add item to shopping cart"""
    
    # Verify product exists and is active
    product = await db().products.find_one({"_id": item.product_id, "active": True})
    if not product:
        raise HTTPException(404, "Product not found")
    
    # Check stock availability
    if product.get("stock", 0) < item.qty:
        raise HTTPException(400, f"Insufficient stock. Available: {product.get('stock', 0)}")
    
    # Get or create cart
    cart_id = f"cart_{session['_id']}"
    cart = await db().carts.find_one({"_id": cart_id})
    
    if not cart:
        cart = {
            "_id": cart_id,
            "session_id": session["_id"],
            "shopper_id": shopper["_id"] if shopper else None,
            "currency": product.get("currency", "USD"),
            "items": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db().carts.insert_one(cart)
    
    # Check if item already exists in cart (same product, color, size)
    existing_item = None
    for cart_item in cart.get("items", []):
        if (cart_item["product_id"] == item.product_id and
            cart_item.get("color") == item.color and
            cart_item.get("size") == item.size):
            existing_item = cart_item
            break
    
    if existing_item:
        # Update quantity
        new_qty = existing_item["qty"] + item.qty
        
        # Check stock for new quantity
        if product.get("stock", 0) < new_qty:
            raise HTTPException(400, f"Cannot add {item.qty} more. Maximum available: {product.get('stock', 0) - existing_item['qty']}")
        
        await db().carts.update_one(
            {"_id": cart_id, "items.id": existing_item["id"]},
            {
                "$set": {
                    "items.$.qty": new_qty,
                    "items.$.total_price": float(product["price"]) * new_qty,
                    "updated_at": datetime.utcnow()
                }
            }
        )
    else:
        # Add new item
        cart_item = {
            "id": str(uuid.uuid4()),
            "product_id": item.product_id,
            "qty": item.qty,
            "color": item.color,
            "size": item.size,
            "unit_price": float(product["price"]),
            "total_price": float(product["price"]) * item.qty,
            "currency": product.get("currency", "USD"),
            "added_at": datetime.utcnow()
        }
        
        await db().carts.update_one(
            {"_id": cart_id},
            {
                "$push": {"items": cart_item},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
    
    # Log add to cart event
    if session:
        await log_cart_event(session["_id"], "add_to_cart", item.product_id, item.qty)
    
    return {"message": "Item added to cart", "cart_id": cart_id}

@router.get("", response_model=CartResponse)
async def get_cart(
    shopper=Depends(get_current_shopper),
    session=Depends(get_or_create_session)
):
    """Get current shopping cart"""
    
    cart_id = f"cart_{session['_id']}"
    cart = await db().carts.find_one({"_id": cart_id})
    
    if not cart:
        # Return empty cart
        return CartResponse(
            id=cart_id,
            items=[],
            item_count=0,
            subtotal=0.0,
            currency="USD",
            updated_at=datetime.utcnow()
        )
    
    # Enrich cart items with product data
    enriched_items = []
    total_count = 0
    subtotal = 0.0
    
    for item in cart.get("items", []):
        # Get current product data
        product = await db().products.find_one({"_id": item["product_id"]})
        if not product:
            continue  # Skip items for deleted products
        
        enriched_item = CartItemResponse(
            id=item["id"],
            product_id=item["product_id"],
            product_title=product["title"],
            product_brand=product["brand"],
            product_images=product.get("images", [])[:2],  # First 2 images
            qty=item["qty"],
            color=item.get("color"),
            size=item.get("size"),
            unit_price=item["unit_price"],
            total_price=item["total_price"],
            currency=item.get("currency", "USD")
        )
        
        enriched_items.append(enriched_item)
        total_count += item["qty"]
        subtotal += item["total_price"]
    
    return CartResponse(
        id=cart["_id"],
        items=enriched_items,
        item_count=total_count,
        subtotal=subtotal,
        currency=cart.get("currency", "USD"),
        updated_at=cart.get("updated_at", datetime.utcnow())
    )

@router.put("/items/{item_id}")
async def update_cart_item(
    item_id: str,
    qty: int,
    shopper=Depends(get_current_shopper),
    session=Depends(get_or_create_session)
):
    """Update cart item quantity"""
    
    if qty <= 0:
        raise HTTPException(400, "Quantity must be greater than 0")
    
    cart_id = f"cart_{session['_id']}"
    cart = await db().carts.find_one({"_id": cart_id})
    
    if not cart:
        raise HTTPException(404, "Cart not found")
    
    # Find the item
    item_found = False
    for item in cart.get("items", []):
        if item["id"] == item_id:
            # Check stock
            product = await db().products.find_one({"_id": item["product_id"]})
            if not product:
                raise HTTPException(404, "Product no longer available")
            
            if product.get("stock", 0) < qty:
                raise HTTPException(400, f"Insufficient stock. Available: {product.get('stock', 0)}")
            
            # Update item
            await db().carts.update_one(
                {"_id": cart_id, "items.id": item_id},
                {
                    "$set": {
                        "items.$.qty": qty,
                        "items.$.total_price": item["unit_price"] * qty,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            item_found = True
            break
    
    if not item_found:
        raise HTTPException(404, "Cart item not found")
    
    return {"message": "Cart item updated"}

@router.delete("/items/{item_id}")
async def remove_cart_item(
    item_id: str,
    shopper=Depends(get_current_shopper),
    session=Depends(get_or_create_session)
):
    """Remove item from cart"""
    
    cart_id = f"cart_{session['_id']}"
    
    result = await db().carts.update_one(
        {"_id": cart_id},
        {
            "$pull": {"items": {"id": item_id}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(404, "Cart item not found")
    
    return {"message": "Item removed from cart"}

@router.delete("")
async def clear_cart(
    shopper=Depends(get_current_shopper),
    session=Depends(get_or_create_session)
):
    """Clear entire cart"""
    
    cart_id = f"cart_{session['_id']}"
    
    await db().carts.update_one(
        {"_id": cart_id},
        {
            "$set": {
                "items": [],
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Cart cleared"}

async def log_cart_event(session_id: str, event_type: str, product_id: str, qty: int):
    """Log cart event for analytics"""
    event = {
        "type": event_type,
        "product_id": product_id,
        "qty": qty,
        "timestamp": datetime.utcnow()
    }
    
    await db().sessions.update_one(
        {"_id": session_id},
        {"$push": {"events": event}}
    )