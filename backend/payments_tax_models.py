from datetime import datetime
from typing import TypedDict, List, Dict, Any, Optional, Literal
from decimal import Decimal

# Payment Methods Models
class PaymentMethodDoc(TypedDict):
    _id: str
    type: Literal["card", "wallet", "bank_transfer", "crypto", "bnpl", "local"]
    scheme: str  # visa, mastercard, paypal, alipay, etc.
    processor: str  # stripe, iyzico, paytr, adyen, etc.
    name: str
    display_name: str
    icon_url: str
    supported_countries: List[str]
    supported_currencies: List[str]
    min_amount: float
    max_amount: float
    processing_fee_percent: float
    processing_fee_fixed: float
    settlement_days: int
    popularity_score: float  # 0-100
    security_score: float  # 0-100
    mobile_optimized: bool
    b2b_supported: bool
    b2c_supported: bool
    recurring_supported: bool
    refund_supported: bool
    active: bool
    created_at: datetime

class PaymentRecommendationDoc(TypedDict):
    _id: str
    country_code: str
    currency: str
    amount_range_min: float
    amount_range_max: float
    user_type: Literal["B2B", "B2C", "guest"]
    recommended_methods: List[Dict[str, Any]]  # method_id, score, reasons
    last_updated: datetime
    ai_generated: bool

# Tax Models
class TaxRuleDoc(TypedDict):
    _id: str
    country_code: str
    region: str | None  # State/Province
    tax_type: Literal["VAT", "GST", "sales_tax", "service_tax", "customs_duty"]
    product_categories: List[str]  # electronics, clothing, food, etc.
    rate: float  # Tax rate as decimal (0.20 for 20%)
    threshold_amount: float | None  # Minimum amount for tax application
    b2b_rate: float | None  # Different rate for B2B transactions
    b2c_rate: float | None  # Different rate for B2C transactions
    exemptions: List[str]  # Product categories or conditions for exemption
    effective_date: datetime
    expiry_date: datetime | None
    active: bool

class TaxCalculationDoc(TypedDict):
    _id: str
    order_id: str | None
    country_code: str
    region: str | None
    items: List[Dict[str, Any]]  # sku, category, price, quantity
    role: Literal["B2B", "B2C"]
    subtotal: float
    total_tax: float
    tax_lines: List[Dict[str, Any]]  # sku, rate, amount, tax_type
    invoice_requirements: Dict[str, Any]
    calculated_at: datetime
    expires_at: datetime

class ComplianceRequirementDoc(TypedDict):
    _id: str
    country_code: str
    requirement_type: Literal["invoice", "receipt", "tax_certificate", "customs_declaration"]
    required_fields: List[str]
    business_types: List[str]  # B2B, B2C, export, import
    mandatory: bool
    template_url: str | None
    regulations: List[str]  # Legal references
    penalties: Dict[str, Any]  # Non-compliance penalties
    last_updated: datetime

# Currency and Exchange Models
class CurrencyDoc(TypedDict):
    _id: str
    code: str  # USD, EUR, GBP, TRY, etc.
    name: str
    symbol: str
    decimal_places: int
    countries: List[str]  # Countries using this currency
    is_crypto: bool
    exchange_rate_usd: float  # Current rate to USD
    volatility_score: float  # 0-100, higher = more volatile
    payment_popularity: float  # 0-100, popularity for online payments
    active: bool
    last_updated: datetime

class ExchangeRateDoc(TypedDict):
    _id: str
    base_currency: str
    quote_currency: str
    rate: float
    source: str  # ECB, OpenExchangeRates, etc.
    timestamp: datetime
    bid: float | None
    ask: float | None
    mid: float | None

# Fraud Detection Models
class FraudRuleDoc(TypedDict):
    _id: str
    rule_type: Literal["country_risk", "amount_threshold", "velocity", "device_fingerprint", "geo_mismatch"]
    country_codes: List[str] | None
    risk_score_threshold: float  # 0-100
    action: Literal["allow", "review", "block", "require_verification"]
    conditions: Dict[str, Any]
    active: bool
    created_at: datetime

