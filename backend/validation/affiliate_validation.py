"""
Affiliate System Data Validation - Production-ready validation
Prevents duplicate links, enforces commission bounds, validates campaigns
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, validator, Field
from datetime import datetime, timedelta
from fastapi import HTTPException, status
import re
from urllib.parse import urlparse

class AffiliateValidationError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Affiliate Validation Error: {detail}"
        )

class AffiliateLinkCreateValidated(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=1000)
    campaign_id: Optional[str] = Field(None, max_length=50)
    product_ids: Optional[List[str]] = Field(default_factory=list, max_items=10)
    custom_parameters: Optional[Dict[str, str]] = Field(default_factory=dict, max_items=5)
    expires_at: Optional[datetime] = None
    
    @validator('title')
    def validate_title(cls, v):
        v = v.strip()
        if not v:
            raise AffiliateValidationError("Title cannot be empty")
        
        # Check for spam patterns
        spam_indicators = ['!!!', '???', 'FREE MONEY', 'CLICK HERE NOW', 'LIMITED TIME']
        v_upper = v.upper()
        for indicator in spam_indicators:
            if indicator in v_upper:
                raise AffiliateValidationError(f"Title contains spam-like content: {indicator}")
        
        # Must contain some alphabetic characters
        if not re.search(r'[a-zA-Z]', v):
            raise AffiliateValidationError("Title must contain alphabetic characters")
        
        return v
    
    @validator('description')
    def validate_description(cls, v):
        v = v.strip()
        if not v:
            raise AffiliateValidationError("Description cannot be empty")
        
        word_count = len(v.split())
        if word_count < 3:
            raise AffiliateValidationError("Description must contain at least 3 words")
        
        # Check for prohibited content
        prohibited_content = [
            'get rich quick', 'guaranteed income', 'no work required',
            'pyramid scheme', 'mlm', 'make money fast'
        ]
        
        v_lower = v.lower()
        for content in prohibited_content:
            if content in v_lower:
                raise AffiliateValidationError(f"Description contains prohibited content: {content}")
        
        return v
    
    @validator('product_ids')
    def validate_product_ids(cls, v):
        if not v:
            return []
        
        validated_ids = []
        for product_id in v:
            product_id = product_id.strip()
            if not product_id:
                continue
            
            # Validate product ID format (alphanumeric with underscores/dashes)
            if not re.match(r'^[a-zA-Z0-9_-]{3,50}$', product_id):
                raise AffiliateValidationError(f"Invalid product ID format: {product_id}")
            
            validated_ids.append(product_id)
        
        # Check for duplicates
        if len(validated_ids) != len(set(validated_ids)):
            raise AffiliateValidationError("Duplicate product IDs not allowed")
        
        return validated_ids
    
    @validator('custom_parameters')
    def validate_custom_parameters(cls, v):
        if not v:
            return {}
        
        validated_params = {}
        allowed_keys = {
            'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
            'ref', 'promo', 'discount', 'variant', 'source'
        }
        
        for key, value in v.items():
            # Validate key format
            if not re.match(r'^[a-zA-Z_][a-zA-Z0-9_]{0,19}$', key):
                raise AffiliateValidationError(f"Invalid parameter key format: {key}")
            
            if key not in allowed_keys:
                raise AffiliateValidationError(f"Parameter key not allowed: {key}")
            
            # Validate value
            if not isinstance(value, str):
                raise AffiliateValidationError(f"Parameter value must be string: {key}")
            
            value = value.strip()
            if len(value) > 100:
                raise AffiliateValidationError(f"Parameter value too long: {key}")
            
            # Basic sanitization
            if re.search(r'[<>"\']', value):
                raise AffiliateValidationError(f"Parameter value contains invalid characters: {key}")
            
            validated_params[key] = value
        
        return validated_params
    
    @validator('expires_at')
    def validate_expiry(cls, v):
        if v is None:
            return None
        
        # Must be in the future
        if v <= datetime.now():
            raise AffiliateValidationError("Expiry date must be in the future")
        
        # Cannot be more than 2 years in the future
        max_expiry = datetime.now() + timedelta(days=730)
        if v > max_expiry:
            raise AffiliateValidationError("Expiry date cannot be more than 2 years in the future")
        
        return v

class CampaignJoinValidated(BaseModel):
    campaign_id: str = Field(..., min_length=3, max_length=50)
    application_message: Optional[str] = Field(None, max_length=500)
    
    @validator('campaign_id')
    def validate_campaign_id(cls, v):
        v = v.strip()
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise AffiliateValidationError("Invalid campaign ID format")
        return v
    
    @validator('application_message')
    def validate_message(cls, v):
        if v is None:
            return None
        
        v = v.strip()
        if len(v) < 10:
            raise AffiliateValidationError("Application message must be at least 10 characters")
        
        return v

def validate_link_uniqueness(creator_id: str, campaign_id: Optional[str], product_ids: List[str], existing_links: List[Dict]) -> None:
    """Validate that affiliate link doesn't duplicate existing active links"""
    
    for existing_link in existing_links:
        if existing_link['status'] != 'active':
            continue
        
        # Check for exact match on campaign + products
        if campaign_id and existing_link.get('campaign_id') == campaign_id:
            existing_products = set(existing_link.get('product_ids', []))
            new_products = set(product_ids)
            
            # If there's any overlap in products for the same campaign
            if existing_products.intersection(new_products):
                raise AffiliateValidationError(
                    "You already have an active link for this campaign and product combination"
                )
        
        # Check for duplicate product-only links (no campaign)
        if not campaign_id and not existing_link.get('campaign_id'):
            existing_products = set(existing_link.get('product_ids', []))
            new_products = set(product_ids)
            
            if existing_products.intersection(new_products):
                raise AffiliateValidationError(
                    "You already have an active link for these products"
                )

