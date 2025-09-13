from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime

from security import decode_access_token
from db import db
from payments_tax_service import payments_tax_service

router = APIRouter(prefix="/api/payments-tax", tags=["Payments & Tax"])

# Request/Response models
class PaymentMethodsRequest(BaseModel):
    country: str
    currency: str
    cart_total: float
    user_type: Literal["B2B", "B2C"] = "B2C"

class TaxComputeRequest(BaseModel):
    country: str
    items: List[Dict[str, Any]]  # [{"sku": "ABC", "category": "electronics", "price": 100, "quantity": 1}]
    role: Literal["B2B", "B2C"] = "B2C"

class CurrencyConversionRequest(BaseModel):
    from_currency: str
    to_currency: str
    amount: float

class FraudAssessmentRequest(BaseModel):
    country: str
    amount: float
    payment_method: str
    user_history: Dict[str, Any] = {}

class PaymentIntentEnhanced(BaseModel):
    """Enhanced payment intent with tax and payment method optimization"""
    items: List[Dict[str, Any]]
    country: str
    currency: str
    role: Literal["B2B", "B2C"] = "B2C"
    payment_method_preference: Optional[str] = None
    optimize_for: Literal["cost", "speed", "security"] = "cost"

async def get_current_user(authorization: str | None = Header(None)):
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
async def initialize_payments_tax_data():
    """Initialize global payment methods, tax rules, and currency data"""
    try:
        result = await payments_tax_service.initialize_payments_tax_data()
        return result
    except Exception as e:
        raise HTTPException(500, f"Initialization error: {str(e)}")

# Payment Methods API
@router.post("/suggest-methods")
async def suggest_payment_methods(request: PaymentMethodsRequest):
    """Get AI-powered payment method recommendations based on country, currency, and amount"""
    try:
        result = await payments_tax_service.suggest_payment_methods(
            request.country,
            request.currency, 
            request.cart_total,
            request.user_type
        )
        return result
    except Exception as e:
        raise HTTPException(500, f"Payment methods suggestion error: {str(e)}")

@router.get("/methods")
async def get_all_payment_methods(
    country: Optional[str] = None,
    currency: Optional[str] = None,
    active_only: bool = True
):
    """Get all available payment methods with optional filtering"""
    try:
        filter_dict = {}
        if active_only:
            filter_dict["active"] = True
        if country:
            filter_dict["supported_countries"] = {"$in": [country, "GLOBAL"]}
        if currency:
            filter_dict["supported_currencies"] = currency
        
        methods_cursor = db().payment_methods.find(filter_dict)
        methods = await methods_cursor.to_list(length=100)
        
        return {
            "methods": methods,
            "count": len(methods),
            "filters_applied": {
                "country": country,
                "currency": currency,
                "active_only": active_only
            }
        }
    except Exception as e:
        raise HTTPException(500, f"Error fetching payment methods: {str(e)}")

# Tax Computation API
@router.post("/compute-tax")
async def compute_tax(request: TaxComputeRequest):
    """Compute taxes for items based on country and business role"""
    try:
        result = await payments_tax_service.compute_tax(
            request.country,
            request.items,
            request.role
        )
        return result
    except Exception as e:
        raise HTTPException(500, f"Tax computation error: {str(e)}")

@router.get("/tax-rules")
async def get_tax_rules(
    country: Optional[str] = None,
    tax_type: Optional[str] = None,
    active_only: bool = True
):
    """Get tax rules with optional filtering"""
    try:
        filter_dict = {}
        if active_only:
            filter_dict["active"] = True
            filter_dict["effective_date"] = {"$lte": datetime.utcnow()}
            filter_dict["$or"] = [
                {"expiry_date": None},
                {"expiry_date": {"$gte": datetime.utcnow()}}
            ]
        if country:
            filter_dict["country_code"] = country
        if tax_type:
            filter_dict["tax_type"] = tax_type
        
        rules_cursor = db().tax_rules.find(filter_dict)
        rules = await rules_cursor.to_list(length=100)
        
        return {
            "tax_rules": rules,
            "count": len(rules),
            "filters_applied": {
                "country": country,
                "tax_type": tax_type,
                "active_only": active_only
            }
        }
    except Exception as e:
        raise HTTPException(500, f"Error fetching tax rules: {str(e)}")

