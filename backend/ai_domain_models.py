from datetime import datetime
from typing import TypedDict, List, Dict, Any, Optional, Literal, Union
from decimal import Decimal

# AI Domain Specialization Models - E-commerce & Global Trade Specialist

class HSCodeSuggestion(TypedDict):
    hs: str
    desc: str
    confidence: float

class HSCodeSuggestRequest(TypedDict):
    title: str
    materials: Optional[str]
    use: Optional[str]
    country_origin: Optional[str]

class HSCodeSuggestResponse(TypedDict):
    candidates: List[HSCodeSuggestion]
    notes: List[str]

class LandedCostItem(TypedDict):
    sku: str
    hs: Optional[str]
    value: float
    qty: int
    uom: str
    origin: str

class LandedCostRequest(TypedDict):
    destination_country: str
    incoterm: str
    items: List[LandedCostItem]
    freight_cost: Optional[float]
    insurance_cost: Optional[float]
    currency: str

class LandedCostResponse(TypedDict):
    duty: float
    tax: float
    fees: float
    total_landed_cost: float
    assumptions: List[str]
    confidence: float

class FreightDimension(TypedDict):
    l_cm: float
    w_cm: float
    h_cm: float
    qty: int

class FreightQuoteRequest(TypedDict):
    mode: Literal["Air", "Sea FCL", "Sea LCL", "Road", "Courier"]
    dimensions: List[FreightDimension]
    weight_kg: float
    origin: str
    destination: str
    ready_date: Optional[str]
    service_level: Literal["speed", "balanced", "economy"]

class FreightOption(TypedDict):
    carrier: str
    eta_days: int
    cost: float
    notes: str

class FreightQuoteResponse(TypedDict):
    options: List[FreightOption]
    volumetric_weight_kg: float

class ComplianceParty(TypedDict):
    name: str
    country: str

class ComplianceHit(TypedDict):
    party: str
    list: str
    risk: Literal["low", "med", "high"]

class ComplianceScreeningRequest(TypedDict):
    parties: List[ComplianceParty]

class ComplianceScreeningResponse(TypedDict):
    hits: List[ComplianceHit]
    notes: List[str]

class PaymentMethodSuggestion(TypedDict):
    type: str
    scheme: str
    processor: str
    score: float
    notes: str

class PaymentMethodsRequest(TypedDict):
    country: str
    currency: str
    cart_total: float

class PaymentMethodsResponse(TypedDict):
    methods: List[PaymentMethodSuggestion]
    rationale: str

class TaxComputeItem(TypedDict):
    sku: str
    category: str
    price: float

class TaxComputeLine(TypedDict):
    sku: str
    rate: float
    amount: float

class TaxComputeInvoice(TypedDict):
    required_fields: List[str]

class TaxComputeRequest(TypedDict):
    country: str
    role: Literal["marketplace_facilitator", "merchant_of_record", "platform_only"]
    items: List[TaxComputeItem]

class TaxComputeResponse(TypedDict):
    total_tax: float
    lines: List[TaxComputeLine]
    invoice: TaxComputeInvoice

# Knowledge Graph Data Structures
INCOTERMS_2020 = [
    "EXW", "FCA", "CPT", "CIP", "DPU", "DAP", "DDP", 
    "FAS", "FOB", "CFR", "CIF"
]

TRANSPORT_MODES = [
    "Air", "Sea FCL", "Sea LCL", "Rail", "Road", 
    "Courier/Express", "Multimodal"
]

CUSTOMS_DOCS = [
    "CommercialInvoice", "PackingList", "HSCode", "COO", "MSDS", 
    "ExportLicense", "InsuranceCert", "BillOfLading", "AWB"
]

HAZMAT_CLASSES = [
    "None", "UN Class 1", "UN Class 2", "UN Class 3", "UN Class 4", 
    "UN Class 5", "UN Class 6", "UN Class 7", "UN Class 8", "UN Class 9"
]

