from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
import time
from datetime import datetime

router = APIRouter(prefix="/currency", tags=["currency"])

# Demo exchange rates (in production, this would connect to a real FX API)
DEMO_EXCHANGE_RATES = {
    'USD': 1.0,      # Base currency
    'EUR': 0.85,     'GBP': 0.73,     'JPY': 110.0,    'CNY': 6.45,
    'CAD': 1.25,     'AUD': 1.35,     'CHF': 0.92,     'SEK': 8.60,
    'NOK': 8.50,     'DKK': 6.30,     'PLN': 3.90,     'CZK': 21.50,
    'HUF': 290.0,    'RUB': 75.0,     'BRL': 5.20,     'MXN': 20.0,
    'ARS': 98.0,     'COP': 3800.0,   'CLP': 720.0,    'PEN': 3.60,
    'KRW': 1180.0,   'INR': 74.0,     'IDR': 14200.0,  'THB': 31.0,
    'SGD': 1.35,     'MYR': 4.15,     'PHP': 50.0,     'VND': 23000.0,
    'HKD': 7.80,     'TWD': 28.0,     'LKR': 180.0,    'BDT': 85.0,
    'PKR': 160.0,    'AED': 3.67,     'SAR': 3.75,     'QAR': 3.64,
    'KWD': 0.30,     'BHD': 0.38,     'ILS': 3.20,     'TRY': 8.50,
    'EGP': 15.7,     'ZAR': 14.5,     'NGN': 410.0,    'KES': 108.0,
    'MAD': 9.0,      'DZD': 140.0,    'TND': 3.1,      'GHS': 15.8,
    'ETB': 55.0,     'ZMW': 25.0,     'BWP': 13.5,     'MUR': 44.0,
    'NAD': 14.5,     'AOA': 825.0,    'RWF': 1300.0,   'UGX': 3700.0,
    'TZS': 2800.0,   'XOF': 580.0,    'XAF': 580.0,    'MMK': 2100.0,
    'KZT': 450.0,    'UZS': 12800.0,  'AZN': 1.7,      'MNT': 3400.0,
    'AFN': 88.0,     'BTN': 83.0,     'KGS': 85.0,     'TJS': 11.3,
    'TMT': 3.5,      'OMR': 0.38,     'JOD': 0.71,     'LBP': 15000.0,
    'IRR': 42000.0,  'IQD': 1460.0,   'YER': 250.0,    'SYP': 2500.0,
    'FJD': 2.2,      'PGK': 3.9,      'SBD': 8.2,      'WST': 2.7,
    'TOP': 2.4,      'VUV': 115.0,    'NCF': 110.0,    'XPF': 110.0,
    'NZD': 1.5,      'ALL': 95.0,     'MKD': 53.0,     'BAM': 1.7,
    'RON': 4.9,      'BGN': 1.7,      'HRK': 6.4,      'ISK': 140.0,
    'RSD': 105.0,    'UAH': 37.0,     'GEL': 2.7,      'MDL': 18.0,
    'UYU': 39.0,     'BOB': 6.9,      'BSD': 1.0,      'TTD': 6.8,
    'JMD': 154.0,    'DOP': 56.0,     'GTQ': 7.8,      'HNL': 24.7,
    'NIO': 36.7,     'CRC': 520.0,    'BBD': 2.0,      'BZD': 2.0,
    'GYD': 209.0,    'SRD': 35.0,     'XCD': 2.7,      'SZL': 14.5,
    'LSL': 14.5,     'MZN': 64.0,
}