def validate_commission_bounds(commission_rate: float, commission_type: str, product_category: Optional[str] = None) -> None:
    """Validate commission rates are within acceptable bounds"""
    
    # Define maximum commission rates by category
    max_rates = {
        'electronics': 0.15,      # 15% max
        'fashion': 0.20,          # 20% max
        'home_garden': 0.18,      # 18% max
        'books': 0.10,            # 10% max
        'digital': 0.30,          # 30% max for digital products
        'default': 0.20           # 20% default max
    }
    
    max_allowed = max_rates.get(product_category, max_rates['default'])
    
    if commission_type == 'percentage':
        if commission_rate <= 0 or commission_rate > max_allowed:
            raise AffiliateValidationError(
                f"Commission rate must be between 0% and {max_allowed*100}% for category {product_category or 'default'}"
            )
    elif commission_type == 'fixed':
        if commission_rate <= 0 or commission_rate > 1000.0:  # Max $1000 fixed commission
            raise AffiliateValidationError("Fixed commission must be between $0.01 and $1000.00")
    else:
        raise AffiliateValidationError("Commission type must be 'percentage' or 'fixed'")

def validate_affiliate_permissions(user_role: str, user_tier: Optional[str] = None) -> None:
    """Validate user has permission to create affiliate links"""
    
    allowed_roles = ['affiliate', 'creator', 'influencer', 'partner']
    if user_role not in allowed_roles:
        raise AffiliateValidationError(f"User role '{user_role}' cannot create affiliate links")
    
    # Tier-based restrictions
    if user_tier == 'suspended':
        raise AffiliateValidationError("Account is suspended from affiliate program")
    
    if user_tier == 'pending':
        raise AffiliateValidationError("Account approval pending for affiliate program")

def validate_campaign_eligibility(campaign_data: Dict, user_data: Dict) -> None:
    """Validate user is eligible to join a campaign"""
    
    # Check campaign status
    if campaign_data.get('status') != 'active':
        raise AffiliateValidationError("Campaign is not currently active")
    
    # Check if campaign has ended
    end_date = campaign_data.get('end_date')
    if end_date and datetime.fromisoformat(end_date) < datetime.now():
        raise AffiliateValidationError("Campaign has ended")
    
    # Check user tier requirements
    required_tier = campaign_data.get('required_tier')
    user_tier = user_data.get('tier', 'basic')
    
    tier_hierarchy = {'basic': 1, 'silver': 2, 'gold': 3, 'platinum': 4}
    
    if required_tier:
        required_level = tier_hierarchy.get(required_tier, 1)
        user_level = tier_hierarchy.get(user_tier, 1)
        
        if user_level < required_level:
            raise AffiliateValidationError(
                f"Campaign requires {required_tier} tier. Your tier: {user_tier}"
            )
    
    # Check minimum follower requirements
    min_followers = campaign_data.get('min_followers', 0)
    user_followers = user_data.get('follower_count', 0)
    
    if user_followers < min_followers:
        raise AffiliateValidationError(
            f"Campaign requires minimum {min_followers} followers. You have {user_followers}"
        )
    
    # Check geographic restrictions
    allowed_countries = campaign_data.get('allowed_countries', [])
    user_country = user_data.get('country')
    
    if allowed_countries and user_country not in allowed_countries:
        raise AffiliateValidationError(
            f"Campaign not available in {user_country}"
        )
    
    # Check if user is already participating
    current_participants = campaign_data.get('current_participants', [])
    if user_data.get('user_id') in current_participants:
        raise AffiliateValidationError("You are already participating in this campaign")

def validate_click_authenticity(click_data: Dict, request_info: Dict) -> None:
    """Basic validation for click authenticity (bot detection)"""
    
    # Check for suspicious patterns
    user_agent = request_info.get('user_agent', '').lower()
    
    # Block obvious bots
    bot_indicators = ['bot', 'crawler', 'spider', 'scraper', 'automated']
    for indicator in bot_indicators:
        if indicator in user_agent:
            raise AffiliateValidationError("Automated traffic not allowed")
    
    # Require reasonable user agent
    if not user_agent or len(user_agent) < 10:
        raise AffiliateValidationError("Invalid user agent")
    
    # Check for click farming (same IP, too frequent clicks)
    ip_address = request_info.get('ip_address')
    if ip_address:
        # In production, implement more sophisticated fraud detection
        # For now, basic time-based checking
        pass

def sanitize_url_parameters(url: str) -> str:
    """Sanitize and validate URL parameters"""
    
    try:
        parsed = urlparse(url)
        
        # Validate scheme
        if parsed.scheme not in ['http', 'https']:
            raise AffiliateValidationError("Invalid URL scheme")
        
        # Validate hostname (basic check)
        if not parsed.netloc:
            raise AffiliateValidationError("Invalid URL hostname")
        
        # Check for dangerous protocols
        dangerous = ['javascript:', 'data:', 'file:', 'ftp:']
        if any(url.lower().startswith(proto) for proto in dangerous):
            raise AffiliateValidationError("Dangerous URL protocol detected")
        
        return url
        
    except Exception:
        raise AffiliateValidationError("Invalid URL format")