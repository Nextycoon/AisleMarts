from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime

from security import decode_access_token
from db import db
from geographic_service import geographic_service
from schemas import ProductOut

router = APIRouter(prefix="/geographic", tags=["Geographic Targeting"])

# Request/Response models
class VisibilityConfigRequest(BaseModel):
    visibility_type: Literal["local", "national", "global_strategic", "global_all"]
    local_radius_km: Optional[float] = None
    local_center_city_id: Optional[str] = None
    target_countries: Optional[List[str]] = None
    target_cities: Optional[List[str]] = None
    target_regions: Optional[List[str]] = None
    excluded_countries: Optional[List[str]] = None
    excluded_cities: Optional[List[str]] = None
    auto_expand: bool = True
    budget_daily_usd: Optional[float] = None
    performance_threshold: Optional[float] = 0.02

class MarketAnalysisRequest(BaseModel):
    product_category: str
    target_locations: List[str]

class PerformanceTrackingRequest(BaseModel):
    product_id: Optional[str] = None
    country_code: str
    city_id: Optional[str] = None
    event_type: Literal["view", "click", "conversion"] = "view"
    revenue: float = 0.0

class GeographicFilterRequest(BaseModel):
    buyer_country_code: Optional[str] = None
    buyer_city_id: Optional[str] = None
    max_distance_km: Optional[float] = None
    include_international: bool = True

async def get_current_user_from_token(authorization: str):
    """Extract user from auth token"""
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

@router.post("/initialize")
async def initialize_geographic_data():
    """Initialize world cities and countries database"""
    try:
        result = await geographic_service.initialize_geographic_data()
        return result
    except Exception as e:
        raise HTTPException(500, f"Initialization error: {str(e)}")

@router.get("/countries")
async def get_countries():
    """Get all countries"""
    try:
        countries_cursor = db().countries.find({"active": True})
        countries = await countries_cursor.to_list(length=300)
        return {"countries": countries}
    except Exception as e:
        raise HTTPException(500, f"Error fetching countries: {str(e)}")

@router.get("/cities")
async def get_cities(
    country_code: Optional[str] = None,
    major_cities_only: bool = False,
    limit: int = 100
):
    """Get cities, optionally filtered by country"""
    try:
        filter_dict = {}
        if country_code:
            filter_dict["country_code"] = country_code
        if major_cities_only:
            filter_dict["is_major_city"] = True
        
        cities_cursor = db().cities.find(filter_dict).limit(limit)
        cities = await cities_cursor.to_list(length=limit)
        return {"cities": cities}
    except Exception as e:
        raise HTTPException(500, f"Error fetching cities: {str(e)}")

@router.post("/cities/in-radius")
async def get_cities_in_radius(
    center_city_id: str,
    radius_km: float
):
    """Get all cities within radius of center city"""
    try:
        cities = await geographic_service.get_cities_in_radius(center_city_id, radius_km)
        return {"cities": cities, "count": len(cities)}
    except Exception as e:
        raise HTTPException(500, f"Error calculating cities in radius: {str(e)}")

# Seller Visibility Management
@router.post("/visibility")
async def create_seller_visibility(
    config: VisibilityConfigRequest,
    authorization: str = None
):
    """Create or update seller visibility settings"""
    try:
        user = await get_current_user_from_token(authorization)
        if "vendor" not in user.get("roles", []) and "admin" not in user.get("roles", []):
            raise HTTPException(403, "Vendor or admin access required")
        
        # For vendors, use their vendor ID; for admins, require vendor_id in request
        vendor_id = None
        if "vendor" in user.get("roles", []):
            # Find vendor record for this user
            vendor = await db().vendors.find_one({"userIdOwner": str(user["_id"])})
            if vendor:
                vendor_id = str(vendor["_id"])
        
        if not vendor_id:
            raise HTTPException(400, "Vendor not found")
        
        result = await geographic_service.create_seller_visibility(
            vendor_id, 
            config.model_dump()
        )
        return result
    except Exception as e:
        raise HTTPException(500, f"Error creating visibility settings: {str(e)}")

