"""
RFQ Data Validation - Production-ready server-side validation
Prevents malicious data, ensures data integrity, enforces business rules
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, validator, Field
from datetime import datetime, timedelta
from fastapi import HTTPException, status
import re

class RFQValidationError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"RFQ Validation Error: {detail}"
        )

class RFQSpecifications(BaseModel):
    material: Optional[str] = Field(None, max_length=500)
    dimensions: Optional[str] = Field(None, max_length=200)
    color: Optional[str] = Field(None, max_length=200)
    certifications: Optional[List[str]] = Field(None, max_items=20)
    customization: Optional[str] = Field(None, max_length=1000)
    packaging: Optional[str] = Field(None, max_length=500)
    delivery_terms: Optional[str] = Field(None, max_length=300)
    payment_terms: Optional[str] = Field(None, max_length=300)
    sample_required: Optional[bool] = False
    
    @validator('material', 'customization', 'packaging')
    def validate_text_fields(cls, v):
        if v and len(v.strip()) == 0:
            return None
        return v.strip() if v else None
    
    @validator('certifications')
    def validate_certifications(cls, v):
        if not v:
            return []
        
        allowed_certs = {
            'ISO9001', 'ISO14001', 'CE', 'FDA', 'FCC', 'RoHS', 'REACH', 
            'CPSC', 'UL', 'ETL', 'ANSI', 'ASTM', 'OEKO-TEX', 'GOTS'
        }
        
        validated_certs = []
        for cert in v:
            cert = cert.strip().upper()
            if cert in allowed_certs:
                validated_certs.append(cert)
            elif len(cert) > 0:  # Allow custom certifications but validate format
                if not re.match(r'^[A-Z0-9\-_]{2,20}$', cert):
                    raise RFQValidationError(f"Invalid certification format: {cert}")
                validated_certs.append(cert)
        
        return validated_certs

class RFQCreateValidated(BaseModel):
    title: str = Field(..., min_length=10, max_length=200)
    category: str = Field(..., min_length=1, max_length=50)
    description: str = Field(..., min_length=50, max_length=5000)
    specifications: RFQSpecifications = Field(default_factory=RFQSpecifications)
    quantity: int = Field(..., ge=1, le=1000000)  # Min 1, Max 1M units
    target_price: Optional[float] = Field(None, ge=0.01, le=1000000.0)
    currency: str = Field(default="USD", max_length=3)
    deadline: Optional[datetime] = None
    shipping_destination: str = Field(..., min_length=5, max_length=200)
    attachments: Optional[List[str]] = Field(default_factory=list, max_items=10)
    
    @validator('title')
    def validate_title(cls, v):
        v = v.strip()
        if not v:
            raise RFQValidationError("Title cannot be empty")
        
        # Check for spam patterns
        spam_patterns = ['free money', 'click here', 'buy now', '!!!', '???']
        v_lower = v.lower()
        for pattern in spam_patterns:
            if pattern in v_lower:
                raise RFQValidationError(f"Title contains prohibited content: {pattern}")
        
        return v
    
    @validator('category')
    def validate_category(cls, v):
        allowed_categories = {
            'electronics', 'fashion', 'home_garden', 'machinery', 
            'chemicals', 'textiles', 'automotive', 'packaging',
            'medical', 'sports', 'toys', 'food', 'industrial'
        }
        
        if v.lower() not in allowed_categories:
            raise RFQValidationError(f"Invalid category. Allowed: {', '.join(allowed_categories)}")
        
        return v.lower()
    
    @validator('description')
    def validate_description(cls, v):
        v = v.strip()
        if not v:
            raise RFQValidationError("Description cannot be empty")
        
        # Check minimum meaningful content
        word_count = len(v.split())
        if word_count < 10:
            raise RFQValidationError("Description must contain at least 10 words")
        
        # Check for prohibited content
        prohibited_keywords = [
            'illegal', 'weapon', 'drug', 'tobacco', 'adult', 'gambling',
            'counterfeit', 'replica', 'fake', 'pirated'
        ]
        
        v_lower = v.lower()
        for keyword in prohibited_keywords:
            if keyword in v_lower:
                raise RFQValidationError(f"Description contains prohibited content: {keyword}")
        
        return v
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise RFQValidationError("Quantity must be positive")
        
        # Business rule: quantities over 100K need special handling
        if v > 100000:
            # In production, this could trigger admin review
            pass
            
        return v
    
    @validator('target_price')
    def validate_target_price(cls, v):
        if v is not None and v <= 0:
            raise RFQValidationError("Target price must be positive")
        return v
    
    @validator('currency')
    def validate_currency(cls, v):
        allowed_currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD', 'CHF', 'INR']
        if v.upper() not in allowed_currencies:
            raise RFQValidationError(f"Unsupported currency: {v}")
        return v.upper()
    
    @validator('deadline')
    def validate_deadline(cls, v):
        if v is None:
            return None
            
        # Must be in the future
        if v <= datetime.now():
            raise RFQValidationError("Deadline must be in the future")
        
        # Cannot be more than 1 year in the future
        max_deadline = datetime.now() + timedelta(days=365)
        if v > max_deadline:
            raise RFQValidationError("Deadline cannot be more than 1 year in the future")
        
        return v
    
    @validator('shipping_destination')
    def validate_shipping_destination(cls, v):
        v = v.strip()
        if not v:
            raise RFQValidationError("Shipping destination cannot be empty")
        
        # Basic format validation (city, state/country)
        if not re.match(r'^[a-zA-Z\s,.-]+$', v):
            raise RFQValidationError("Invalid characters in shipping destination")
        
        return v
    
    @validator('attachments')
    def validate_attachments(cls, v):
        if not v:
            return []
        
        allowed_extensions = {'.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.xls', '.xlsx'}
        validated_attachments = []
        
        for attachment in v:
            # Validate filename/URL format
            if not attachment or len(attachment.strip()) == 0:
                continue
                
            # Check file extension if it's a filename
            if '.' in attachment:
                ext = attachment.lower().split('.')[-1]
                if f'.{ext}' not in allowed_extensions:
                    raise RFQValidationError(f"Unsupported file type: .{ext}")
            
            validated_attachments.append(attachment.strip())
        
        return validated_attachments

class QuoteSubmissionValidated(BaseModel):
    supplier_message: str = Field(..., min_length=20, max_length=2000)
    items: List[Dict[str, Any]] = Field(..., min_items=1, max_items=50)
    total_amount: float = Field(..., ge=0.01, le=10000000.0)
    currency: str = Field(..., max_length=3)
    lead_time_days: int = Field(..., ge=1, le=365)
    payment_terms: str = Field(..., min_length=5, max_length=500)
    shipping_terms: str = Field(..., min_length=5, max_length=500)
    validity_days: int = Field(default=30, ge=1, le=365)
    certifications: Optional[List[str]] = Field(default_factory=list, max_items=10)
    sample_available: bool = Field(default=False)
    sample_cost: Optional[float] = Field(None, ge=0, le=10000.0)
    
    @validator('supplier_message')
    def validate_message(cls, v):
        v = v.strip()
        if not v:
            raise RFQValidationError("Supplier message cannot be empty")
        
        word_count = len(v.split())
        if word_count < 5:
            raise RFQValidationError("Supplier message must contain at least 5 words")
        
        return v
    
    @validator('items')
    def validate_items(cls, v):
        if not v:
            raise RFQValidationError("At least one item must be quoted")
        
        total_items = 0
        for item in v:
            if not isinstance(item, dict):
                raise RFQValidationError("Invalid item format")
            
            required_fields = ['description', 'unit_price', 'quantity']
            for field in required_fields:
                if field not in item:
                    raise RFQValidationError(f"Missing required field in item: {field}")
            
            # Validate numeric fields
            if not isinstance(item['unit_price'], (int, float)) or item['unit_price'] <= 0:
                raise RFQValidationError("Item unit_price must be positive")
            
            if not isinstance(item['quantity'], int) or item['quantity'] <= 0:
                raise RFQValidationError("Item quantity must be positive integer")
            
            total_items += item['quantity']
        
        # Sanity check on total items
        if total_items > 1000000:
            raise RFQValidationError("Total item quantity exceeds maximum allowed")
        
        return v
    
    @validator('currency')
    def validate_currency(cls, v):
        allowed_currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD', 'CHF', 'INR']
        if v.upper() not in allowed_currencies:
            raise RFQValidationError(f"Unsupported currency: {v}")
        return v.upper()

def validate_rfq_update_permission(rfq_status: str, user_role: str) -> None:
    """Validate if RFQ can be updated based on status and user role"""
    
    if rfq_status == 'awarded':
        raise RFQValidationError("Cannot modify RFQ that has been awarded")
    
    if rfq_status == 'cancelled':
        raise RFQValidationError("Cannot modify cancelled RFQ")
    
    # Only buyers (or admin) can update RFQs
    if user_role not in ['buyer', 'admin']:
        raise RFQValidationError("Only buyers can update RFQs")

def validate_quote_submission_permission(rfq_status: str, rfq_deadline: Optional[datetime], user_role: str) -> None:
    """Validate if quote can be submitted based on RFQ status and deadline"""
    
    if rfq_status != 'published':
        raise RFQValidationError("Can only submit quotes for published RFQs")
    
    if rfq_deadline and datetime.now() > rfq_deadline:
        raise RFQValidationError("RFQ deadline has passed")
    
    if user_role not in ['supplier', 'admin']:
        raise RFQValidationError("Only suppliers can submit quotes")

def validate_business_rules(rfq_data: RFQCreateValidated, user_business_tier: Optional[str] = None) -> None:
    """Validate business-specific rules"""
    
    # High-value RFQ restrictions
    if rfq_data.target_price and rfq_data.target_price * rfq_data.quantity > 100000:
        # RFQs over $100K need verified business account
        if user_business_tier not in ['verified', 'premium']:
            raise RFQValidationError("High-value RFQs require verified business account")
    
    # Category-specific restrictions
    restricted_categories = ['chemicals', 'medical', 'automotive']
    if rfq_data.category in restricted_categories:
        # These categories need special verification
        if user_business_tier != 'premium':
            raise RFQValidationError(f"Category '{rfq_data.category}' requires premium business account")
    
    # Quantity-based restrictions
    if rfq_data.quantity > 10000:
        # Large quantities need business verification
        if user_business_tier not in ['verified', 'premium']:
            raise RFQValidationError("Large quantity orders require verified business account")