PRICING_ELEMENTS = [
    "UnitPrice", "MOQ", "TieredPricing", "FX", "Freight", "Insurance", 
    "Duties", "VAT/GST/SalesTax", "Brokerage", "Surcharges", "LandedCost"
]

# Sample HS Codes with descriptions for common trade items
SAMPLE_HS_CODES = {
    # Electronics
    "8471.30": "Portable automatic data processing machines",
    "8517.12": "Telephones for cellular networks or other wireless networks",
    "8528.72": "Other colour reception apparatus for television",
    
    # Textiles
    "6109.10": "T-shirts, singlets and other vests of cotton",
    "6203.42": "Men's or boys' trousers and shorts of cotton",
    "6204.62": "Women's or girls' trousers and shorts of cotton",
    
    # Food Products
    "0801.31": "Cashew nuts, fresh or dried, in shell",
    "2008.11": "Ground-nuts, prepared or preserved",
    "0902.30": "Black fermented tea and other fermented tea",
    
    # Leather Goods
    "4202.12": "Trunks, suit-cases with outer surface of plastics or textile materials",
    "4203.29": "Gloves, mittens and mitts of other materials",
    "6403.91": "Footwear with outer soles of rubber/plastics/leather",
    
    # Home & Garden
    "9403.60": "Other wooden furniture",
    "6302.60": "Toilet linen and kitchen linen of terry towelling",
    "3926.90": "Other articles of plastics"
}

# Country-specific duty rates (simplified examples)
DUTY_RATES = {
    "US": {
        "8471.30": 0.0,    # Electronics - duty free
        "6109.10": 0.165,  # T-shirts - 16.5%
        "0801.31": 0.0,    # Nuts - duty free
        "4202.12": 0.175,  # Bags - 17.5%
        "9403.60": 0.0,    # Wooden furniture - duty free
    },
    "DE": {
        "8471.30": 0.0,    # Electronics - duty free (EU)
        "6109.10": 0.12,   # T-shirts - 12%
        "0801.31": 0.0,    # Nuts - duty free
        "4202.12": 0.17,   # Bags - 17%
        "9403.60": 0.0,    # Wooden furniture - duty free
    },
    "GB": {
        "8471.30": 0.0,    # Electronics - duty free
        "6109.10": 0.12,   # T-shirts - 12%
        "0801.31": 0.0,    # Nuts - duty free
        "4202.12": 0.17,   # Bags - 17%
        "9403.60": 0.0,    # Wooden furniture - duty free
    },
    "TR": {
        "8471.30": 0.0,    # Electronics - duty free
        "6109.10": 0.15,   # T-shirts - 15%
        "0801.31": 0.045,  # Nuts - 4.5%
        "4202.12": 0.12,   # Bags - 12%
        "9403.60": 0.03,   # Wooden furniture - 3%
    },
    "JP": {
        "8471.30": 0.0,    # Electronics - duty free
        "6109.10": 0.105,  # T-shirts - 10.5%
        "0801.31": 0.10,   # Nuts - 10%
        "4202.12": 0.16,   # Bags - 16%
        "9403.60": 0.0,    # Wooden furniture - duty free
    }
}

# VAT/GST rates by country
VAT_RATES = {
    "US": 0.0,      # No federal VAT (sales tax varies by state)
    "DE": 0.19,     # 19% VAT
    "GB": 0.20,     # 20% VAT
    "TR": 0.18,     # 18% KDV
    "JP": 0.10,     # 10% consumption tax
    "FR": 0.20,     # 20% VAT
    "IT": 0.22,     # 22% VAT
    "ES": 0.21,     # 21% VAT
    "NL": 0.21,     # 21% VAT
    "SE": 0.25,     # 25% VAT
}

