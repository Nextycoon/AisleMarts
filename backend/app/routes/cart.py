from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.config.database import get_database
from app.models import Cart, CartItem, User, Product
from app.services.auth import get_current_active_user
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=Cart)
async def get_cart(
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        # Create empty cart if it doesn't exist
        cart_dict = {
            "_id": ObjectId(),
            "user_id": current_user.id,
            "items": [],
            "total_amount": 0.0
        }
        await db.carts.insert_one(cart_dict)
        cart = cart_dict
    
    return Cart(**cart)

@router.post("/items", response_model=dict)
async def add_to_cart(
    product_id: str,
    quantity: int = 1,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than 0"
        )
    
    # Check if product exists and is active
    product = await db.products.find_one({
        "_id": ObjectId(product_id),
        "status": "active"
    })
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or not available"
        )
    
    # Check stock availability
    if product["stock_quantity"] < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock"
        )
    
    # Get or create cart
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        cart = {
            "_id": ObjectId(),
            "user_id": current_user.id,
            "items": [],
            "total_amount": 0.0
        }
        await db.carts.insert_one(cart)
    
    # Check if item already exists in cart
    existing_item_index = None
    for i, item in enumerate(cart["items"]):
        if str(item["product_id"]) == product_id:
            existing_item_index = i
            break
    
    if existing_item_index is not None:
        # Update existing item quantity
        new_quantity = cart["items"][existing_item_index]["quantity"] + quantity
        if product["stock_quantity"] < new_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock for total quantity"
            )
        
        cart["items"][existing_item_index]["quantity"] = new_quantity
    else:
        # Add new item to cart
        cart_item = {
            "product_id": ObjectId(product_id),
            "quantity": quantity,
            "price": product["price"]
        }
        cart["items"].append(cart_item)
    
    # Recalculate total
    total_amount = sum(item["quantity"] * item["price"] for item in cart["items"])
    
    # Update cart in database
    await db.carts.update_one(
        {"user_id": current_user.id},
        {
            "$set": {
                "items": cart["items"],
                "total_amount": total_amount
            }
        }
    )
    
    return {"message": "Item added to cart successfully"}

@router.put("/items/{product_id}", response_model=dict)
async def update_cart_item(
    product_id: str,
    quantity: int,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    if quantity < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity cannot be negative"
        )
    
    # Get cart
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    # Find item in cart
    item_found = False
    updated_items = []
    
    for item in cart["items"]:
        if str(item["product_id"]) == product_id:
            item_found = True
            if quantity > 0:
                # Check stock availability
                product = await db.products.find_one({"_id": ObjectId(product_id)})
                if product and product["stock_quantity"] >= quantity:
                    item["quantity"] = quantity
                    updated_items.append(item)
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Insufficient stock"
                    )
            # If quantity is 0, item is removed (not added to updated_items)
        else:
            updated_items.append(item)
    
    if not item_found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart"
        )
    
    # Recalculate total
    total_amount = sum(item["quantity"] * item["price"] for item in updated_items)
    
    # Update cart
    await db.carts.update_one(
        {"user_id": current_user.id},
        {
            "$set": {
                "items": updated_items,
                "total_amount": total_amount
            }
        }
    )
    
    return {"message": "Cart item updated successfully"}

@router.delete("/items/{product_id}", response_model=dict)
async def remove_from_cart(
    product_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    # Get cart
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )
    
    # Remove item from cart
    updated_items = [
        item for item in cart["items"] 
        if str(item["product_id"]) != product_id
    ]
    
    if len(updated_items) == len(cart["items"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart"
        )
    
    # Recalculate total
    total_amount = sum(item["quantity"] * item["price"] for item in updated_items)
    
    # Update cart
    await db.carts.update_one(
        {"user_id": current_user.id},
        {
            "$set": {
                "items": updated_items,
                "total_amount": total_amount
            }
        }
    )
    
    return {"message": "Item removed from cart successfully"}

@router.delete("/clear", response_model=dict)
async def clear_cart(
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    await db.carts.update_one(
        {"user_id": current_user.id},
        {
            "$set": {
                "items": [],
                "total_amount": 0.0
            }
        }
    )
    
    return {"message": "Cart cleared successfully"}

@router.get("/count", response_model=dict)
async def get_cart_count(
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        return {"count": 0}
    
    total_count = sum(item["quantity"] for item in cart["items"])
    return {"count": total_count}