# Sample Payment Methods Data
PAYMENT_METHODS_SAMPLE = [
    {
        "_id": "stripe_card_global",
        "type": "card",
        "scheme": "visa_mastercard",
        "processor": "stripe",
        "name": "Credit/Debit Card",
        "display_name": "Credit or Debit Card",
        "icon_url": "https://cdn.stripe.com/icons/card.svg",
        "supported_countries": ["US", "GB", "EU", "CA", "AU", "JP", "SG"],
        "supported_currencies": ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "SGD"],
        "min_amount": 0.5,
        "max_amount": 999999.0,
        "processing_fee_percent": 0.029,
        "processing_fee_fixed": 0.30,
        "settlement_days": 2,
        "popularity_score": 95.0,
        "security_score": 98.0,
        "mobile_optimized": True,
        "b2b_supported": True,
        "b2c_supported": True,
        "recurring_supported": True,
        "refund_supported": True,
        "active": True
    },
    {
        "_id": "iyzico_card_tr",
        "type": "card",
        "scheme": "troy_visa_mastercard",
        "processor": "iyzico",
        "name": "İyzico Card Payment",
        "display_name": "Kredi/Banka Kartı (İyzico)",
        "icon_url": "https://www.iyzico.com/assets/images/logo.svg",
        "supported_countries": ["TR"],
        "supported_currencies": ["TRY", "USD", "EUR"],
        "min_amount": 1.0,
        "max_amount": 50000.0,
        "processing_fee_percent": 0.035,
        "processing_fee_fixed": 0.0,
        "settlement_days": 1,
        "popularity_score": 88.0,
        "security_score": 92.0,
        "mobile_optimized": True,
        "b2b_supported": True,
        "b2c_supported": True,
        "recurring_supported": True,
        "refund_supported": True,
        "active": True
    },
    {
        "_id": "paypal_global",
        "type": "wallet",
        "scheme": "paypal",
        "processor": "paypal",
        "name": "PayPal",
        "display_name": "PayPal",
        "icon_url": "https://www.paypalobjects.com/webstatic/icon/pp258.png",
        "supported_countries": ["US", "GB", "DE", "FR", "ES", "IT", "CA", "AU"],
        "supported_currencies": ["USD", "EUR", "GBP", "CAD", "AUD"],
        "min_amount": 1.0,
        "max_amount": 10000.0,
        "processing_fee_percent": 0.034,
        "processing_fee_fixed": 0.49,
        "settlement_days": 1,
        "popularity_score": 85.0,
        "security_score": 95.0,
        "mobile_optimized": True,
        "b2b_supported": True,
        "b2c_supported": True,
        "recurring_supported": True,
        "refund_supported": True,
        "active": True
    },
    {
        "_id": "alipay_cn",
        "type": "wallet",
        "scheme": "alipay",
        "processor": "ant_financial",
        "name": "Alipay",
        "display_name": "支付宝 (Alipay)",
        "icon_url": "https://gw.alipayobjects.com/mdn/rms_f386c9/afts/img/A*EtgwQYs0PXwAAAAAAAAAAAAAARQnAQ",
        "supported_countries": ["CN", "HK", "SG", "MY"],
        "supported_currencies": ["CNY", "USD", "HKD", "SGD", "MYR"],
        "min_amount": 1.0,
        "max_amount": 50000.0,
        "processing_fee_percent": 0.025,
        "processing_fee_fixed": 0.0,
        "settlement_days": 1,
        "popularity_score": 98.0,
        "security_score": 96.0,
        "mobile_optimized": True,
        "b2b_supported": False,
        "b2c_supported": True,
        "recurring_supported": False,
        "refund_supported": True,
        "active": True
    },
    {
        "_id": "klarna_bnpl_eu",
        "type": "bnpl",
        "scheme": "klarna",
        "processor": "klarna",
        "name": "Klarna Pay Later",
        "display_name": "Pay in 4 with Klarna",
        "icon_url": "https://cdn.klarna.com/1.0/shared/image/generic/logo/en_us/basic/pink-black.svg",
        "supported_countries": ["US", "GB", "DE", "SE", "NO", "DK", "FI"],
        "supported_currencies": ["USD", "EUR", "GBP", "SEK", "NOK", "DKK"],
        "min_amount": 10.0,
        "max_amount": 3000.0,
        "processing_fee_percent": 0.058,
        "processing_fee_fixed": 0.0,
        "settlement_days": 30,
        "popularity_score": 75.0,
        "security_score": 88.0,
        "mobile_optimized": True,
        "b2b_supported": False,
        "b2c_supported": True,
        "recurring_supported": False,
        "refund_supported": True,
        "active": True
    }
]