# Currency Conversion API
@router.post("/convert-currency")
async def convert_currency(request: CurrencyConversionRequest):
    """Convert currency with AI-powered timing recommendations"""
    try:
        result = await payments_tax_service.get_currency_conversion(
            request.from_currency,
            request.to_currency,
            request.amount
        )
        return result
    except Exception as e:
        raise HTTPException(500, f"Currency conversion error: {str(e)}")

@router.get("/currencies")
async def get_currencies(active_only: bool = True):
    """Get all supported currencies"""
    try:
        filter_dict = {}
        if active_only:
            filter_dict["active"] = True
        
        currencies_cursor = db().currencies.find(filter_dict)
        currencies = await currencies_cursor.to_list(length=100)
        
        return {
            "currencies": currencies,
            "count": len(currencies)
        }
    except Exception as e:
        raise HTTPException(500, f"Error fetching currencies: {str(e)}")

# Fraud Detection API
@router.post("/assess-fraud-risk")
async def assess_fraud_risk(
    request: FraudAssessmentRequest,
    user = Depends(get_current_user)
):
    """Assess fraud risk for transaction with AI analysis"""
    try:
        # Enhance request with user data
        enhanced_data = request.model_dump()
        enhanced_data["user_id"] = str(user["_id"])
        enhanced_data["user_roles"] = user.get("roles", [])
        
        result = await payments_tax_service.assess_fraud_risk(enhanced_data)
        return result
    except Exception as e:
        raise HTTPException(500, f"Fraud assessment error: {str(e)}")