# Freight cost estimates (USD per kg)
FREIGHT_COSTS = {
    "Air": {
        "short_haul": 8.50,    # <2000km
        "medium_haul": 6.20,   # 2000-5000km  
        "long_haul": 4.80,     # >5000km
    },
    "Sea FCL": {
        "short_haul": 0.15,    # Regional
        "medium_haul": 0.12,   # Inter-regional
        "long_haul": 0.08,     # Intercontinental
    },
    "Sea LCL": {
        "short_haul": 0.45,    # Regional
        "medium_haul": 0.35,   # Inter-regional  
        "long_haul": 0.25,     # Intercontinental
    },
    "Road": {
        "short_haul": 1.20,    # <500km
        "medium_haul": 0.95,   # 500-1500km
        "long_haul": 0.75,     # >1500km
    },
    "Courier": {
        "short_haul": 12.00,   # Express delivery
        "medium_haul": 18.00,  # International express
        "long_haul": 25.00,    # Worldwide express
    }
}

# Trade entities for knowledge graph
TRADE_ENTITIES = [
    "Buyer", "Seller", "Consignee", "Shipper", "FreightForwarder", 
    "CustomsBroker", "3PL", "Carrier", "Warehouse", "SKU", "HSCode", 
    "Commodity", "Shipment", "Container", "Pallet", "Parcel", "Quote", 
    "Invoice", "Country", "City"
]

# Country distance matrix (simplified - in production would use real distances)
COUNTRY_DISTANCES = {
    ("US", "CA"): 500,    # Short haul
    ("US", "MX"): 800,    # Short haul
    ("US", "DE"): 6500,   # Long haul
    ("US", "GB"): 5500,   # Long haul
    ("US", "TR"): 8500,   # Long haul
    ("US", "JP"): 10000,  # Long haul
    ("DE", "GB"): 600,    # Short haul
    ("DE", "TR"): 2200,   # Medium haul
    ("DE", "JP"): 9000,   # Long haul
    ("GB", "TR"): 2800,   # Medium haul
    ("GB", "JP"): 9500,   # Long haul
    ("TR", "JP"): 7500,   # Long haul
}

def get_distance_category(origin: str, destination: str) -> str:
    """Get distance category for freight calculation"""
    key = (origin, destination)
    reverse_key = (destination, origin)
    
    distance = COUNTRY_DISTANCES.get(key) or COUNTRY_DISTANCES.get(reverse_key, 5000)
    
    if distance < 2000:
        return "short_haul"
    elif distance < 5000:
        return "medium_haul"
    else:
        return "long_haul"

def calculate_volumetric_weight(dimensions: List[FreightDimension]) -> float:
    """Calculate volumetric weight for air freight (L×W×H in cm / 5000)"""
    total_volumetric = 0.0
    for dim in dimensions:
        volume_per_piece = (dim["l_cm"] * dim["w_cm"] * dim["h_cm"]) / 5000  # Air freight divisor
        total_volumetric += volume_per_piece * dim["qty"]
    return total_volumetric