@router.get("/visibility/{vendor_id}")
async def get_seller_visibility(
    vendor_id: str,
    authorization: str = None
):
    """Get seller visibility settings"""
    try:
        user = await get_current_user_from_token(authorization)
        
        # Check permissions
        if "admin" not in user.get("roles", []):
            # Vendors can only see their own visibility
            vendor = await db().vendors.find_one({"userIdOwner": str(user["_id"])})
            if not vendor or str(vendor["_id"]) != vendor_id:
                raise HTTPException(403, "Access denied")
        
        visibility = await geographic_service.get_seller_visibility(vendor_id)
        if not visibility:
            return {"visibility": None, "message": "No visibility settings found"}
        
        return {"visibility": visibility}
    except Exception as e:
        raise HTTPException(500, f"Error fetching visibility settings: {str(e)}")

@router.post("/market-analysis")
async def analyze_market_opportunity(
    request: MarketAnalysisRequest,
    authorization: str = None
):
    """Get AI-powered market analysis for product in target locations"""
    try:
        user = await get_current_user_from_token(authorization)
        
        analysis = await geographic_service.analyze_market_opportunity(
            request.product_category,
            request.target_locations
        )
        return analysis
    except Exception as e:
        raise HTTPException(500, f"Market analysis error: {str(e)}")

@router.get("/targeting-recommendations/{vendor_id}")
async def get_targeting_recommendations(
    vendor_id: str,
    authorization: str = None
):
    """Get AI-powered targeting recommendations for vendor"""
    try:
        user = await get_current_user_from_token(authorization)
        
        # Check permissions
        if "admin" not in user.get("roles", []):
            vendor = await db().vendors.find_one({"userIdOwner": str(user["_id"])})
            if not vendor or str(vendor["_id"]) != vendor_id:
                raise HTTPException(403, "Access denied")
        
        # Get vendor's products
        products_cursor = db().products.find({"vendorId": vendor_id, "active": True})
        products = await products_cursor.to_list(length=20)
        
        recommendations = await geographic_service.get_ai_targeting_recommendations(
            vendor_id, 
            products
        )
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(500, f"Error getting recommendations: {str(e)}")

@router.post("/track-performance")
async def track_performance(
    request: PerformanceTrackingRequest,
    authorization: str = None
):
    """Track geographic performance metrics"""
    try:
        user = await get_current_user_from_token(authorization)
        
        # For simplicity, allow any authenticated user to track performance
        # In production, you might want stricter controls
        
        result = await geographic_service.track_geographic_performance(
            "system",  # System tracking for now
            request.product_id,
            request.country_code,
            request.city_id,
            request.event_type,
            request.revenue
        )
        return result
    except Exception as e:
        raise HTTPException(500, f"Performance tracking error: {str(e)}")

@router.get("/analytics/{vendor_id}")
async def get_vendor_analytics(
    vendor_id: str,
    days: int = 30,
    authorization: str = None
):
    """Get comprehensive geographic analytics for vendor"""
    try:
        user = await get_current_user_from_token(authorization)
        
        # Check permissions
        if "admin" not in user.get("roles", []):
            vendor = await db().vendors.find_one({"userIdOwner": str(user["_id"])})
            if not vendor or str(vendor["_id"]) != vendor_id:
                raise HTTPException(403, "Access denied")
        
        analytics = await geographic_service.get_vendor_geographic_analytics(vendor_id, days)
        return analytics
    except Exception as e:
        raise HTTPException(500, f"Analytics error: {str(e)}")

