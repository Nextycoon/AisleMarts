from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException
import logging
import asyncio

import sys
import os
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from models.livesale import (
    LiveSaleModel, LiveSaleViewer, LiveSaleEvent, LiveSaleStatus, 
    LiveSaleEventType, LiveSaleProduct, LiveSaleRewards,
    CreateLiveSaleRequest, UpdateLiveSaleRequest, StartLiveSaleRequest,
    PurchaseFromLiveSaleRequest, ShareLiveSaleRequest
)

logger = logging.getLogger(__name__)

class LiveSaleService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.livesales = db.livesales
        self.livesale_viewers = db.livesale_viewers
        self.active_livesales: Dict[str, Dict[str, Any]] = {}
        
    async def create_livesale(
        self, 
        request: CreateLiveSaleRequest, 
        vendor_id: str
    ) -> LiveSaleModel:
        """Create a new LiveSale"""
        try:
            # Convert products data
            products = []
            for product_data in request.products:
                product = LiveSaleProduct(
                    product_id=product_data["product_id"],
                    name=product_data["name"],
                    original_price=product_data["original_price"],
                    drop_price=product_data["drop_price"],
                    quantity_available=product_data["quantity_available"],
                    image_url=product_data.get("image_url"),
                    description=product_data.get("description")
                )
                products.append(product)
            
            # Set up rewards
            rewards = LiveSaleRewards()
            if request.rewards:
                rewards = LiveSaleRewards(**request.rewards)
            
            livesale_doc = {
                "_id": str(ObjectId()),
                "title": request.title,
                "description": request.description,
                "vendor_id": vendor_id,
                "status": LiveSaleStatus.SCHEDULED.value,
                "starts_at": request.starts_at,
                "duration_minutes": request.duration_minutes,
                "ends_at": request.starts_at + timedelta(minutes=request.duration_minutes),
                "products": [product.dict() for product in products],
                "rewards": rewards.dict(),
                "viewer_count": 0,
                "total_sales": 0.0,
                "total_viewers": 0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "metadata": {}
            }
            
            await self.livesales.insert_one(livesale_doc)
            
            logger.info(f"Created LiveSale: {livesale_doc['_id']} by vendor {vendor_id}")
            
            return LiveSaleModel(**livesale_doc)
            
        except Exception as e:
            logger.error(f"Failed to create LiveSale: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to create LiveSale")
    
    async def start_livesale(
        self, 
        livesale_id: str, 
        vendor_id: str,
        stream_url: str
    ) -> LiveSaleModel:
        """Start a LiveSale"""
        try:
            livesale = await self.livesales.find_one({
                "_id": livesale_id,
                "vendor_id": vendor_id
            })
            
            if not livesale:
                raise HTTPException(status_code=404, detail="LiveSale not found")
            
            if livesale["status"] != LiveSaleStatus.SCHEDULED.value:
                raise HTTPException(status_code=400, detail="LiveSale not in scheduled state")
            
            # Update to live status
            update_data = {
                "status": LiveSaleStatus.LIVE.value,
                "stream_url": stream_url,
                "updated_at": datetime.utcnow()
            }
            
            await self.livesales.update_one(
                {"_id": livesale_id},
                {"$set": update_data}
            )
            
            # Add to active livesales registry
            updated_livesale = await self.livesales.find_one({"_id": livesale_id})
            self.active_livesales[livesale_id] = {
                "livesale": updated_livesale,
                "viewers": {},
                "started_at": datetime.utcnow()
            }
            
            # Schedule auto-end
            asyncio.create_task(self._schedule_livesale_end(livesale_id, updated_livesale["duration_minutes"]))
            
            logger.info(f"Started LiveSale: {livesale_id}")
            
            return LiveSaleModel(**updated_livesale)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to start LiveSale: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to start LiveSale")
    
    async def join_livesale(self, livesale_id: str, user_id: str) -> LiveSaleViewer:
        """Join a LiveSale as viewer"""
        try:
            # Check if LiveSale exists and is live
            livesale = await self.livesales.find_one({"_id": livesale_id})
            if not livesale:
                raise HTTPException(status_code=404, detail="LiveSale not found")
            
            if livesale["status"] != LiveSaleStatus.LIVE.value:
                raise HTTPException(status_code=400, detail="LiveSale is not live")
            
            # Check if already viewing
            existing_viewer = await self.livesale_viewers.find_one({
                "livesale_id": livesale_id,
                "user_id": user_id,
                "left_at": None
            })
            
            if existing_viewer:
                return LiveSaleViewer(**existing_viewer)
            
            # Create viewer record
            viewer_doc = {
                "_id": str(ObjectId()),
                "livesale_id": livesale_id,
                "user_id": user_id,
                "joined_at": datetime.utcnow(),
                "watch_time_seconds": 0,
                "points_earned": 0,
                "shared_count": 0,
                "purchased_count": 0,
                "is_winner": False
            }
            
            await self.livesale_viewers.insert_one(viewer_doc)
            
            # Update viewer count
            await self.livesales.update_one(
                {"_id": livesale_id},
                {
                    "$inc": {"viewer_count": 1, "total_viewers": 1},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
            
            # Add to active registry
            if livesale_id in self.active_livesales:
                self.active_livesales[livesale_id]["viewers"][user_id] = viewer_doc
            
            logger.info(f"User {user_id} joined LiveSale {livesale_id}")
            
            return LiveSaleViewer(**viewer_doc)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to join LiveSale: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to join LiveSale")
    
    async def leave_livesale(self, livesale_id: str, user_id: str):
        """Leave a LiveSale"""
        try:
            # Update viewer record
            viewer = await self.livesale_viewers.find_one({
                "livesale_id": livesale_id,
                "user_id": user_id,
                "left_at": None
            })
            
            if viewer:
                left_at = datetime.utcnow()
                watch_time = (left_at - viewer["joined_at"]).total_seconds()
                
                # Calculate watch points
                rewards = await self._get_livesale_rewards(livesale_id)
                watch_points = int(watch_time / 60) * rewards.watch_points
                
                await self.livesale_viewers.update_one(
                    {"_id": viewer["_id"]},
                    {
                        "$set": {
                            "left_at": left_at,
                            "watch_time_seconds": int(watch_time)
                        },
                        "$inc": {"points_earned": watch_points}
                    }
                )
                
                # Update viewer count
                await self.livesales.update_one(
                    {"_id": livesale_id},
                    {"$inc": {"viewer_count": -1}}
                )
                
                # Remove from active registry
                if livesale_id in self.active_livesales:
                    self.active_livesales[livesale_id]["viewers"].pop(user_id, None)
            
            logger.info(f"User {user_id} left LiveSale {livesale_id}")
            
        except Exception as e:
            logger.error(f"Failed to leave LiveSale: {str(e)}")
    
    async def purchase_from_livesale(
        self, 
        livesale_id: str, 
        request: PurchaseFromLiveSaleRequest,
        user_id: str
    ) -> Dict[str, Any]:
        """Purchase product from LiveSale"""
        try:
            livesale = await self.livesales.find_one({"_id": livesale_id})
            if not livesale or livesale["status"] != LiveSaleStatus.LIVE.value:
                raise HTTPException(status_code=400, detail="LiveSale not available")
            
            # Find product
            product = None
            for p in livesale["products"]:
                if p["sku"] == request.sku:
                    product = p
                    break
            
            if not product:
                raise HTTPException(status_code=404, detail="Product not found")
            
            # Check availability
            if product["quantity_sold"] + request.quantity > product["quantity_available"]:
                raise HTTPException(status_code=400, detail="Insufficient stock")
            
            # Update stock
            await self.livesales.update_one(
                {"_id": livesale_id, "products.sku": request.sku},
                {
                    "$inc": {
                        f"products.$.quantity_sold": request.quantity,
                        "total_sales": product["drop_price"] * request.quantity
                    }
                }
            )
            
            # Award purchase points
            rewards = LiveSaleRewards(**livesale["rewards"])
            await self.livesale_viewers.update_one(
                {"livesale_id": livesale_id, "user_id": user_id, "left_at": None},
                {
                    "$inc": {
                        "points_earned": rewards.purchase_points * request.quantity,
                        "purchased_count": request.quantity
                    }
                }
            )
            
            logger.info(f"Purchase from LiveSale {livesale_id}: {request.sku} x{request.quantity}")
            
            return {
                "success": True,
                "sku": request.sku,
                "quantity": request.quantity,
                "price": product["drop_price"],
                "total": product["drop_price"] * request.quantity,
                "points_earned": rewards.purchase_points * request.quantity
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to purchase from LiveSale: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to process purchase")
    
    async def share_livesale(
        self, 
        livesale_id: str, 
        request: ShareLiveSaleRequest,
        user_id: str
    ) -> Dict[str, Any]:
        """Share a LiveSale"""
        try:
            livesale = await self.livesales.find_one({"_id": livesale_id})
            if not livesale:
                raise HTTPException(status_code=404, detail="LiveSale not found")
            
            # Award share points
            rewards = LiveSaleRewards(**livesale["rewards"])
            await self.livesale_viewers.update_one(
                {"livesale_id": livesale_id, "user_id": user_id, "left_at": None},
                {
                    "$inc": {
                        "points_earned": rewards.share_points,
                        "shared_count": 1
                    }
                }
            )
            
            logger.info(f"LiveSale {livesale_id} shared by {user_id} to {request.platform}")
            
            return {
                "success": True,
                "platform": request.platform,
                "points_earned": rewards.share_points
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to share LiveSale: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to share LiveSale")
    
    async def get_livesales(
        self, 
        status: Optional[LiveSaleStatus] = None,
        vendor_id: Optional[str] = None
    ) -> List[LiveSaleModel]:
        """Get LiveSales"""
        try:
            query = {}
            if status:
                query["status"] = status.value
            if vendor_id:
                query["vendor_id"] = vendor_id
            
            cursor = self.livesales.find(query).sort("starts_at", -1)
            
            livesales = []
            async for doc in cursor:
                livesales.append(LiveSaleModel(**doc))
            
            return livesales
            
        except Exception as e:
            logger.error(f"Failed to get LiveSales: {str(e)}")
            return []
    
    async def get_livesale_analytics(self, livesale_id: str, vendor_id: str) -> Dict[str, Any]:
        """Get LiveSale analytics"""
        try:
            livesale = await self.livesales.find_one({
                "_id": livesale_id,
                "vendor_id": vendor_id
            })
            
            if not livesale:
                raise HTTPException(status_code=404, detail="LiveSale not found")
            
            # Get viewer stats
            viewer_stats = await self.livesale_viewers.aggregate([
                {"$match": {"livesale_id": livesale_id}},
                {"$group": {
                    "_id": None,
                    "total_viewers": {"$sum": 1},
                    "total_watch_time": {"$sum": "$watch_time_seconds"},
                    "total_points_awarded": {"$sum": "$points_earned"},
                    "total_shares": {"$sum": "$shared_count"},
                    "total_purchases": {"$sum": "$purchased_count"}
                }}
            ]).to_list(1)
            
            stats = viewer_stats[0] if viewer_stats else {}
            
            return {
                "livesale": LiveSaleModel(**livesale).dict(),
                "analytics": {
                    "total_viewers": stats.get("total_viewers", 0),
                    "avg_watch_time": stats.get("total_watch_time", 0) / max(stats.get("total_viewers", 1), 1),
                    "total_points_awarded": stats.get("total_points_awarded", 0),
                    "total_shares": stats.get("total_shares", 0),
                    "total_purchases": stats.get("total_purchases", 0),
                    "total_sales": livesale["total_sales"],
                    "conversion_rate": (stats.get("total_purchases", 0) / max(stats.get("total_viewers", 1), 1)) * 100
                }
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to get LiveSale analytics: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to get analytics")
    
    async def _schedule_livesale_end(self, livesale_id: str, duration_minutes: int):
        """Schedule automatic LiveSale end"""
        await asyncio.sleep(duration_minutes * 60)
        
        try:
            await self.livesales.update_one(
                {"_id": livesale_id, "status": LiveSaleStatus.LIVE.value},
                {
                    "$set": {
                        "status": LiveSaleStatus.ENDED.value,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            # Remove from active registry
            self.active_livesales.pop(livesale_id, None)
            
            # End all viewer sessions
            await self.livesale_viewers.update_many(
                {"livesale_id": livesale_id, "left_at": None},
                {"$set": {"left_at": datetime.utcnow()}}
            )
            
            logger.info(f"Auto-ended LiveSale: {livesale_id}")
            
        except Exception as e:
            logger.error(f"Failed to auto-end LiveSale {livesale_id}: {str(e)}")
    
    async def _get_livesale_rewards(self, livesale_id: str) -> LiveSaleRewards:
        """Get LiveSale rewards configuration"""
        livesale = await self.livesales.find_one({"_id": livesale_id})
        if livesale and livesale.get("rewards"):
            return LiveSaleRewards(**livesale["rewards"])
        return LiveSaleRewards()
    
    def get_active_livesales(self) -> Dict[str, Dict[str, Any]]:
        """Get currently active LiveSales"""
        return self.active_livesales
    
    async def broadcast_event(self, livesale_id: str, event: LiveSaleEvent):
        """Broadcast event to all viewers (to be used with WebSocket)"""
        # This will be implemented with WebSocket broadcasting
        logger.info(f"Broadcasting event {event.type} to LiveSale {livesale_id}")