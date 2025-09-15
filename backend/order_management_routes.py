from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List, Optional
from .order_management_service import OrderManagementService
from .order_management_models import OrderStatusUpdate, MPesaSTKCallback
from .security import get_current_user, get_current_user_optional
from .db import db
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/seller", tags=["order-management"])
mpesa_router = APIRouter(prefix="/api/mpesa", tags=["mpesa-webhook"])

async def get_order_service() -> OrderManagementService:
    return OrderManagementService(db())

@router.get("/orders/health")
async def order_management_health():
    """Health check for order management service"""
    return {
        "service": "order_management",
        "status": "healthy",
        "features": ["seller_orders", "status_updates", "mpesa_integration", "timeline_tracking"],
        "supported_statuses": ["pending", "paid", "shipped", "delivered", "cancelled"],
        "currency": "KES"
    }

@router.get("/orders")
async def get_seller_orders(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    service: OrderManagementService = Depends(get_order_service)
):
    """Get orders for the authenticated seller"""
    try:
        seller_id = current_user.get("id") or current_user.get("user_id", "demo_seller")
        orders = await service.get_seller_orders(seller_id, status)
        
        return {
            "success": True,
            "orders": orders,
            "count": len(orders),
            "seller_id": seller_id,
            "filter_status": status
        }
        
    except Exception as e:
        logger.error(f"Error getting seller orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve orders")

@router.get("/orders/{order_id}")
async def get_order_detail(
    order_id: str,
    current_user: dict = Depends(get_current_user),
    service: OrderManagementService = Depends(get_order_service)
):
    """Get detailed order information"""
    try:
        seller_id = current_user.get("id") or current_user.get("user_id", "demo_seller")
        order = await service.get_order_detail(seller_id, order_id)
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
            
        return {
            "success": True,
            "order": order
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting order {order_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve order details")

@router.post("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    current_user: dict = Depends(get_current_user),
    service: OrderManagementService = Depends(get_order_service)
):
    """Update order status"""
    try:
        seller_id = current_user.get("id") or current_user.get("user_id", "demo_seller")
        order = await service.update_order_status(seller_id, order_id, status_update)
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found or update failed")
            
        return {
            "success": True,
            "message": f"Order status updated to {status_update.status}",
            "order": order
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating order {order_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update order status")

@router.post("/orders/demo")
async def create_demo_order(
    current_user: dict = Depends(get_current_user),
    service: OrderManagementService = Depends(get_order_service)
):
    """Create a demo order for testing"""
    try:
        seller_id = current_user.get("id") or current_user.get("user_id", "demo_seller")
        order = await service.create_demo_order(seller_id)
        
        return {
            "success": True,
            "message": "Demo order created successfully",
            "order": order
        }
        
    except Exception as e:
        logger.error(f"Error creating demo order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create demo order")

# M-Pesa Webhook Routes
@mpesa_router.post("/stk/callback")
async def mpesa_stk_callback(
    callback_data: MPesaSTKCallback,
    service: OrderManagementService = Depends(get_order_service)
):
    """Handle M-Pesa STK callback"""
    try:
        logger.info(f"Received M-Pesa callback: {callback_data.CheckoutRequestID}")
        
        # Extract transaction data from callback metadata
        transaction_data = {}
        if callback_data.CallbackMetadata:
            items = callback_data.CallbackMetadata.get("Item", [])
            for item in items:
                name = item.get("Name")
                value = item.get("Value")
                if name:
                    transaction_data[name] = value
        
        # Process the callback
        success = await service.process_mpesa_callback(
            callback_data.CheckoutRequestID,
            callback_data.ResultCode,
            transaction_data
        )
        
        return {
            "ResultCode": 0,
            "ResultDesc": "Success",
            "processed": success
        }
        
    except Exception as e:
        logger.error(f"Error processing M-Pesa callback: {e}")
        return {
            "ResultCode": 1,
            "ResultDesc": "Failed to process callback"
        }