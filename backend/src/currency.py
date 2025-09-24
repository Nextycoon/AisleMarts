"""
Currency handling for multi-currency support (EUR/GBP/JPY) with proper rounding and FX normalization
"""

CURRENCY_DECIMALS = {
    "USD": 2, 
    "EUR": 2, 
    "GBP": 2, 
    "JPY": 0
}

def round_minor(amount: float, code: str) -> float:
    """Round amount to proper decimal places for currency"""
    decimals = CURRENCY_DECIMALS.get(code, 2)
    factor = 10 ** decimals
    return round(float(amount) * factor) / factor

def assert_supported(code: str) -> str:
    """Validate currency code and return uppercase version"""
    if not code:
        raise ValueError("Currency code is required")
    
    up_code = code.upper()
    supported = ["USD", "EUR", "GBP", "JPY"]
    
    if up_code not in supported:
        raise ValueError(f"Unsupported currency: {code}. Supported: {supported}")
    
    return up_code