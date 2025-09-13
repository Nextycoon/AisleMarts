from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.config.database import get_database
from app.models import Vendor, VendorCreate, VendorStatus, User
from app.services.auth import get_current_active_user, get_current_vendor
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=dict)
async def create_vendor_profile(
    vendor_data: VendorCreate,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    # Check if user already has a vendor profile
    existing_vendor = await db.vendors.find_one({"user_id": current_user.id})
    if existing_vendor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vendor profile already exists"
        )
    
    # Create vendor profile
    vendor_dict = vendor_data.dict()
    vendor_dict["user_id"] = current_user.id
    vendor_dict["_id"] = ObjectId()
    
    result = await db.vendors.insert_one(vendor_dict)
    
    # Update user role to vendor
    await db.users.update_one(
        {"_id": current_user.id},
        {"$set": {"role": "vendor"}}
    )
    
    return {
        "message": "Vendor profile created successfully",
        "vendor_id": str(result.inserted_id),
        "status": "pending_approval"
    }

@router.get("/me", response_model=Vendor)
async def get_my_vendor_profile(
    current_user: User = Depends(get_current_vendor),
    db = Depends(get_database)
):
    vendor = await db.vendors.find_one({"user_id": current_user.id})
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found"
        )
    return Vendor(**vendor)

@router.put("/me", response_model=dict)
async def update_vendor_profile(
    vendor_update: VendorCreate,
    current_user: User = Depends(get_current_vendor),
    db = Depends(get_database)
):
    result = await db.vendors.update_one(
        {"user_id": current_user.id},
        {"$set": vendor_update.dict()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found"
        )
    
    return {"message": "Vendor profile updated successfully"}

@router.get("/", response_model=List[Vendor])
async def list_vendors(
    status: VendorStatus = None,
    skip: int = 0,
    limit: int = 10,
    db = Depends(get_database)
):
    filter_query = {}
    if status:
        filter_query["status"] = status
    
    vendors = await db.vendors.find(filter_query).skip(skip).limit(limit).to_list(length=limit)
    return [Vendor(**vendor) for vendor in vendors]

@router.get("/{vendor_id}", response_model=Vendor)
async def get_vendor(vendor_id: str, db = Depends(get_database)):
    if not ObjectId.is_valid(vendor_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid vendor ID"
        )
    
    vendor = await db.vendors.find_one({"_id": ObjectId(vendor_id)})
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )
    
    return Vendor(**vendor)

@router.put("/{vendor_id}/status", response_model=dict)
async def update_vendor_status(
    vendor_id: str,
    new_status: VendorStatus,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_database)
):
    # Only admin can update vendor status
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if not ObjectId.is_valid(vendor_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid vendor ID"
        )
    
    result = await db.vendors.update_one(
        {"_id": ObjectId(vendor_id)},
        {"$set": {"status": new_status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )
    
    return {"message": f"Vendor status updated to {new_status}"}

@router.get("/dashboard/stats")
async def get_vendor_dashboard_stats(
    current_user: User = Depends(get_current_vendor),
    db = Depends(get_database)
):
    vendor = await db.vendors.find_one({"user_id": current_user.id})
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor profile not found"
        )
    
    # Get vendor statistics
    total_products = await db.products.count_documents({"vendor_id": vendor["_id"]})
    active_products = await db.products.count_documents({
        "vendor_id": vendor["_id"],
        "status": "active"
    })
    
    # Get recent orders (simplified)
    recent_orders = await db.orders.count_documents({
        "items.vendor_id": vendor["_id"]
    })
    
    return {
        "total_products": total_products,
        "active_products": active_products,
        "recent_orders": recent_orders,
        "vendor_status": vendor["status"]
    }