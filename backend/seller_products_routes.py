from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from seller_products_service import SellerProductsService
from seller_products_models import SellerProductCreate, SellerProductUpdate
from security import get_current_user, get_current_user_optional
from db import db
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/seller", tags=["seller-products"])

async def get_seller_products_service() -> SellerProductsService:
    return SellerProductsService(db())

@router.get("/products/health")
async def seller_products_health():
    """Health check for seller products service"""
    return {
        "service": "seller_products",
        "status": "healthy",
        "features": ["product_management", "inventory_control", "order_tracking", "analytics"],
        "commission_rate": "1%",
        "currency": "KES"
    }

@router.post("/products")
async def create_product(
    product_data: SellerProductCreate,
    current_user: dict = Depends(get_current_user),
    service: SellerProductsService = Depends(get_seller_products_service)
):
    """Create a new product for the authenticated seller"""
    try:
        seller_id = current_user.get("id") or current_user.get("user_id", "demo_seller")
        product = await service.create_product(seller_id, product_data)
        
        return {
            "success": True,
            "message": "Product created successfully",
            "product": product
        }
        
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise HTTPException(status_code=500, detail="Failed to create product")

@router.get("/products")
async def get_seller_products(
    active_only: bool = Query(False, description="Filter for active products only"),
    current_user: dict = Depends(get_current_user),
    service: SellerProductsService = Depends(get_seller_products_service)
):
    """Get all products for the authenticated seller"""
    try:
        seller_id = current_user.get("id") or current_user.get("user_id", "demo_seller")
        products = await service.get_seller_products(seller_id, active_only)
        
        return {
            "success": True,
            "products": products,
            "count": len(products),
            "seller_id": seller_id
        }
        
    except Exception as e:
        logger.error(f"Error getting seller products: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve products")

@router.get("/products/{product_id}")
async def get_product(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    service: SellerProductsService = Depends(get_seller_products_service)
):
    """Get a specific product"""
    try:
        seller_id = current_user.get("id") or current_user.get("user_id", "demo_seller")
        product = await service.get_product(seller_id, product_id)
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        return {
            "success": True,
            "product": product
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve product")

@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    update_data: SellerProductUpdate,
    current_user: dict = Depends(get_current_user),
    service: SellerProductsService = Depends(get_seller_products_service)
):
    """Update a product"""
    try:
        seller_id = current_user.get("id") or current_user.get("user_id", "demo_seller")
        product = await service.update_product(seller_id, product_id, update_data)
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found or no changes made")
            
        return {
            "success": True,
            "message": "Product updated successfully",
            "product": product
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update product")

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    service: SellerProductsService = Depends(get_seller_products_service)
):
    """Delete a product"""
    try:
        seller_id = current_user.get("id") or current_user.get("user_id", "demo_seller")
        success = await service.delete_product(seller_id, product_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Product not found")
            
        return {
            "success": True,
            "message": "Product deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete product")

@router.post("/products/{product_id}/toggle")
async def toggle_product_status(
    product_id: str,
    current_user: dict = Depends(get_current_user),
    service: SellerProductsService = Depends(get_seller_products_service)
):
    """Toggle product active/inactive status"""
    try:
        seller_id = current_user.get("id") or current_user.get("user_id", "demo_seller")
        product = await service.toggle_product_status(seller_id, product_id)
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        status = "active" if product.get('active') else "paused"
        
        return {
            "success": True,
            "message": f"Product {status} successfully",
            "product": product,
            "new_status": status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle product status")

# Note: Order management routes have been moved to order_management_routes.py
# to avoid conflicts and provide better separation of concerns

@router.get("/analytics/summary")
async def get_analytics_summary(
    current_user: dict = Depends(get_current_user),
    service: SellerProductsService = Depends(get_seller_products_service)
):
    """Get seller analytics summary for dashboard"""
    try:
        seller_id = current_user.get("id") or current_user.get("user_id", "demo_seller")
        analytics = await service.get_seller_analytics_summary(seller_id)
        
        return {
            "success": True,
            "analytics": analytics,
            "generated_at": analytics.get("last_updated"),
            "seller_id": seller_id
        }
        
    except Exception as e:
        logger.error(f"Error getting analytics summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics")

@router.get("/analytics/timeseries")
async def get_analytics_timeseries(
    metric: str = Query(..., description="Metric to retrieve"),
    period: str = Query("30d", description="Time period"),
    current_user: dict = Depends(get_current_user)
):
    """Get timeseries data for analytics charts"""
    try:
        seller_id = current_user.get("id") or current_user.get("user_id", "demo_seller")
        
        # Mock timeseries data for now
        import random
        from datetime import datetime, timedelta
        
        data_points = []
        base_date = datetime.utcnow() - timedelta(days=30)
        
        for i in range(30):
            date = base_date + timedelta(days=i)
            if metric == "revenue":
                value = random.uniform(200, 800)
            elif metric == "orders":
                value = random.randint(5, 25)
            elif metric == "views":
                value = random.randint(50, 200)
            elif metric == "ctr":
                value = random.uniform(2.0, 5.0)
            elif metric == "ai_share":
                value = random.uniform(0.5, 0.8)
            else:
                value = random.uniform(10, 100)
                
            data_points.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": round(value, 2)
            })
        
        return {
            "success": True,
            "metric": metric,
            "period": period,
            "data": data_points,
            "seller_id": seller_id
        }
        
    except Exception as e:
        logger.error(f"Error getting timeseries for {metric}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve timeseries data")