# Sample Tax Rules Data
TAX_RULES_SAMPLE = [
    {
        "_id": "us_sales_tax_general",
        "country_code": "US",
        "region": None,
        "tax_type": "sales_tax",
        "product_categories": ["electronics", "clothing", "home_garden", "sports"],
        "rate": 0.0825,  # Average US sales tax
        "threshold_amount": 0.0,
        "b2b_rate": 0.0,  # B2B often exempt
        "b2c_rate": 0.0825,
        "exemptions": ["food", "medicine"],
        "effective_date": datetime(2024, 1, 1),
        "expiry_date": None,
        "active": True
    },
    {
        "_id": "gb_vat_standard",
        "country_code": "GB",
        "region": None,
        "tax_type": "VAT",
        "product_categories": ["electronics", "clothing", "home_garden", "sports", "books"],
        "rate": 0.20,  # UK VAT
        "threshold_amount": 0.0,
        "b2b_rate": 0.0,  # VAT reverse charge for B2B
        "b2c_rate": 0.20,
        "exemptions": ["food", "children_clothing", "books"],
        "effective_date": datetime(2024, 1, 1),
        "expiry_date": None,
        "active": True
    },
    {
        "_id": "tr_kdv_standard",
        "country_code": "TR",
        "region": None,
        "tax_type": "VAT",
        "product_categories": ["electronics", "clothing", "home_garden"],
        "rate": 0.20,  # Turkey KDV (VAT)  
        "threshold_amount": 0.0,
        "b2b_rate": 0.20,
        "b2c_rate": 0.20,
        "exemptions": ["basic_food", "medicine", "education"],
        "effective_date": datetime(2024, 1, 1),
        "expiry_date": None,
        "active": True
    },
    {
        "_id": "de_vat_standard",
        "country_code": "DE",
        "region": None,
        "tax_type": "VAT",
        "product_categories": ["electronics", "clothing", "home_garden", "sports"],
        "rate": 0.19,  # Germany VAT
        "threshold_amount": 0.0,
        "b2b_rate": 0.0,  # B2B reverse charge
        "b2c_rate": 0.19,
        "exemptions": ["food", "books", "medicine"],
        "effective_date": datetime(2024, 1, 1),
        "expiry_date": None,
        "active": True
    },
    {
        "_id": "jp_consumption_tax",
        "country_code": "JP",
        "region": None,
        "tax_type": "consumption_tax",
        "product_categories": ["electronics", "clothing", "home_garden", "sports", "food"],
        "rate": 0.10,  # Japan consumption tax
        "threshold_amount": 0.0,
        "b2b_rate": 0.10,
        "b2c_rate": 0.10,
        "exemptions": ["medicine", "education"],
        "effective_date": datetime(2024, 1, 1),
        "expiry_date": None,
        "active": True
    }
]

# Sample Currency Data
CURRENCIES_SAMPLE = [
    {
        "_id": "USD",
        "code": "USD",
        "name": "US Dollar",
        "symbol": "$",
        "decimal_places": 2,
        "countries": ["US"],
        "is_crypto": False,
        "exchange_rate_usd": 1.0,
        "volatility_score": 15.0,
        "payment_popularity": 100.0,
        "active": True
    },
    {
        "_id": "EUR",
        "code": "EUR",
        "name": "Euro",
        "symbol": "€",
        "decimal_places": 2,
        "countries": ["DE", "FR", "ES", "IT", "AT", "BE", "NL"],
        "is_crypto": False,
        "exchange_rate_usd": 1.08,
        "volatility_score": 18.0,
        "payment_popularity": 95.0,
        "active": True
    },
    {
        "_id": "GBP",
        "code": "GBP",
        "name": "British Pound",
        "symbol": "£",
        "decimal_places": 2,
        "countries": ["GB"],
        "is_crypto": False,
        "exchange_rate_usd": 1.25,
        "volatility_score": 22.0,
        "payment_popularity": 88.0,
        "active": True
    },
    {
        "_id": "TRY",
        "code": "TRY",
        "name": "Turkish Lira",
        "symbol": "₺",
        "decimal_places": 2,
        "countries": ["TR"],
        "is_crypto": False,
        "exchange_rate_usd": 0.034,
        "volatility_score": 75.0,
        "payment_popularity": 65.0,
        "active": True
    },
    {
        "_id": "JPY",
        "code": "JPY", 
        "name": "Japanese Yen",
        "symbol": "¥",
        "decimal_places": 0,
        "countries": ["JP"],
        "is_crypto": False,
        "exchange_rate_usd": 0.0067,
        "volatility_score": 20.0,
        "payment_popularity": 90.0,
        "active": True
    }
]

# Risk scoring data by country
COUNTRY_RISK_SCORES = {
    "US": 10,   # Very low risk
    "GB": 12,   # Very low risk  
    "DE": 8,    # Very low risk
    "FR": 10,   # Very low risk
    "CA": 9,    # Very low risk
    "AU": 11,   # Very low risk
    "JP": 7,    # Very low risk
    "SG": 13,   # Low risk
    "TR": 35,   # Medium risk
    "BR": 42,   # Medium risk
    "IN": 38,   # Medium risk
    "CN": 25,   # Low-medium risk
    "RU": 78,   # High risk (geopolitical)
    "VE": 85,   # Very high risk
    "AF": 95,   # Extremely high risk
}