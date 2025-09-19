from fastapi import FastAPI, APIRouter, Depends, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import stripe
from passlib.hash import bcrypt
from jose import jwt, JWTError
import uuid
from typing import List, Optional
import asyncio

from config import settings
from db import db
from security import create_access_token, decode_access_token
from schemas import (
    UserCreate, UserLogin, UserOut, ProductIn, ProductOut, 
    CreatePaymentIntentIn, OrderOut, CartItemIn, CategoryIn, CategoryOut
)

# Import federated search system
from commerce_routes import commerce_router

app = FastAPI(title="AisleMarts API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add ALL-IN MICRO-SPRINT rate limiting middleware
from middleware.rate_limit import SimpleRatelimit
app.add_middleware(SimpleRatelimit, requests=120, window=60)

stripe.api_key = settings.STRIPE_SECRET_KEY

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

async def get_current_user(authorization: str | None = Header(None)):
    if not authorization:
        raise HTTPException(401, "Missing Authorization header")
    try:
        token = authorization.split()[1]
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token")
        user = await db().users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {str(e)}")

@api_router.get("/health")
async def health():
    return {"ok": True, "service": "AisleMarts API"}

# -------- Auth --------
@api_router.post("/auth/register")
async def register(payload: UserCreate):
    existing = await db().users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(400, "Email already in use")
    
    user_id = str(uuid.uuid4())
    doc = {
        "_id": user_id,
        "email": payload.email,
        "name": payload.name,
        "password_hash": bcrypt.hash(payload.password),
        "roles": ["user"],
        "created_at": datetime.utcnow(),
    }
    await db().users.insert_one(doc)
    token = create_access_token(user_id)
    return {"access_token": token, "token_type": "bearer"}

@api_router.post("/auth/login")
async def login(payload: UserLogin):
    user = await db().users.find_one({"email": payload.email})
    if not user or not bcrypt.verify(payload.password, user.get("password_hash", "")):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token(str(user["_id"]))
    return {"access_token": token, "token_type": "bearer"}

@api_router.get("/auth/me", response_model=UserOut)
async def get_me(user=Depends(get_current_user)):
    return UserOut(**user)

# -------- Avatar/Profile Management --------
from pydantic import BaseModel, validator
from typing import Literal

class AvatarUpdate(BaseModel):
    role: Literal["buyer", "seller", "hybrid"]
    
    @validator('role')
    def validate_role(cls, v):
        allowed_roles = {"buyer", "seller", "hybrid"}
        if v not in allowed_roles:
            raise ValueError(f'Role must be one of: {", ".join(allowed_roles)}')
        return v

@api_router.patch("/users/{user_id}/avatar")
async def update_user_avatar(
    user_id: str, 
    avatar_data: AvatarUpdate, 
    current_user=Depends(get_current_user)
):
    """
    Update user avatar/role with proper validation and security.
    
    Security validations:
    - User can only update their own avatar (or admin override)
    - Role validation via Pydantic model
    - Idempotency support
    """
    
    # Security: Ensure user can only update their own avatar or admin
    if current_user["_id"] != user_id and "admin" not in current_user.get("roles", []):
        raise HTTPException(403, "Permission denied")
    
    # Validate role server-side (Pydantic handles this, but extra safety)
    if avatar_data.role not in ["buyer", "seller", "hybrid"]:
        raise HTTPException(422, f"Invalid role: {avatar_data.role}")
    
    update_doc = {
        "role": avatar_data.role,
        "isAvatarSetup": True,
        "updatedAt": datetime.utcnow()
    }
    
    try:
        result = await db().users.update_one(
            {"_id": user_id},
            {"$set": update_doc}
        )
        
        if result.matched_count == 0:
            raise HTTPException(404, "User not found")
        
        # Return updated user (idempotency - same response for same input)
        updated_user = await db().users.find_one({"_id": user_id})
        
        return {
            "id": updated_user["_id"],
            "role": updated_user.get("role"),
            "isAvatarSetup": updated_user.get("isAvatarSetup", False),
            "updatedAt": updated_user.get("updatedAt")
        }
        
    except Exception as e:
        # Log server errors for monitoring
        print(f"⚠️ Avatar update failed for user {user_id}: {str(e)}")
        raise HTTPException(500, "Server error during avatar update")

# -------- Categories --------
@api_router.post("/categories", response_model=CategoryOut)
async def create_category(category: CategoryIn, user=Depends(get_current_user)):
    if "admin" not in user["roles"]:
        raise HTTPException(403, "Admin access required")
    
    category_id = str(uuid.uuid4())
    doc = category.model_dump()
    doc["_id"] = category_id
    doc["created_at"] = datetime.utcnow()
    
    await db().categories.insert_one(doc)
    return CategoryOut(**doc)

@api_router.get("/categories", response_model=List[CategoryOut])
async def list_categories(active_only: bool = True):
    filter_dict = {"active": True} if active_only else {}
    cursor = db().categories.find(filter_dict)
    categories = await cursor.to_list(length=100)
    return [CategoryOut(**cat) for cat in categories]

# -------- Products --------
@api_router.post("/products", response_model=ProductOut)
async def create_product(product: ProductIn, user=Depends(get_current_user)):
    if "admin" not in user["roles"] and "vendor" not in user["roles"]:
        raise HTTPException(403, "Admin or vendor access required")
    
    product_id = str(uuid.uuid4())
    doc = product.model_dump()
    doc["_id"] = product_id
    doc["created_at"] = doc["updated_at"] = datetime.utcnow()
    
    await db().products.insert_one(doc)
    return ProductOut(**doc)

@api_router.get("/products", response_model=List[ProductOut])
async def list_products(
    q: str | None = None, 
    category_id: str | None = None,
    limit: int = 20, 
    skip: int = 0
):
    filter_dict = {"active": True}
    
    if q:
        filter_dict["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"brand": {"$regex": q, "$options": "i"}}
        ]
    
    if category_id:
        filter_dict["category_id"] = category_id
    
    cursor = db().products.find(filter_dict).skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    return [ProductOut(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=ProductOut)
async def get_product(product_id: str):
    product = await db().products.find_one({"_id": product_id, "active": True})
    if not product:
        raise HTTPException(404, "Product not found")
    return ProductOut(**product)

# -------- Checkout / Stripe --------
@api_router.post("/checkout/payment-intent")
async def create_payment_intent(payload: CreatePaymentIntentIn, user=Depends(get_current_user)):
    # Get products and calculate total
    product_ids = [item.product_id for item in payload.items]
    products = await db().products.find({"_id": {"$in": product_ids}}).to_list(length=len(product_ids))
    
    if len(products) != len(product_ids):
        raise HTTPException(400, "Some products not found")
    
    price_map = {str(p["_id"]): p for p in products}
    
    total_amount = 0
    order_items = []
    
    for item in payload.items:
        product = price_map.get(item.product_id)
        if not product:
            raise HTTPException(400, f"Product {item.product_id} not found")
        
        if product["stock"] < item.quantity:
            raise HTTPException(400, f"Insufficient stock for {product['title']}")
        
        item_total = float(product["price"]) * item.quantity
        total_amount += item_total
        
        order_items.append({
            "product_id": item.product_id,
            "title": product["title"],
            "quantity": item.quantity,
            "unit_price": product["price"],
            "currency": product["currency"]
        })
    
    # Convert to cents for Stripe
    stripe_amount = int(total_amount * 100)
    
    try:
        intent = stripe.PaymentIntent.create(
            amount=stripe_amount,
            currency=payload.currency.lower(),
            automatic_payment_methods={"enabled": True},
            metadata={"user_id": str(user["_id"])},
        )
    except Exception as e:
        raise HTTPException(400, f"Stripe error: {str(e)}")
    
    # Create order document
    order_id = str(uuid.uuid4())
    order_doc = {
        "_id": order_id,
        "user_id": str(user["_id"]),
        "items": order_items,
        "subtotal": total_amount,
        "currency": payload.currency,
        "stripe_payment_intent": intent["id"],
        "status": "created",
        "shipping_address": payload.shipping_address,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    await db().orders.insert_one(order_doc)
    
    return {
        "clientSecret": intent["client_secret"], 
        "paymentIntentId": intent["id"],
        "orderId": order_id
    }

# -------- Orders --------
@api_router.get("/orders", response_model=List[OrderOut])
async def get_user_orders(user=Depends(get_current_user)):
    cursor = db().orders.find({"user_id": str(user["_id"])}).sort("created_at", -1)
    orders = await cursor.to_list(length=50)
    return [OrderOut(**order) for order in orders]

@api_router.get("/orders/{order_id}", response_model=OrderOut)
async def get_order(order_id: str, user=Depends(get_current_user)):
    order = await db().orders.find_one({"_id": order_id, "user_id": str(user["_id"])})
    if not order:
        raise HTTPException(404, "Order not found")
    return OrderOut(**order)

# -------- Stripe webhook --------
@api_router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(400, "Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(400, "Invalid signature")
    
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        await db().orders.update_one(
            {"stripe_payment_intent": payment_intent["id"]}, 
            {"$set": {"status": "paid", "updated_at": datetime.utcnow()}}
        )
        
        # Update product stock
        order = await db().orders.find_one({"stripe_payment_intent": payment_intent["id"]})
        if order:
            for item in order["items"]:
                await db().products.update_one(
                    {"_id": item["product_id"]},
                    {"$inc": {"stock": -item["quantity"]}}
                )
    
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        await db().orders.update_one(
            {"stripe_payment_intent": payment_intent["id"]}, 
            {"$set": {"status": "failed", "updated_at": datetime.utcnow()}}
        )
    
    return {"received": True}

from ai_routes import router as ai_router
from geographic_routes import router as geographic_router
from payments_tax_routes import router as payments_tax_router
from ai_search_hub_routes import router as search_hub_router
from ai_domain_routes import router as trade_router
from auth_identity_routes import router as identity_router
from ai_user_agents_routes import router as agents_router
from profile_card_routes import router as profile_cards_router
from documentation_compliance_routes import router as documentation_compliance_router
from procedures_by_category_routes import router as procedures_by_category_router
from documentation_procedures_routes import router as documentation_procedures_router
from localization_routes import router as localization_router

# Import new seller, commission, M-Pesa, multi-language, AI intents, and order management routes
from seller_routes import router as seller_router
from mpesa_routes import router as mpesa_router
from multilang_ai_routes import router as multilang_router
from ai_intents_routes import router as ai_intents_router
from seller_products_routes import router as seller_products_router
from order_management_routes import router as order_management_router, mpesa_router as mpesa_webhook_router
from search_routes import router as search_router
from rfq_routes import router as rfq_router
from nearby_routes import router as nearby_router
from inventory_sync_routes import router as inventory_sync_router
from pickup_windows_routes import router as pickup_windows_router

# Include AI routes
app.include_router(ai_router)

# Include Geographic routes
app.include_router(geographic_router)

# Include Payments & Tax routes
app.include_router(payments_tax_router)

# Include AI Search Hub routes
app.include_router(search_hub_router)

# Include AI Trade Intelligence routes
app.include_router(trade_router)

# Include Auth Identity routes
app.include_router(identity_router)

# Include AI User Agents routes
app.include_router(agents_router)

# Include Profile Cards routes
app.include_router(profile_cards_router)

# Include Documentation Compliance routes
app.include_router(documentation_compliance_router)

# Include Procedures by Category routes
app.include_router(procedures_by_category_router)

# Include Documentation Procedures routes
app.include_router(documentation_procedures_router)
app.include_router(localization_router)

# Include new seller, M-Pesa, multi-language, AI intents, seller products, and order management routes
app.include_router(seller_router)
app.include_router(mpesa_router)
app.include_router(multilang_router)
app.include_router(ai_intents_router)
app.include_router(seller_products_router)
app.include_router(order_management_router)
app.include_router(mpesa_webhook_router)
app.include_router(search_router)
app.include_router(rfq_router)
app.include_router(nearby_router)
app.include_router(inventory_sync_router)
app.include_router(pickup_windows_router)

# Include the commerce (federated search) router
app.include_router(commerce_router)

# Include the v1 API router (Track C AI Supercharge endpoints)
try:
    from v1_main import app as v1_app
    from routers.multilang_voice_ai import router as multilang_voice_router
    from routers.contextual_ai_recommendations import router as contextual_ai_router
    app.include_router(multilang_voice_router)
    app.include_router(contextual_ai_router)
    print("✅ Track C AI Supercharge routers loaded successfully")
except ImportError as e:
    print(f"⚠️ Track C AI Supercharge routers not available: {e}")

# Include ALL-IN MICRO-SPRINT routers
try:
    import sys
    import os
    sys.path.append(os.path.dirname(__file__))
    from routers.ai_intent import router as ai_intent_router
    from routers.wishlist import router as wishlist_router
    from routers.orders_cancel import router as orders_cancel_router
    from routers.products_cached import router as products_cached_router
    app.include_router(ai_intent_router)
    app.include_router(wishlist_router)
    app.include_router(orders_cancel_router)
    app.include_router(products_cached_router)
    print("✅ ALL-IN MICRO-SPRINT routers loaded successfully")
except ImportError as e:
    print(f"⚠️ ALL-IN MICRO-SPRINT routers not available: {e}")

# Include the main API router
app.include_router(api_router)

# Initialize all services on startup
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        from search_cache import init_search_cache
        await init_search_cache()
        
        from nearby_cache import init_nearby_cache
        await init_nearby_cache()
        
        # Initialize ALL-IN MICRO-SPRINT indexes
        from db.indexes import ensure_indexes
        await ensure_indexes(db())
        
        print("✅ AisleMarts API startup complete")
    except Exception as e:
        print(f"⚠️ Startup warning: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    try:
        from search_cache import close_search_cache
        await close_search_cache()
        
        from nearby_cache import close_nearby_cache
        await close_nearby_cache()
        
        print("✅ AisleMarts API shutdown complete")
    except Exception as e:
        print(f"⚠️ Shutdown warning: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)