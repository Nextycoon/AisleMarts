from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.config.database import get_database
from app.models import Product, ProductCreate, ProductUpdate, ProductStatus, User
from app.services.auth import get_current_active_user, get_current_vendor
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=dict)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_vendor),
    db = Depends(get_database)
):
    # Get vendor profile
    vendor = await db.vendors.find_one({"user_id": current_user.id})
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found"
        )
    
    if vendor["status"] != "approved":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vendor must be approved to create products"
        )
    
    # Create product
    product_dict = product_data.dict()
    product_dict["vendor_id"] = vendor["_id"]
    product_dict["_id"] = ObjectId()
    
    result = await db.products.insert_one(product_dict)
    
    return {
        "message": "Product created successfully",
        "product_id": str(result.inserted_id)
    }

@router.get("/", response_model=List[Product])
async def list_products(
    category: Optional[str] = None,
    status: Optional[ProductStatus] = None,
    vendor_id: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db = Depends(get_database)
):
    filter_query = {}
    
    if category:
        filter_query["category"] = category
    if status:
        filter_query["status"] = status
    if vendor_id and ObjectId.is_valid(vendor_id):
        filter_query["vendor_id"] = ObjectId(vendor_id)
    if search:
        filter_query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(filter_query).skip(skip).limit(limit).to_list(length=limit)
    return [Product(**product) for product in products]

@router.get("/my-products", response_model=List[Product])
async def get_my_products(
    current_user: User = Depends(get_current_vendor),
    status: Optional[ProductStatus] = None,
    skip: int = 0,
    limit: int = 20,
    db = Depends(get_database)
):
    vendor = await db.vendors.find_one({"user_id": current_user.id})
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found"
        )
    
    filter_query = {"vendor_id": vendor["_id"]}
    if status:
        filter_query["status"] = status
    
    products = await db.products.find(filter_query).skip(skip).limit(limit).to_list(length=limit)
    return [Product(**product) for product in products]

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str, db = Depends(get_database)):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    product = await db.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return Product(**product)

@router.put("/{product_id}", response_model=dict)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_user: User = Depends(get_current_vendor),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    # Check if product belongs to current vendor
    vendor = await db.vendors.find_one({"user_id": current_user.id})
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found"
        )
    
    product = await db.products.find_one({
        "_id": ObjectId(product_id),
        "vendor_id": vendor["_id"]
    })
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or not owned by vendor"
        )
    
    # Update product
    update_data = {k: v for k, v in product_update.dict().items() if v is not None}
    if update_data:
        result = await db.products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
        
        return {"message": "Product updated successfully"}
    
    return {"message": "No changes to update"}

@router.delete("/{product_id}", response_model=dict)
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_vendor),
    db = Depends(get_database)
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID"
        )
    
    # Check if product belongs to current vendor
    vendor = await db.vendors.find_one({"user_id": current_user.id})
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found"
        )
    
    result = await db.products.delete_one({
        "_id": ObjectId(product_id),
        "vendor_id": vendor["_id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or not owned by vendor"
        )
    
    return {"message": "Product deleted successfully"}

@router.get("/categories/list", response_model=List[str])
async def get_product_categories(db = Depends(get_database)):
    """Get list of all available product categories"""
    categories = await db.products.distinct("category")
    return categories

@router.get("/search/suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=2),
    limit: int = 5,
    db = Depends(get_database)
):
    """Get search suggestions based on product names"""
    products = await db.products.find(
        {"name": {"$regex": q, "$options": "i"}},
        {"name": 1, "_id": 0}
    ).limit(limit).to_list(length=limit)
    
    suggestions = [product["name"] for product in products]
    return {"suggestions": suggestions}