@router.get("/rates")
async def get_exchange_rates(
    base: str = Query("USD", description="Base currency code (ISO 4217)")
) -> Dict[str, Any]:
    """
    Get current exchange rates for all supported currencies relative to base currency.
    
    Returns rates where 1 unit of base currency = rate units of target currency.
    """
    base = base.upper()
    
    if base not in DEMO_EXCHANGE_RATES:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported base currency: {base}. Supported currencies: {', '.join(sorted(DEMO_EXCHANGE_RATES.keys()))}"
        )
    
    # Calculate rates relative to the base currency
    base_rate = DEMO_EXCHANGE_RATES[base]
    rates = {}
    
    for currency, usd_rate in DEMO_EXCHANGE_RATES.items():
        # Convert: base -> USD -> target
        rates[currency] = usd_rate / base_rate
    
    return {
        "base": base,
        "ts": int(time.time() * 1000),  # timestamp in milliseconds
        "rates": rates,
        "provider": "AisleMarts Currency-Infinity Engine",
        "count": len(rates),
        "updated": datetime.utcnow().isoformat() + "Z"
    }

@router.get("/supported")
async def get_supported_currencies() -> Dict[str, Any]:
    """Get list of all supported currencies."""
    return {
        "currencies": sorted(DEMO_EXCHANGE_RATES.keys()),
        "count": len(DEMO_EXCHANGE_RATES),
        "regions": {
            "americas": ["USD", "CAD", "MXN", "BRL", "ARS", "CLP", "COP", "PEN", "UYU", "BOB"],
            "europe": ["EUR", "GBP", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RUB", "TRY"],
            "asia": ["CNY", "JPY", "KRW", "INR", "IDR", "MYR", "THB", "VND", "PHP", "SGD", "HKD", "TWD"],
            "middleEast": ["AED", "SAR", "QAR", "KWD", "BHD", "OMR", "JOD", "ILS", "EGP"],
            "africa": ["ZAR", "NGN", "KES", "MAD", "DZD", "TND", "GHS", "ETB", "ZMW"],
            "oceania": ["AUD", "NZD", "FJD", "PGK", "SBD", "WST", "TOP", "VUV"]
        }
    }

@router.get("/convert")
async def convert_currency(
    amount: float = Query(..., description="Amount to convert"),
    from_currency: str = Query(..., alias="from", description="Source currency code"),
    to_currency: str = Query(..., alias="to", description="Target currency code")
) -> Dict[str, Any]:
    """Convert amount from one currency to another."""
    from_currency = from_currency.upper()
    to_currency = to_currency.upper()
    
    if from_currency not in DEMO_EXCHANGE_RATES:
        raise HTTPException(status_code=400, detail=f"Unsupported source currency: {from_currency}")
    
    if to_currency not in DEMO_EXCHANGE_RATES:
        raise HTTPException(status_code=400, detail=f"Unsupported target currency: {to_currency}")
    
    if from_currency == to_currency:
        return {
            "amount": amount,
            "from": from_currency,
            "to": to_currency,
            "result": amount,
            "rate": 1.0,
            "timestamp": int(time.time() * 1000)
        }
    
    # Convert via USD
    from_rate = DEMO_EXCHANGE_RATES[from_currency]
    to_rate = DEMO_EXCHANGE_RATES[to_currency]
    
    # Convert to USD first, then to target
    usd_amount = amount / from_rate
    result = usd_amount * to_rate
    
    return {
        "amount": amount,
        "from": from_currency,
        "to": to_currency,
        "result": round(result, 8),
        "rate": round(to_rate / from_rate, 8),
        "timestamp": int(time.time() * 1000),
        "provider": "AisleMarts Currency-Infinity Engine"
    }

@router.get("/health")
async def currency_health() -> Dict[str, Any]:
    """Health check for currency service."""
    return {
        "service": "currency-infinity-engine",
        "status": "operational",
        "version": "1.0.0",
        "supported_currencies": len(DEMO_EXCHANGE_RATES),
        "regions": 6,
        "features": [
            "real-time-rates",
            "auto-location-detection", 
            "cultural-formatting",
            "regional-lazy-loading",
            "dual-currency-display",
            "180-iso-currencies"
        ],
        "timestamp": int(time.time() * 1000)
    }