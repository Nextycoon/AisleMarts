from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import stripe
import uuid
from app.config.database import get_database
from app.config.settings import settings
from app.models import Order, OrderItem, OrderStatus, ShippingAddress, User
from app.services.auth import get_current_active_user
from bson import ObjectId

# Configure Stripe
if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter()

@router.post("/create", response_model=dict)
async def create_order(
    shipping_address: ShippingAddress,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    # Get user's cart
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart or not cart["items"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Validate cart items and calculate total
    order_items = []
    total_amount = 0
    
    for cart_item in cart["items"]:
        product = await db.products.find_one({"_id": cart_item["product_id"]})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {cart_item['product_id']} not found"
            )
        
        if product["status"] != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {product['name']} is not available"
            )
        
        if product["stock_quantity"] < cart_item["quantity"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product['name']}"
            )
        
        # Create order item
        order_item = OrderItem(
            product_id=cart_item["product_id"],
            product_name=product["name"],
            quantity=cart_item["quantity"],
            unit_price=product["price"],
            total_price=product["price"] * cart_item["quantity"]
        )
        order_items.append(order_item)
        total_amount += order_item.total_price
    
    # Generate order number
    order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    
    # Create Stripe payment intent
    payment_intent = None
    if settings.STRIPE_SECRET_KEY:
        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=int(total_amount * 100),  # Amount in cents
                currency='usd',
                metadata={
                    'order_number': order_number,
                    'user_id': str(current_user.id)
                }
            )
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment processing error: {str(e)}"
            )
    
    # Create order
    order_dict = {
        "_id": ObjectId(),
        "user_id": current_user.id,
        "order_number": order_number,
        "items": [item.model_dump() for item in order_items],
        "total_amount": total_amount,
        "status": OrderStatus.PENDING,
        "shipping_address": shipping_address.model_dump(),
        "payment_intent_id": payment_intent.id if payment_intent else None
    }
    
    result = await db.orders.insert_one(order_dict)
    
    # Update product stock quantities
    for cart_item in cart["items"]:
        await db.products.update_one(
            {"_id": cart_item["product_id"]},
            {"$inc": {"stock_quantity": -cart_item["quantity"]}}
        )
    
    # Clear cart
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": [], "total_amount": 0.0}}
    )
    
    response_data = {
        "message": "Order created successfully",
        "order_id": str(result.inserted_id),
        "order_number": order_number,
        "total_amount": total_amount
    }
    
    if payment_intent:
        response_data["client_secret"] = payment_intent.client_secret
    
    return response_data

@router.get("/", response_model=List[Order])
async def get_user_orders(
    status: Optional[OrderStatus] = None,
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    filter_query = {"user_id": current_user.id}
    if status:
        filter_query["status"] = status
    
    orders = await db.orders.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    return [Order(**order) for order in orders]

@router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    order = await db.orders.find_one({
        "_id": ObjectId(order_id),
        "user_id": current_user.id
    })
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return Order(**order)

@router.post("/{order_id}/confirm", response_model=dict)
async def confirm_order_payment(
    order_id: str,
    payment_intent_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    order = await db.orders.find_one({
        "_id": ObjectId(order_id),
        "user_id": current_user.id
    })
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Verify payment with Stripe
    if settings.STRIPE_SECRET_KEY:
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            if payment_intent.status != "succeeded":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Payment not completed"
                )
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment verification error: {str(e)}"
            )
    
    # Update order status
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": OrderStatus.CONFIRMED}}
    )
    
    return {"message": "Order confirmed successfully"}

@router.put("/{order_id}/cancel", response_model=dict)
async def cancel_order(
    order_id: str,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID"
        )
    
    order = await db.orders.find_one({
        "_id": ObjectId(order_id),
        "user_id": current_user.id
    })
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order["status"] not in [OrderStatus.PENDING, OrderStatus.CONFIRMED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order cannot be cancelled"
        )
    
    # Restore product stock
    for item in order["items"]:
        await db.products.update_one(
            {"_id": item["product_id"]},
            {"$inc": {"stock_quantity": item["quantity"]}}
        )
    
    # Update order status
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": OrderStatus.CANCELLED}}
    )
    
    return {"message": "Order cancelled successfully"}

@router.get("/vendor/orders")
async def get_vendor_orders(
    status: Optional[OrderStatus] = None,
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    # Get vendor profile
    vendor = await db.vendors.find_one({"user_id": current_user.id})
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found"
        )
    
    # Find orders containing vendor's products
    filter_query = {"items.vendor_id": vendor["_id"]}
    if status:
        filter_query["status"] = status
    
    orders = await db.orders.find(filter_query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    return [Order(**order) for order in orders]