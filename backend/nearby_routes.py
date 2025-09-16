"""
Phase 3: Nearby/Onsite Commerce - FastAPI Routes
Main API endpoints for location-based search, reservations, and scanning
"""

from fastapi import APIRouter, Depends, Query, HTTPException, Header, Path
from typing import List, Optional, Literal
from datetime import datetime, timedelta
import time
import uuid
import logging
import asyncio

from db import db
from security import decode_access_token
from nearby_schemas import (
    Location, Offer, NearbySearchItem, NearbySearchResponse,
    ProductOffersResponse, ReservationIn, ReservationOut, ReservationStatus,
    ScanIn, ScanOut, ScanResult, NearbyHealthResponse, NearbyAnalytics
)
from nearby_cache import nearby_cache
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/nearby", tags=["nearby"])

# Dependency for optional user authentication
async def get_optional_user(authorization: str | None = Header(None)):
    """Get current user if authenticated, None otherwise"""
    if not authorization:
        return None
    try:
        token = authorization.split()[1]
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id:
            user = await db().users.find_one({"_id": user_id})
            return user
    except Exception:
        pass
    return None

async def get_current_user(authorization: str | None = Header(None)):
    """Require authenticated user"""
    user = await get_optional_user(authorization)
    if not user:
        raise HTTPException(401, "Authentication required")
    return user

# Helper functions
def calculate_best_pick_score(offer: dict, location: dict, user_context: dict = None) -> tuple[float, List[str]]:
    """Calculate Best Pick score with transparent reasoning"""
    reasons = []
    score = 0.0
    
    # Price factor (35%) - lower price = higher score
    price_amount = offer.get("price", {}).get("amount", 999999)
    if price_amount <= 50000:  # KES 500
        price_score = 35.0
        reasons.append("Great Price")
    elif price_amount <= 150000:  # KES 1500
        price_score = 25.0
        reasons.append("Good Value")
    else:
        price_score = 10.0
        reasons.append("Premium Option")
    score += price_score
    
    # Distance factor (25%) - closer = higher score
    distance_m = location.get("distance_m", 10000)
    if distance_m <= 1000:  # 1km
        distance_score = 25.0
        reasons.append("Very Close")
    elif distance_m <= 5000:  # 5km
        distance_score = 20.0
        reasons.append("Nearby")
    else:
        distance_score = 10.0
        reasons.append("Moderate Distance")
    score += distance_score
    
    # Trust factor (25%) - based on location capabilities
    trust_score = 15.0  # Base trust
    capabilities = location.get("capabilities", {})
    if capabilities.get("rfq_counter"):
        trust_score += 5.0
        reasons.append("B2B Ready")
    if capabilities.get("mpesa_payment"):
        trust_score += 5.0
        reasons.append("M-Pesa Accepted")
    score += trust_score
    
    # Stock factor (10%) - higher stock = higher score
    qty = offer.get("qty", 0)
    if qty >= 10:
        stock_score = 10.0
        reasons.append("High Stock")
    elif qty >= 5:
        stock_score = 7.0
        reasons.append("Available")
    elif qty > 0:
        stock_score = 3.0
        reasons.append("Limited Stock")
    else:
        stock_score = 0.0
    score += stock_score
    
    # ETA factor (5%) - pickup availability
    eta_score = 5.0 if "pickup" in location.get("services", []) else 2.0
    if eta_score == 5.0:
        reasons.append("Pickup Available")
    score += eta_score
    
    return round(score / 100, 2), reasons[:3]  # Normalize to 0-1, limit reasons

