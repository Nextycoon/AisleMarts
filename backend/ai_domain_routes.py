from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime

from security import decode_access_token
from db import db
from ai_domain_service import ai_domain_service
from ai_domain_models import (
    HSCodeSuggestRequest, LandedCostRequest, FreightQuoteRequest,
    ComplianceScreeningRequest, PaymentMethodsRequest, TaxComputeRequest
)

router = APIRouter(prefix="/api/trade", tags=["AI Trade Intelligence"])

# Pydantic models for API
class HSCodeSuggestRequestAPI(BaseModel):
    title: str
    materials: Optional[str] = None
    use: Optional[str] = None
    country_origin: Optional[str] = None

class LandedCostItemAPI(BaseModel):
    sku: str
    hs: Optional[str] = None
    value: float
    qty: int
    uom: str
    origin: str

class LandedCostRequestAPI(BaseModel):
    destination_country: str
    incoterm: str
    items: List[LandedCostItemAPI]
    freight_cost: Optional[float] = 0.0
    insurance_cost: Optional[float] = 0.0
    currency: str = "USD"

class FreightDimensionAPI(BaseModel):
    l_cm: float
    w_cm: float
    h_cm: float
    qty: int

class FreightQuoteRequestAPI(BaseModel):
    mode: Literal["Air", "Sea FCL", "Sea LCL", "Road", "Courier"]
    dimensions: List[FreightDimensionAPI]
    weight_kg: float
    origin: str
    destination: str
    ready_date: Optional[str] = None
    service_level: Literal["speed", "balanced", "economy"] = "balanced"

class CompliancePartyAPI(BaseModel):
    name: str
    country: str

class ComplianceScreeningRequestAPI(BaseModel):
    parties: List[CompliancePartyAPI]

class PaymentMethodsRequestAPI(BaseModel):
    country: str
    currency: str
    cart_total: float

class TaxComputeItemAPI(BaseModel):
    sku: str
    category: str
    price: float

class TaxComputeRequestAPI(BaseModel):
    country: str
    role: Literal["marketplace_facilitator", "merchant_of_record", "platform_only"]
    items: List[TaxComputeItemAPI]

class TradeInsightsRequestAPI(BaseModel):
    query: str
    context: Dict[str, Any] = {}

async def get_current_user_optional(authorization: str | None = None):
    """Extract user from auth token (optional)"""
    if not authorization:
        return None
    
    try:
        token = authorization.split()[1]
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        user = await db().users.find_one({"_id": user_id})
        return user
    except Exception:
        return None

@router.post("/hscode-suggest")
async def suggest_hs_codes(
    request: HSCodeSuggestRequestAPI,
    user = Depends(get_current_user_optional)
):
    """Suggest HS codes for product classification"""
    try:
        hs_request: HSCodeSuggestRequest = {
            "title": request.title,
            "materials": request.materials,
            "use": request.use,
            "country_origin": request.country_origin
        }
        
        result = await ai_domain_service.suggest_hs_codes(hs_request)
        return result
        
    except Exception as e:
        raise HTTPException(500, f"HS code suggestion error: {str(e)}")

@router.post("/landed-cost-calculate")
async def calculate_landed_cost(
    request: LandedCostRequestAPI,
    user = Depends(get_current_user_optional)
):
    """Calculate comprehensive landed cost with duties and taxes"""
    try:
        # Convert API model to service model
        items = []
        for item in request.items:
            items.append({
                "sku": item.sku,
                "hs": item.hs,
                "value": item.value,
                "qty": item.qty,
                "uom": item.uom,
                "origin": item.origin
            })
        
        landed_cost_request: LandedCostRequest = {
            "destination_country": request.destination_country,
            "incoterm": request.incoterm,
            "items": items,
            "freight_cost": request.freight_cost,
            "insurance_cost": request.insurance_cost,
            "currency": request.currency
        }
        
        result = await ai_domain_service.calculate_landed_cost(landed_cost_request)
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Landed cost calculation error: {str(e)}")

