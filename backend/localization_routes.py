"""
AisleMarts Localization API Routes
Provides endpoints for auto-localization, currency conversion, and regional customization
"""

from fastapi import APIRouter, Request, HTTPException, Depends
from typing import Dict, Optional, List
from pydantic import BaseModel
import logging
from localization_service import localization_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/localization", tags=["Localization"])

# Request/Response Models
class CurrencyConversionRequest(BaseModel):
    amount: float
    from_currency: str
    to_currency: str

class CurrencyConversionResponse(BaseModel):
    amount: float
    currency: str
    symbol: str
    formatted: str
    conversion_rate: float
    original_amount: Optional[float] = None
    original_currency: Optional[str] = None

class LocalizationResponse(BaseModel):
    country_code: str
    country_name: str
    currency: str
    currency_symbol: str
    currency_name: str
    language: str
    city: Optional[str] = None
    region: Optional[str] = None
    ip: str

class SupportedCountriesResponse(BaseModel):
    countries: Dict[str, Dict]

@router.get("/detect", response_model=LocalizationResponse)
async def detect_user_localization(request: Request):
    """
    Auto-detect user's location, currency, and language preferences
    Based on IP geolocation
    """
    try:
        localization_data = await localization_service.detect_user_location(request)
        
        logger.info(f"Localization detected for IP {localization_data['ip']}: "
                   f"{localization_data['country_code']} - {localization_data['currency']}")
        
        return LocalizationResponse(**localization_data)
    
    except Exception as e:
        logger.error(f"Error in localization detection: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to detect user localization")

@router.post("/convert-currency", response_model=CurrencyConversionResponse)
async def convert_currency(conversion_request: CurrencyConversionRequest):
    """
    Convert price from one currency to another
    Uses real-time exchange rates with caching
    """
    try:
        conversion_result = await localization_service.convert_price(
            price=conversion_request.amount,
            from_currency=conversion_request.from_currency,
            to_currency=conversion_request.to_currency
        )
        
        logger.info(f"Currency conversion: {conversion_request.amount} "
                   f"{conversion_request.from_currency} -> "
                   f"{conversion_result['amount']} {conversion_request.to_currency}")
        
        return CurrencyConversionResponse(**conversion_result)
    
    except Exception as e:
        logger.error(f"Error in currency conversion: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to convert currency")

@router.get("/exchange-rate/{from_currency}/{to_currency}")
async def get_exchange_rate(from_currency: str, to_currency: str):
    """
    Get current exchange rate between two currencies
    """
    try:
        rate = await localization_service.get_currency_conversion_rate(
            from_currency.upper(), 
            to_currency.upper()
        )
        
        return {
            "from_currency": from_currency.upper(),
            "to_currency": to_currency.upper(),
            "rate": rate,
            "formatted_rate": f"1 {from_currency.upper()} = {rate:.4f} {to_currency.upper()}"
        }
    
    except Exception as e:
        logger.error(f"Error getting exchange rate: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get exchange rate")

@router.get("/supported-countries", response_model=SupportedCountriesResponse)
async def get_supported_countries():
    """
    Get list of all countries supported by AisleMarts
    With their currency and language information
    """
    try:
        countries = localization_service.get_supported_countries()
        
        return SupportedCountriesResponse(countries=countries)
    
    except Exception as e:
        logger.error(f"Error getting supported countries: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get supported countries")

@router.get("/greeting/{country_code}")
async def get_localized_greeting(country_code: str, language: str = "en"):
    """
    Get localized greeting message for Aisle AI
    Based on country and language preferences
    """
    try:
        greeting = await localization_service.get_localized_greeting(
            country_code.upper(), 
            language.lower()
        )
        
        return {
            "country_code": country_code.upper(),
            "language": language.lower(),
            "greeting": greeting
        }
    
    except Exception as e:
        logger.error(f"Error getting localized greeting: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get localized greeting")

@router.get("/currency-info/{currency_code}")
async def get_currency_info(currency_code: str):
    """
    Get detailed information about a specific currency
    """
    try:
        currency_info = localization_service.get_currency_info(currency_code.upper())
        
        return {
            "currency_code": currency_code.upper(),
            **currency_info
        }
    
    except Exception as e:
        logger.error(f"Error getting currency info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get currency information")

@router.get("/health")
async def localization_health_check():
    """
    Health check endpoint for localization service
    """
    try:
        # Test basic functionality
        test_countries = localization_service.get_supported_countries()
        
        return {
            "status": "healthy",
            "service": "localization",
            "supported_countries_count": len(test_countries),
            "features": [
                "auto_location_detection",
                "currency_conversion",
                "multi_language_support",
                "localized_greetings"
            ]
        }
    
    except Exception as e:
        logger.error(f"Localization health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "service": "localization",
            "error": str(e)
        }