# Buyer-side geographic filtering
@router.post("/filter-products")
async def filter_products_by_geography(
    request: GeographicFilterRequest,
    q: Optional[str] = None,
    category_id: Optional[str] = None,
    limit: int = 20
):
    """Filter products based on buyer's geographic preferences"""
    try:
        # Base product query
        filter_dict = {"active": True}
        
        if q:
            filter_dict["$or"] = [
                {"title": {"$regex": q, "$options": "i"}},
                {"description": {"$regex": q, "$options": "i"}},
                {"brand": {"$regex": q, "$options": "i"}}
            ]
        
        if category_id:
            filter_dict["category_id"] = category_id
        
        # Get products
        products_cursor = db().products.find(filter_dict).limit(limit * 2)  # Get more for filtering
        products = await products_cursor.to_list(length=limit * 2)
        
        # Apply geographic filtering based on seller visibility
        filtered_products = []
        
        for product in products:
            vendor_id = product.get("vendorId")
            if not vendor_id:
                continue
            
            # Check seller visibility settings
            visibility = await geographic_service.get_seller_visibility(vendor_id)
            if not visibility:
                # Default: show all products if no visibility set
                filtered_products.append(product)
                continue
            
            # Apply visibility rules
            should_show = False
            
            if visibility["visibility_type"] == "global_all":
                should_show = True
            elif visibility["visibility_type"] == "global_strategic":
                if request.buyer_country_code in visibility.get("target_countries", []):
                    should_show = True
                if request.buyer_city_id in visibility.get("target_cities", []):
                    should_show = True
            elif visibility["visibility_type"] == "national":
                if request.buyer_country_code in visibility.get("target_countries", []):
                    should_show = True
            elif visibility["visibility_type"] == "local":
                # Check if buyer is within local radius
                if visibility.get("local_center_city_id") and request.buyer_city_id:
                    cities_in_radius = await geographic_service.get_cities_in_radius(
                        visibility["local_center_city_id"],
                        visibility.get("local_radius_km", 50)
                    )
                    buyer_cities = [c["_id"] for c in cities_in_radius]
                    if request.buyer_city_id in buyer_cities:
                        should_show = True
            
            # Check exclusions
            if should_show:
                if request.buyer_country_code in visibility.get("excluded_countries", []):
                    should_show = False
                if request.buyer_city_id in visibility.get("excluded_cities", []):
                    should_show = False
            
            if should_show:
                filtered_products.append(product)
            
            if len(filtered_products) >= limit:
                break
        
        # Convert to response format
        response_products = []
        for product in filtered_products:
            response_products.append({
                "id": str(product["_id"]),
                "title": product.get("title", ""),
                "price": product.get("price", 0),
                "currency": product.get("currency", "USD"),
                "brand": product.get("brand", ""),
                "images": product.get("images", []),
                "vendorId": product.get("vendorId", "")
            })
        
        return {
            "products": response_products,
            "total_found": len(response_products),
            "geographic_filter_applied": True,
            "buyer_location": {
                "country_code": request.buyer_country_code,
                "city_id": request.buyer_city_id
            }
        }
        
    except Exception as e:
        raise HTTPException(500, f"Geographic filtering error: {str(e)}")

# Seller Dashboard Insights
@router.get("/insights/{vendor_id}")
async def get_seller_geographic_insights(
    vendor_id: str,
    authorization: str = None
):
    """Get geographic insights and recommendations for seller dashboard"""
    try:
        user = await get_current_user_from_token(authorization)
        
        # Check permissions
        if "admin" not in user.get("roles", []):
            vendor = await db().vendors.find_one({"userIdOwner": str(user["_id"])})
            if not vendor or str(vendor["_id"]) != vendor_id:
                raise HTTPException(403, "Access denied")
        
        # Get current visibility settings
        visibility = await geographic_service.get_seller_visibility(vendor_id)
        
        # Get analytics
        analytics = await geographic_service.get_vendor_geographic_analytics(vendor_id, 30)
        
        # Get AI recommendations
        products_cursor = db().products.find({"vendorId": vendor_id, "active": True})
        products = await products_cursor.to_list(length=10)
        
        ai_recommendations = await geographic_service.get_ai_targeting_recommendations(
            vendor_id, 
            products
        )
        
        return {
            "current_visibility": visibility,
            "performance_analytics": analytics,
            "ai_recommendations": ai_recommendations,
            "quick_stats": {
                "countries_active": len(analytics.get("country_performance", {})),
                "cities_active": len(analytics.get("city_performance", {})),
                "total_revenue": analytics.get("total_stats", {}).get("revenue_usd", 0),
                "best_performing_country": analytics.get("top_countries", [{}])[0].get("0") if analytics.get("top_countries") else None
            }
        }
        
    except Exception as e:
        raise HTTPException(500, f"Insights error: {str(e)}")