@router.post("/freight-quote")
async def get_freight_quote(
    request: FreightQuoteRequestAPI,
    user = Depends(get_current_user_optional)
):
    """Get freight quotes and shipping estimates"""
    try:
        # Convert dimensions
        dimensions = []
        for dim in request.dimensions:
            dimensions.append({
                "l_cm": dim.l_cm,
                "w_cm": dim.w_cm,
                "h_cm": dim.h_cm,
                "qty": dim.qty
            })
        
        freight_request: FreightQuoteRequest = {
            "mode": request.mode,
            "dimensions": dimensions,
            "weight_kg": request.weight_kg,
            "origin": request.origin,
            "destination": request.destination,
            "ready_date": request.ready_date,
            "service_level": request.service_level
        }
        
        result = await ai_domain_service.get_freight_quote(freight_request)
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Freight quote error: {str(e)}")

@router.post("/compliance-screening")
async def screen_compliance(
    request: ComplianceScreeningRequestAPI,
    user = Depends(get_current_user_optional)
):
    """Screen parties for compliance and sanctions"""
    try:
        parties = []
        for party in request.parties:
            parties.append({
                "name": party.name,
                "country": party.country
            })
        
        screening_request: ComplianceScreeningRequest = {
            "parties": parties
        }
        
        result = await ai_domain_service.screen_compliance(screening_request)
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Compliance screening error: {str(e)}")

@router.post("/payment-methods-suggest")
async def suggest_payment_methods(
    request: PaymentMethodsRequestAPI,
    user = Depends(get_current_user_optional)
):
    """Suggest optimal payment methods for country/transaction"""
    try:
        payment_request: PaymentMethodsRequest = {
            "country": request.country,
            "currency": request.currency,
            "cart_total": request.cart_total
        }
        
        result = await ai_domain_service.suggest_payment_methods(payment_request)
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Payment methods suggestion error: {str(e)}")

@router.post("/tax-compute")
async def compute_tax(
    request: TaxComputeRequestAPI,
    user = Depends(get_current_user_optional)
):
    """Compute taxes based on jurisdiction and role"""
    try:
        items = []
        for item in request.items:
            items.append({
                "sku": item.sku,
                "category": item.category,
                "price": item.price
            })
        
        tax_request: TaxComputeRequest = {
            "country": request.country,
            "role": request.role,
            "items": items
        }
        
        result = await ai_domain_service.compute_tax(tax_request)
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Tax computation error: {str(e)}")

@router.post("/insights")
async def get_trade_insights(
    request: TradeInsightsRequestAPI,
    user = Depends(get_current_user_optional)
):
    """Get AI-powered trade insights for any query"""
    try:
        result = await ai_domain_service.get_trade_insights(request.query, request.context)
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Trade insights error: {str(e)}")

@router.get("/incoterms")
async def get_incoterms():
    """Get list of Incoterms 2020"""
    from ai_domain_models import INCOTERMS_2020
    return {
        "incoterms": INCOTERMS_2020,
        "version": "2020",
        "description": "International Commercial Terms defining responsibilities of buyers and sellers"
    }

@router.get("/transport-modes")
async def get_transport_modes():
    """Get available transport modes"""
    from ai_domain_models import TRANSPORT_MODES
    return {
        "modes": TRANSPORT_MODES,
        "description": "Available freight transport modes for international shipping"
    }

@router.get("/sample-hs-codes")
async def get_sample_hs_codes():
    """Get sample HS codes for reference"""
    from ai_domain_models import SAMPLE_HS_CODES
    return {
        "hs_codes": SAMPLE_HS_CODES,
        "note": "Sample HS codes for common products - use official customs databases for binding classification"
    }

@router.get("/health")
async def trade_intelligence_health():
    """Health check for AI Trade Intelligence"""
    try:
        return {
            "status": "healthy",
            "capabilities": [
                "hs_code_suggestion",
                "landed_cost_calculation", 
                "freight_quotation",
                "compliance_screening",
                "payment_methods_suggestion",
                "tax_computation",
                "trade_insights"
            ],
            "ai_model": "openai/gpt-4o-mini",
            "knowledge_domains": [
                "e_commerce", "global_trade", "customs", "logistics", 
                "payments", "taxes", "compliance", "incoterms"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }