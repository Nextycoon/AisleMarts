from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
from services.ai_super_agent_service import ai_super_agent_service

router = APIRouter(prefix="/api/ai-super-agent", tags=["AI Super Agent"])

class PurchaseData(BaseModel):
    id: str
    vendor: Dict[str, Any]
    customer: Dict[str, Any] 
    product: Dict[str, Any]
    timestamp: datetime
    amount: float
    currency: str

class RecommendationRequest(BaseModel):
    user_id: str
    context: Dict[str, Any]
    limit: Optional[int] = 10

class PriceOptimizationRequest(BaseModel):
    product_id: str
    market_data: Dict[str, Any]

class CustomerServiceRequest(BaseModel):
    query: str
    customer_context: Dict[str, Any]
    session_id: Optional[str] = None

@router.post("/vendor-outreach")
async def trigger_vendor_outreach(purchase_data: PurchaseData):
    """
    Trigger automated vendor outreach after purchase
    Core AisleMarts Business Magnet Feature
    """
    try:
        result = await ai_super_agent_service.automated_vendor_outreach(
            purchase_data.dict()
        )
        
        return {
            "success": True,
            "data": result,
            "message": "Vendor outreach initiated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/{user_id}")
async def get_ai_recommendations(user_id: str, context: Optional[Dict] = None):
    """
    Get AI-powered product recommendations for user
    """
    try:
        recommendations = await ai_super_agent_service.ai_product_recommendations(
            user_id, context or {}
        )
        
        return {
            "success": True,
            "data": {
                "recommendations": recommendations,
                "user_id": user_id,
                "generated_at": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/price-optimization")
async def get_price_optimization(request: PriceOptimizationRequest):
    """
    Get AI-powered price optimization recommendations
    """
    try:
        optimization = await ai_super_agent_service.ai_price_optimization(
            request.product_id, request.market_data
        )
        
        return {
            "success": True,
            "data": optimization
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/customer-service")
async def ai_customer_service(request: CustomerServiceRequest):
    """
    AI-powered customer service chat
    """
    try:
        response = await ai_super_agent_service.ai_customer_service(
            request.query, request.customer_context
        )
        
        return {
            "success": True,
            "data": {
                "response": response,
                "session_id": request.session_id,
                "timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/outreach")
async def get_outreach_analytics(days: int = 30):
    """
    Get vendor outreach analytics and success rates
    """
    try:
        # Simulate analytics data
        analytics = {
            "total_outreach_attempts": 1247,
            "successful_outreach": 1089,
            "success_rate": 87.3,
            "new_vendor_signups": 234,
            "conversion_rate": 18.8,
            "channels": {
                "email": {"attempts": 1247, "success": 1089, "rate": 87.3},
                "whatsapp": {"attempts": 892, "success": 756, "rate": 84.8},
                "sms": {"attempts": 567, "success": 489, "rate": 86.2}
            },
            "top_converting_categories": [
                {"category": "Fashion", "signups": 89, "rate": 23.1},
                {"category": "Electronics", "signups": 67, "rate": 19.8},
                {"category": "Home & Garden", "signups": 45, "rate": 16.7}
            ]
        }
        
        return {
            "success": True,
            "data": analytics,
            "period": f"Last {days} days"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """
    Health check for AI Super Agent service
    """
    return {
        "service": "AI Super Agent",
        "status": "operational",
        "features": [
            "Automated Vendor Outreach",
            "AI Product Recommendations", 
            "Price Optimization",
            "Customer Service AI",
            "Business Analytics"
        ],
        "timestamp": datetime.now().isoformat()
    }