def get_hs_suggestions(title: str, materials: str = None, use: str = None) -> List[HSCodeSuggestion]:
    """Get HS code suggestions based on product description"""
    suggestions = []
    
    title_lower = title.lower()
    materials_lower = (materials or "").lower()
    use_lower = (use or "").lower()
    
    # Electronics
    if any(word in title_lower for word in ["laptop", "computer", "tablet", "phone", "smartphone"]):
        if "phone" in title_lower or "smartphone" in title_lower:
            suggestions.append({"hs": "8517.12", "desc": "Telephones for cellular networks", "confidence": 0.95})
        else:
            suggestions.append({"hs": "8471.30", "desc": "Portable automatic data processing machines", "confidence": 0.90})
    
    # Textiles
    if any(word in title_lower for word in ["t-shirt", "shirt", "tee", "top"]):
        if "cotton" in materials_lower or "cotton" in title_lower:
            suggestions.append({"hs": "6109.10", "desc": "T-shirts, singlets and other vests of cotton", "confidence": 0.90})
    
    if any(word in title_lower for word in ["trouser", "pants", "jeans"]):
        if "cotton" in materials_lower or "cotton" in title_lower:
            suggestions.append({"hs": "6203.42", "desc": "Men's or boys' trousers and shorts of cotton", "confidence": 0.85})
    
    # Food products
    if any(word in title_lower for word in ["nuts", "cashew", "almond", "hazelnut"]):
        suggestions.append({"hs": "0801.31", "desc": "Cashew nuts, fresh or dried, in shell", "confidence": 0.85})
    
    if any(word in title_lower for word in ["tea", "coffee"]):
        if "tea" in title_lower:
            suggestions.append({"hs": "0902.30", "desc": "Black fermented tea and other fermented tea", "confidence": 0.90})
    
    # Leather goods
    if any(word in title_lower for word in ["bag", "case", "suitcase", "backpack"]):
        suggestions.append({"hs": "4202.12", "desc": "Trunks, suit-cases with outer surface of plastics or textile materials", "confidence": 0.80})
    
    if any(word in title_lower for word in ["shoe", "boot", "footwear"]):
        if "leather" in materials_lower or "leather" in title_lower:
            suggestions.append({"hs": "6403.91", "desc": "Footwear with outer soles of rubber/plastics/leather", "confidence": 0.85})
    
    # Home & Garden
    if any(word in title_lower for word in ["furniture", "table", "chair", "desk"]):
        if "wood" in materials_lower or "wooden" in title_lower:
            suggestions.append({"hs": "9403.60", "desc": "Other wooden furniture", "confidence": 0.80})
    
    if any(word in title_lower for word in ["towel", "towels"]):
        if "terry" in title_lower or "bath" in title_lower:
            suggestions.append({"hs": "6302.60", "desc": "Toilet linen and kitchen linen of terry towelling", "confidence": 0.85})
    
    # Default fallback
    if not suggestions:
        suggestions.append({"hs": "3926.90", "desc": "Other articles of plastics", "confidence": 0.50})
    
    return suggestions

def calculate_landed_cost(
    destination_country: str,
    items: List[LandedCostItem],
    freight_cost: float = 0.0,
    insurance_cost: float = 0.0
) -> LandedCostResponse:
    """Calculate landed cost including duties, taxes, and fees"""
    
    total_value = sum(item["value"] * item["qty"] for item in items)
    total_duty = 0.0
    total_tax = 0.0
    assumptions = []
    
    # Calculate duties
    duty_rates = DUTY_RATES.get(destination_country, {})
    for item in items:
        hs_code = item.get("hs", "9999.99")  # Unknown HS code
        duty_rate = duty_rates.get(hs_code, 0.05)  # Default 5% if unknown
        item_value = item["value"] * item["qty"]
        item_duty = item_value * duty_rate
        total_duty += item_duty
        
        if hs_code == "9999.99":
            assumptions.append(f"Used default 5% duty rate for {item['sku']} (HS code not specified)")
    
    # Calculate VAT/GST on (value + duty + freight + insurance)
    taxable_value = total_value + total_duty + freight_cost + insurance_cost
    vat_rate = VAT_RATES.get(destination_country, 0.0)
    total_tax = taxable_value * vat_rate
    
    # Estimate handling fees (simplified)
    fees = max(25.0, total_value * 0.005)  # Min $25 or 0.5% of value
    
    # Total landed cost
    total_landed_cost = total_value + total_duty + total_tax + fees + freight_cost + insurance_cost
    
    # Add assumptions
    if freight_cost == 0:
        assumptions.append("Freight cost not included - add actual shipping costs")
    if insurance_cost == 0:
        assumptions.append("Insurance cost not included - consider cargo insurance")
    
    assumptions.append(f"VAT/GST rate: {vat_rate*100:.1f}% for {destination_country}")
    assumptions.append("Estimates only - confirm with customs broker for binding rates")
    
    return {
        "duty": total_duty,
        "tax": total_tax,
        "fees": fees,
        "total_landed_cost": total_landed_cost,
        "assumptions": assumptions,
        "confidence": 0.80 if all(item.get("hs") for item in items) else 0.60
    }