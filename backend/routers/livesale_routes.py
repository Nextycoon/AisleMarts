from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
import logging

import sys
import os
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from routers.deps import get_db
from security import get_current_user
from models.livesale import (
    LiveSaleModel, LiveSaleViewer, LiveSaleStatus,
    CreateLiveSaleRequest, UpdateLiveSaleRequest, StartLiveSaleRequest,
    PurchaseFromLiveSaleRequest, ShareLiveSaleRequest
)
from services.livesale_service import LiveSaleService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/livesale", tags=["LiveSale Commerce"])

@router.get("", response_model=List[LiveSaleModel])
async def get_livesales(
    status: Optional[LiveSaleStatus] = None,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get LiveSales (public endpoint for consumers)"""
    livesale_service = LiveSaleService(db)
    return await livesale_service.get_livesales(status=status)

@router.get("/{livesale_id}", response_model=LiveSaleModel)
async def get_livesale(
    livesale_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get specific LiveSale details"""
    livesale_service = LiveSaleService(db)
    livesales = await livesale_service.get_livesales()
    
    for livesale in livesales:
        if livesale.id == livesale_id:
            return livesale
    
    raise HTTPException(status_code=404, detail="LiveSale not found")

@router.post("/{livesale_id}/join", response_model=LiveSaleViewer)
async def join_livesale(
    livesale_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Join a LiveSale as viewer"""
    livesale_service = LiveSaleService(db)
    return await livesale_service.join_livesale(livesale_id, current_user["_id"])

@router.post("/{livesale_id}/leave")
async def leave_livesale(
    livesale_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Leave a LiveSale"""
    livesale_service = LiveSaleService(db)
    await livesale_service.leave_livesale(livesale_id, current_user["_id"])
    return {"status": "left"}

@router.post("/{livesale_id}/purchase")
async def purchase_from_livesale(
    livesale_id: str,
    request: PurchaseFromLiveSaleRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Purchase product from LiveSale"""
    livesale_service = LiveSaleService(db)
    return await livesale_service.purchase_from_livesale(
        livesale_id, 
        request, 
        current_user["_id"]
    )

@router.post("/{livesale_id}/share")
async def share_livesale(
    livesale_id: str,
    request: ShareLiveSaleRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Share a LiveSale"""
    livesale_service = LiveSaleService(db)
    return await livesale_service.share_livesale(
        livesale_id, 
        request, 
        current_user["_id"]
    )

@router.get("/active/all")
async def get_active_livesales(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get currently active LiveSales"""
    livesale_service = LiveSaleService(db)
    active = livesale_service.get_active_livesales()
    
    return {
        "active_livesales": list(active.keys()),
        "count": len(active)
    }

# Business routes (vendor/creator management)
business_router = APIRouter(prefix="/biz/livesales", tags=["Business - LiveSale Management"])

@business_router.post("", response_model=LiveSaleModel)
async def create_livesale(
    request: CreateLiveSaleRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Create a new LiveSale (vendors/creators only)"""
    livesale_service = LiveSaleService(db)
    return await livesale_service.create_livesale(request, current_user["_id"])

@business_router.get("", response_model=List[LiveSaleModel])
async def get_my_livesales(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get LiveSales created by current vendor"""
    livesale_service = LiveSaleService(db)
    return await livesale_service.get_livesales(vendor_id=current_user["_id"])

@business_router.patch("/{livesale_id}", response_model=LiveSaleModel)
async def update_livesale(
    livesale_id: str,
    request: UpdateLiveSaleRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Update LiveSale (owner only)"""
    livesale_service = LiveSaleService(db)
    
    # Verify ownership
    livesales = await livesale_service.get_livesales(vendor_id=current_user["_id"])
    livesale = None
    for ls in livesales:
        if ls.id == livesale_id:
            livesale = ls
            break
    
    if not livesale:
        raise HTTPException(status_code=404, detail="LiveSale not found")
    
    # Update logic (simplified)
    update_data = {}
    if request.title:
        update_data["title"] = request.title
    if request.description is not None:
        update_data["description"] = request.description
    if request.starts_at:
        update_data["starts_at"] = request.starts_at
    if request.duration_minutes:
        update_data["duration_minutes"] = request.duration_minutes
    if request.thumbnail_url is not None:
        update_data["thumbnail_url"] = request.thumbnail_url
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await livesale_service.livesales.update_one(
            {"_id": livesale_id},
            {"$set": update_data}
        )
    
    # Return updated livesale
    updated_livesales = await livesale_service.get_livesales(vendor_id=current_user["_id"])
    for ls in updated_livesales:
        if ls.id == livesale_id:
            return ls
    
    raise HTTPException(status_code=404, detail="LiveSale not found after update")

@business_router.post("/{livesale_id}/start", response_model=LiveSaleModel)
async def start_livesale(
    livesale_id: str,
    request: StartLiveSaleRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Start a LiveSale"""
    livesale_service = LiveSaleService(db)
    return await livesale_service.start_livesale(
        livesale_id, 
        current_user["_id"], 
        request.stream_url
    )

@business_router.get("/{livesale_id}/analytics")
async def get_livesale_analytics(
    livesale_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get LiveSale analytics (owner only)"""
    livesale_service = LiveSaleService(db)
    return await livesale_service.get_livesale_analytics(livesale_id, current_user["_id"])

# Include business router
router.include_router(business_router)