@router.get("/health", response_model=NearbyHealthResponse)
async def nearby_health():
    """System health check for nearby commerce features"""
    try:
        start_time = time.time()
        
        # Check database connectivity
        locations_count = await db().locations.count_documents({"status": "active"})
        inventory_count = await db().inventory_snapshots.count_documents({})
        active_reservations = await db().reservations.count_documents({"status": {"$in": ["held", "confirmed"]}})
        
        # Check cache status
        cache_stats = await nearby_cache.get_cache_stats()
        
        response_time = round((time.time() - start_time) * 1000, 2)
        
        return NearbyHealthResponse(
            status="healthy",
            features={
                "location_search": settings.NEARBY_ENABLED,
                "reservations": True,
                "scanning": True,
                "caching": cache_stats["redis_connected"],
                "maps": settings.MAP_PROVIDER == "mapbox"
            },
            locations_count=locations_count,
            inventory_count=inventory_count,
            active_reservations=active_reservations,
            cache_status=cache_stats,
            performance={
                "health_check_ms": response_time,
                "target_search_ms": 800,
                "target_reservation_ms": 2500
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(500, f"Health check failed: {str(e)}")

@router.get("/locations")
async def get_nearby_locations(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"), 
    radius_m: int = Query(5000, description="Search radius in meters"),
    type: Optional[str] = Query(None, description="Location type filter"),
    open_now: bool = Query(False, description="Filter for currently open locations"),
    limit: int = Query(50, description="Maximum results")
):
    """Get nearby locations with optional filtering"""
    try:
        pipeline = [
            {
                "$geoNear": {
                    "near": {"type": "Point", "coordinates": [lng, lat]},
                    "distanceField": "distance_m",
                    "maxDistance": radius_m,
                    "spherical": True
                }
            },
            {"$match": {"status": "active"}},
        ]
        
        if type:
            pipeline[1]["$match"]["type"] = type
        
        pipeline.append({"$limit": limit})
        
        locations = await db().locations.aggregate(pipeline).to_list(length=limit)
        
        # Convert ObjectId to string for response
        for loc in locations:
            loc["_id"] = str(loc["_id"])
            
        return locations
        
    except Exception as e:
        logger.error(f"Location search failed: {e}")
        raise HTTPException(500, f"Location search failed: {str(e)}")

@router.get("/search", response_model=NearbySearchResponse)
async def nearby_search(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_m: int = Query(2000, description="Search radius in meters"),
    q: Optional[str] = Query(None, description="Search query"),
    mode: str = Query("retail", description="Search mode: retail, wholesale, all"),
    sort: str = Query("best_pick", description="Sort by: best_pick, distance, price"),
    limit: int = Query(20, description="Maximum results"),
    page: int = Query(1, description="Page number"),
    user: dict = Depends(get_optional_user)
):
    """Enhanced nearby search with Best Pick scoring"""
    start_time = time.time()
    
    try:
        # Check cache first
        cached_results = await nearby_cache.get_search_results(
            lat, lng, radius_m, mode, q, sort=sort, page=page, limit=limit
        )
        
        if cached_results:
            search_time_ms = round((time.time() - start_time) * 1000, 2)
            return NearbySearchResponse(
                items=cached_results,
                total_count=len(cached_results),
                search_time_ms=search_time_ms,
                cached=True,
                location_context={"lat": lat, "lng": lng, "radius_m": radius_m}
            )
        
        # 1. Get nearby locations
        location_pipeline = [
            {
                "$geoNear": {
                    "near": {"type": "Point", "coordinates": [lng, lat]},
                    "distanceField": "distance_m",
                    "maxDistance": radius_m,
                    "spherical": True
                }
            },
            {"$match": {"status": "active"}},
        ]
        
        if mode in ["retail", "wholesale"]:
            location_pipeline[1]["$match"]["type"] = mode
            
        location_pipeline.append({"$limit": 200})  # Get more locations for better results
        
        locations = await db().locations.aggregate(location_pipeline).to_list(200)
        
        if not locations:
            return NearbySearchResponse(
                items=[],
                total_count=0,
                search_time_ms=round((time.time() - start_time) * 1000, 2),
                location_context={"lat": lat, "lng": lng, "radius_m": radius_m}
            )
        
        # 2. Get inventory for these locations
        location_ids = [loc["_id"] for loc in locations]
        inventory_filter = {"location_id": {"$in": location_ids}, "qty": {"$gt": 0}}
        
        if q:
            # Simple text search in SKU for now
            inventory_filter["sku"] = {"$regex": q, "$options": "i"}
        
        inventory = await db().inventory_snapshots.find(inventory_filter).to_list(1000)
        
        # 3. Create location lookup
        location_map = {str(loc["_id"]): loc for loc in locations}
        
        # 4. Build search results with Best Pick scoring
        items = []
        for inv in inventory:
            location = location_map.get(str(inv["location_id"]))
            if not location:
                continue
                
            # Calculate Best Pick score
            score, reasons = calculate_best_pick_score(inv, location, user)
            
            # Create offer
            offer = Offer(
                sku=inv["sku"],
                gtin=inv.get("gtin"),
                qty=inv["qty"],
                price=inv["price"],
                attributes=inv.get("attributes", {}),
                location_id=str(inv["location_id"]),
                merchant_id=inv["merchant_id"],
                distance_m=location["distance_m"],
                source=inv.get("source", "manual"),
                updated_at=inv["updated_at"]
            )
            
            # Create location
            location_obj = Location(
                _id=str(location["_id"]),
                merchant_id=location["merchant_id"],
                name=location["name"],
                type=location["type"],
                geo=location["geo"],
                address=location["address"],
                opening_hours=location.get("opening_hours", []),
                services=location.get("services", []),
                capabilities=location.get("capabilities", {}),
                status=location["status"],
                distance_m=location["distance_m"],
                updated_at=location["updated_at"]
            )
            
            # Create search item
            search_item = NearbySearchItem(
                product_id=None,  # Would link to product catalog
                title=f"Product {inv['sku']}",
                description=f"Available at {location['name']}",
                best_pick_score=score,
                best_pick_reasons=reasons,
                best_offer=offer,
                offers_count=1,
                location=location_obj
            )
            
            items.append(search_item)
        
        # 5. Sort results
        if sort == "best_pick":
            items.sort(key=lambda x: x.best_pick_score, reverse=True)
        elif sort == "distance":
            items.sort(key=lambda x: x.best_offer.distance_m or 999999)
        elif sort == "price":
            items.sort(key=lambda x: x.best_offer.price.amount)
        
        # 6. Paginate
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paged_items = items[start_idx:end_idx]
        
        # Convert to dict for caching and response
        items_dict = [item.model_dump() for item in paged_items]
        
        # Cache results
        await nearby_cache.set_search_results(
            lat, lng, radius_m, mode, items_dict, q, sort=sort, page=page, limit=limit
        )
        
        search_time_ms = round((time.time() - start_time) * 1000, 2)
        
        return NearbySearchResponse(
            items=paged_items,
            total_count=len(items),
            search_time_ms=search_time_ms,
            cached=False,
            location_context={"lat": lat, "lng": lng, "radius_m": radius_m}
        )
        
    except Exception as e:
        logger.error(f"Nearby search failed: {e}")
        raise HTTPException(500, f"Search failed: {str(e)}")

@router.get("/products/{product_id}/offers", response_model=ProductOffersResponse)
async def get_product_offers(
    product_id: str = Path(..., description="Product ID"),
    lat: Optional[float] = Query(None, description="Latitude for location-based offers"),
    lng: Optional[float] = Query(None, description="Longitude for location-based offers"),
    radius_m: int = Query(10000, description="Search radius in meters"),
    limit: int = Query(50, description="Maximum offers")
):
    """Get offers for a specific product at nearby locations"""
    try:
        # For now, return placeholder since we don't have product catalog integration
        return ProductOffersResponse(
            product_id=product_id,
            offers=[],
            total_offers=0,
            nearby_locations=[],
            best_pick=None
        )
    except Exception as e:
        logger.error(f"Product offers search failed: {e}")
        raise HTTPException(500, f"Product offers search failed: {str(e)}")

@router.post("/reservations", response_model=ReservationOut)
async def create_reservation(
    reservation_data: ReservationIn,
    user: dict = Depends(get_current_user),
    idempotency_key: Optional[str] = Header(None)
):
    """Create a new reservation with inventory hold"""
    try:
        # Generate reservation reference
        now = datetime.utcnow()
        ref_suffix = str(uuid.uuid4())[:8].upper()
        reference = f"RES-KE-{now.strftime('%Y%m%d')}-{ref_suffix}"
        
        # Calculate hold expiry (30 minutes from now)
        hold_expires_at = now + timedelta(minutes=30)
        
        # For Week 1 MVP, create reservation without atomic stock hold
        reservation_id = str(uuid.uuid4())
        
        reservation_doc = {
            "_id": reservation_id,
            "user_id": str(user["_id"]),
            "items": [item.model_dump() for item in reservation_data.items],
            "status": "held",
            "hold_expires_at": hold_expires_at.isoformat() + "Z",
            "pickup_window": reservation_data.pickup_window.model_dump() if reservation_data.pickup_window else None,
            "reference": reference,
            "notes": reservation_data.notes,
            "created_at": now.isoformat() + "Z",
            "audit": [{
                "at": now.isoformat() + "Z",
                "event": "created",
                "by": "user",
                "comment": "Reservation created"
            }]
        }
        
        await db().reservations.insert_one(reservation_doc)
        
        return ReservationOut(
            reservation_id=reservation_id,
            reference=reference,
            hold_expires_at=hold_expires_at.isoformat() + "Z",
            pickup_window=reservation_data.pickup_window,
            total_amount=None,  # Calculate in Week 2
            currency="KES"
        )
        
    except Exception as e:
        logger.error(f"Reservation creation failed: {e}")
        raise HTTPException(500, f"Reservation creation failed: {str(e)}")

@router.get("/reservations/{reservation_id}", response_model=ReservationStatus)
async def get_reservation_status(
    reservation_id: str = Path(..., description="Reservation ID"),
    user: dict = Depends(get_current_user)
):
    """Get reservation status and details"""
    try:
        reservation = await db().reservations.find_one({
            "_id": reservation_id,
            "user_id": str(user["_id"])
        })
        
        if not reservation:
            raise HTTPException(404, "Reservation not found")
        
        return ReservationStatus(
            reservation_id=reservation_id,
            reference=reservation["reference"],
            status=reservation["status"],
            items=reservation["items"],
            hold_expires_at=reservation.get("hold_expires_at"),
            pickup_window=reservation.get("pickup_window"),
            pickup_code=reservation.get("pickup_code"),
            total_amount=reservation.get("total_amount"),
            currency=reservation.get("currency", "KES"),
            created_at=reservation["created_at"],
            audit_trail=reservation.get("audit", [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reservation status check failed: {e}")
        raise HTTPException(500, f"Reservation status check failed: {str(e)}")

@router.post("/reservations/{reservation_id}/confirm")
async def confirm_reservation(
    reservation_id: str = Path(..., description="Reservation ID"),
    user: dict = Depends(get_current_user)
):
    """Confirm held reservation and generate pickup code"""
    try:
        reservation = await db().reservations.find_one({
            "_id": reservation_id,
            "user_id": str(user["_id"]),
            "status": "held"
        })
        
        if not reservation:
            raise HTTPException(404, "Reservation not found or already processed")
        
        # Generate 6-digit pickup code
        pickup_code = f"{uuid.uuid4().int % 1000000:06d}"
        now = datetime.utcnow()
        
        # Update reservation status
        await db().reservations.update_one(
            {"_id": reservation_id},
            {
                "$set": {
                    "status": "confirmed",
                    "pickup_code": pickup_code,
                    "confirmed_at": now.isoformat() + "Z"
                },
                "$push": {
                    "audit": {
                        "at": now.isoformat() + "Z",
                        "event": "confirmed",
                        "by": "user",
                        "comment": f"Reservation confirmed with pickup code {pickup_code}"
                    }
                }
            }
        )
        
        return {
            "reservation_id": reservation_id,
            "status": "confirmed",
            "pickup_code": pickup_code,
            "message": "Reservation confirmed. Show pickup code at location."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reservation confirmation failed: {e}")
        raise HTTPException(500, f"Reservation confirmation failed: {str(e)}")

@router.post("/reservations/{reservation_id}/cancel")
async def cancel_reservation(
    reservation_id: str = Path(..., description="Reservation ID"),
    user: dict = Depends(get_current_user)
):
    """Cancel reservation and release held inventory"""
    try:
        reservation = await db().reservations.find_one({
            "_id": reservation_id,
            "user_id": str(user["_id"]),
            "status": {"$in": ["held", "confirmed"]}
        })
        
        if not reservation:
            raise HTTPException(404, "Reservation not found or already processed")
        
        now = datetime.utcnow()
        
        # Update reservation status
        await db().reservations.update_one(
            {"_id": reservation_id},
            {
                "$set": {
                    "status": "cancelled",
                    "cancelled_at": now.isoformat() + "Z"
                },
                "$push": {
                    "audit": {
                        "at": now.isoformat() + "Z",
                        "event": "cancelled",
                        "by": "user",
                        "comment": "Reservation cancelled by user"
                    }
                }
            }
        )
        
        # TODO: Release inventory holds in Week 2
        
        return {
            "reservation_id": reservation_id,
            "status": "cancelled",
            "message": "Reservation cancelled successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reservation cancellation failed: {e}")
        raise HTTPException(500, f"Reservation cancellation failed: {str(e)}")

@router.post("/scan", response_model=ScanOut)
async def scan_barcode(
    scan_data: ScanIn,
    user: dict = Depends(get_optional_user)
):
    """Scan barcode/QR code and get product offers"""
    start_time = time.time()
    
    try:
        # Log scan for analytics
        scan_doc = {
            "_id": str(uuid.uuid4()),
            "user_id": str(user["_id"]) if user else None,
            "barcode": scan_data.barcode,
            "context": {
                "geo": {"type": "Point", "coordinates": [scan_data.lng, scan_data.lat]} if scan_data.lat and scan_data.lng else None,
                "location_id": scan_data.location_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            },
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        # Search inventory by GTIN/barcode
        inventory_results = await db().inventory_snapshots.find({
            "gtin": scan_data.barcode,
            "qty": {"$gt": 0}
        }).to_list(100)
        
        offers = []
        nearby_locations = []
        
        if inventory_results:
            # Get location details
            location_ids = [inv["location_id"] for inv in inventory_results]
            locations = await db().locations.find({
                "_id": {"$in": location_ids},
                "status": "active"
            }).to_list(100)
            
            location_map = {str(loc["_id"]): loc for loc in locations}
            
            # If user provided location, calculate distances
            if scan_data.lat and scan_data.lng:
                for loc in locations:
                    # Simple distance calculation (would use geospatial query in production)
                    loc["distance_m"] = 500  # Placeholder
            
            # Build offers
            for inv in inventory_results:
                location = location_map.get(str(inv["location_id"]))
                if location:
                    offer = Offer(
                        sku=inv["sku"],
                        gtin=inv.get("gtin"),
                        qty=inv["qty"],
                        price=inv["price"],
                        attributes=inv.get("attributes", {}),
                        location_id=str(inv["location_id"]),
                        merchant_id=inv["merchant_id"],
                        distance_m=location.get("distance_m"),
                        source=inv.get("source", "manual"),
                        updated_at=inv["updated_at"]
                    )
                    offers.append(offer)
                    
                    if location not in nearby_locations:
                        location_obj = Location(
                            _id=str(location["_id"]),
                            merchant_id=location["merchant_id"],
                            name=location["name"],
                            type=location["type"],
                            geo=location["geo"],
                            address=location["address"],
                            opening_hours=location.get("opening_hours", []),
                            services=location.get("services", []),
                            capabilities=location.get("capabilities", {}),
                            status=location["status"],
                            distance_m=location.get("distance_m"),
                            updated_at=location["updated_at"]
                        )
                        nearby_locations.append(location_obj)
        
        # Find best offer
        best_offer = None
        if offers:
            # Simple best offer logic (lowest price)
            best_offer = min(offers, key=lambda x: x.price.amount)
        
        # Log scan result
        scan_doc["resolved"] = {
            "gtin": scan_data.barcode,
            "offers_found": len(offers)
        }
        scan_doc["latency_ms"] = round((time.time() - start_time) * 1000, 2)
        
        await db().scans.insert_one(scan_doc)
        
        return ScanOut(
            barcode=scan_data.barcode,
            resolved=ScanResult(
                gtin=scan_data.barcode,
                title=f"Product {scan_data.barcode}" if offers else None
            ) if offers else None,
            offers=offers,
            nearby_locations=nearby_locations,
            best_offer=best_offer,
            diagnostics={
                "latency_ms": round((time.time() - start_time) * 1000, 2),
                "offers_found": len(offers),
                "locations_searched": len(nearby_locations),
                "cached": False
            }
        )
        
    except Exception as e:
        logger.error(f"Barcode scan failed: {e}")
        raise HTTPException(500, f"Barcode scan failed: {str(e)}")

@router.get("/analytics", response_model=NearbyAnalytics)
async def get_nearby_analytics():
    """Get analytics for nearby commerce features"""
    try:
        # Basic analytics from database
        total_scans = await db().scans.count_documents({})
        successful_scans = await db().scans.count_documents({"resolved.offers_found": {"$gt": 0}})
        active_reservations = await db().reservations.count_documents({"status": {"$in": ["held", "confirmed"]}})
        
        # Calculate success rates
        scan_success_rate = (successful_scans / total_scans * 100) if total_scans > 0 else 0
        
        return NearbyAnalytics(
            search_queries=0,  # Would track from cache stats
            successful_scans=successful_scans,
            active_reservations=active_reservations,
            pickup_success_rate=95.0,  # Placeholder
            avg_search_time_ms=45.0,  # Placeholder
            popular_locations=[],
            top_scanned_products=[]
        )
        
    except Exception as e:
        logger.error(f"Analytics retrieval failed: {e}")
        raise HTTPException(500, f"Analytics retrieval failed: {str(e)}")

@router.post("/initialize")
async def initialize_nearby_system():
    """Initialize nearby system with sample data"""
    try:
        # This endpoint can be used to set up sample data or reset system
        # For now, just return status
        return {
            "status": "initialized",
            "message": "Nearby system ready",
            "features": ["location_search", "reservations", "scanning"],
            "sample_data": "Nairobi locations and inventory available"
        }
    except Exception as e:
        logger.error(f"System initialization failed: {e}")
        raise HTTPException(500, f"System initialization failed: {str(e)}")