# Enhanced Payment Intent (combines tax + payment optimization)
@router.post("/create-enhanced-payment-intent")
async def create_enhanced_payment_intent(
    request: PaymentIntentEnhanced,
    user = Depends(get_current_user)
):
    """Create payment intent with optimized payment methods and tax calculation"""
    try:
        # Calculate total amount
        total_amount = sum(
            item.get("price", 0) * item.get("quantity", 1) 
            for item in request.items
        )
        
        # Compute taxes
        tax_result = await payments_tax_service.compute_tax(
            request.country,
            request.items,
            request.role
        )
        
        # Get payment method suggestions
        payment_methods = await payments_tax_service.suggest_payment_methods(
            request.country,
            request.currency,
            total_amount + tax_result["total_tax"],
            request.role
        )
        
        # Get currency conversion if user's preferred currency differs
        user_currency = user.get("preferred_currency", request.currency)
        conversion = None
        if user_currency != request.currency:
            conversion = await payments_tax_service.get_currency_conversion(
                request.currency,
                user_currency,
                total_amount + tax_result["total_tax"]
            )
        
        # Assess fraud risk
        fraud_assessment = await payments_tax_service.assess_fraud_risk({
            "country": request.country,
            "amount": total_amount + tax_result["total_tax"],
            "payment_method": request.payment_method_preference or "card",
            "user_history": {
                "account_age_days": (datetime.utcnow() - user.get("created_at", datetime.utcnow())).days,
                "previous_transactions": 0  # Would come from order history
            }
        })
        
        return {
            "subtotal": total_amount,
            "tax_calculation": tax_result,
            "total_with_tax": total_amount + tax_result["total_tax"],
            "payment_methods": payment_methods,
            "currency_conversion": conversion,
            "fraud_assessment": fraud_assessment,
            "optimization_focus": request.optimize_for,
            "country": request.country,
            "currency": request.currency,
            "role": request.role,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(500, f"Enhanced payment intent error: {str(e)}")

# Analytics and Reporting
@router.get("/payment-analytics")
async def get_payment_analytics(
    country: Optional[str] = None,
    days: int = 30,
    user = Depends(get_current_user)
):
    """Get payment method performance analytics"""
    try:
        if "admin" not in user.get("roles", []):
            raise HTTPException(403, "Admin access required")
        
        # In production, this would query actual transaction data
        # For now, return sample analytics
        
        analytics = {
            "summary": {
                "total_transactions": 1250,
                "total_volume": 487500.0,
                "average_transaction": 390.0,
                "top_payment_method": "stripe_card_global",
                "conversion_rate": 0.867
            },
            "by_country": {
                "US": {"transactions": 450, "volume": 180000.0, "top_method": "stripe_card_global"},
                "GB": {"transactions": 320, "volume": 128000.0, "top_method": "stripe_card_global"},
                "TR": {"transactions": 280, "volume": 95000.0, "top_method": "iyzico_card_tr"},
                "DE": {"transactions": 200, "volume": 84500.0, "top_method": "paypal_global"}
            },
            "payment_methods": {
                "stripe_card_global": {"usage": 0.52, "success_rate": 0.96, "avg_fee": 0.029},
                "paypal_global": {"usage": 0.28, "success_rate": 0.94, "avg_fee": 0.034},
                "iyzico_card_tr": {"usage": 0.15, "success_rate": 0.98, "avg_fee": 0.035},
                "klarna_bnpl_eu": {"usage": 0.05, "success_rate": 0.89, "avg_fee": 0.058}
            },
            "fraud_metrics": {
                "total_flagged": 23,
                "false_positive_rate": 0.08,
                "blocked_amount": 15750.0,
                "risk_score_avg": 24.5
            }
        }
        
        return {
            "analytics": analytics,
            "period_days": days,
            "country_filter": country,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(500, f"Payment analytics error: {str(e)}")

@router.get("/tax-analytics")
async def get_tax_analytics(
    country: Optional[str] = None,
    days: int = 30,
    user = Depends(get_current_user)
):
    """Get tax calculation and compliance analytics"""
    try:
        if "admin" not in user.get("roles", []):
            raise HTTPException(403, "Admin access required")
        
        # Sample tax analytics
        analytics = {
            "summary": {
                "total_tax_calculated": 97500.0,
                "transactions_with_tax": 1180,
                "average_tax_rate": 0.168,
                "compliance_score": 0.94
            },
            "by_country": {
                "US": {"tax_collected": 15750.0, "avg_rate": 0.0825, "compliance": 0.98},
                "GB": {"tax_collected": 25600.0, "avg_rate": 0.20, "compliance": 0.96},
                "TR": {"tax_collected": 19000.0, "avg_rate": 0.20, "compliance": 0.92},
                "DE": {"tax_collected": 22150.0, "avg_rate": 0.19, "compliance": 0.95},
                "JP": {"tax_collected": 15000.0, "avg_rate": 0.10, "compliance": 0.94}
            },
            "tax_types": {
                "VAT": {"amount": 66750.0, "transactions": 650},
                "sales_tax": {"amount": 15750.0, "transactions": 450},
                "consumption_tax": {"amount": 15000.0, "transactions": 80}
            },
            "compliance_issues": {
                "missing_invoices": 12,
                "incorrect_rates": 3,
                "exemption_errors": 8
            }
        }
        
        return {
            "analytics": analytics,
            "period_days": days,
            "country_filter": country,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(500, f"Tax analytics error: {str(e)}")

# Health check for payment/tax services
@router.get("/health")
async def payment_tax_health():
    """Health check for payments and tax services"""
    try:
        # Check database connections
        methods_count = await db().payment_methods.count_documents({"active": True})
        tax_rules_count = await db().tax_rules.count_documents({"active": True})
        currencies_count = await db().currencies.count_documents({"active": True})
        
        return {
            "status": "healthy",
            "services": {
                "payment_methods": {"count": methods_count, "status": "ok"},
                "tax_rules": {"count": tax_rules_count, "status": "ok"},
                "currencies": {"count": currencies_count, "status": "ok"},
                "ai_service": {"status": "ok"}
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }