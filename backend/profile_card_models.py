from datetime import datetime
from typing import TypedDict, List, Dict, Any, Optional, Literal, Union
from enum import Enum

# Profile Card Models - Unified user/profile cards system

class ProfileCardType(str, Enum):
    USER_CARD = "user_card"
    BRAND_CARD = "brand_card"
    ADMIN_CARD = "admin_card"

class CardVisibility(str, Enum):
    PUBLIC = "public"
    VERIFIED_ONLY = "verified_only"
    PRIVATE = "private"

class ContactMethod(str, Enum):
    EMAIL = "email"
    PHONE = "phone"
    WEBSITE = "website"
    SOCIAL_MEDIA = "social_media"
    MESSAGING = "messaging"

class ProfileCardSettings(TypedDict):
    card_type: ProfileCardType
    visibility: CardVisibility
    show_trust_score: bool
    show_verification_badges: bool
    show_activity_status: bool
    show_location: bool
    show_contact_methods: List[ContactMethod]
    custom_fields: Dict[str, Any]
    theme_color: Optional[str]
    background_image: Optional[str]

class SocialLink(TypedDict):
    platform: str
    username: str
    url: str
    verified: bool

class ContactInfo(TypedDict):
    method: ContactMethod
    value: str
    label: str
    verified: bool
    public: bool

class BusinessInfo(TypedDict):
    business_name: str
    business_type: str
    industry: str
    tax_id: Optional[str]
    registration_number: Optional[str]
    address: Dict[str, str]
    website: Optional[str]
    description: Optional[str]

class StatsInfo(TypedDict):
    total_orders: int
    total_sales: float
    member_since: str
    last_active: Optional[str]
    products_listed: Optional[int]
    average_rating: Optional[float]
    response_time: Optional[str]

class ProfileCard(TypedDict):
    _id: str
    user_id: str
    card_type: ProfileCardType
    
    # Basic Information
    display_name: str
    username: str
    avatar_url: Optional[str]
    bio: Optional[str]
    
    # Location & Identity
    city: Optional[str]
    country: str
    language: str
    currency: str
    timezone: str
    
    # Verification & Trust
    verification_level: str
    verification_badges: List[Dict[str, Any]]
    trust_score: float
    
    # Contact & Social
    contact_info: List[ContactInfo]
    social_links: List[SocialLink]
    
    # Business Information (for sellers)
    business_info: Optional[BusinessInfo]
    
    # Statistics & Activity
    stats: StatsInfo
    
    # Card Settings
    settings: ProfileCardSettings
    
    # Metadata
    created_at: datetime
    updated_at: datetime
    public_url: str

class ProfileCardView(TypedDict):
    """Simplified view for public display"""
    id: str
    display_name: str
    username: str
    avatar_url: Optional[str]
    bio: Optional[str]
    city: Optional[str]
    country: str
    verification_badges: List[Dict[str, Any]]
    trust_score: Optional[float]
    stats: Dict[str, Any]
    contact_methods: List[str]
    member_since: str
    public_url: str

class ProfileCardTemplate(TypedDict):
    template_id: str
    name: str
    description: str
    card_type: ProfileCardType
    default_settings: ProfileCardSettings
    custom_fields: List[Dict[str, Any]]
    layout_options: Dict[str, Any]

# Pre-defined templates
PROFILE_CARD_TEMPLATES = {
    "basic_buyer": {
        "template_id": "basic_buyer",
        "name": "Basic Buyer Profile",
        "description": "Simple profile for regular buyers",
        "card_type": ProfileCardType.USER_CARD,
        "default_settings": {
            "card_type": ProfileCardType.USER_CARD,
            "visibility": CardVisibility.PUBLIC,
            "show_trust_score": True,
            "show_verification_badges": True,
            "show_activity_status": True,
            "show_location": True,
            "show_contact_methods": [ContactMethod.EMAIL],
            "custom_fields": {},
            "theme_color": "#4CAF50",
            "background_image": None
        },
        "custom_fields": [
            {"field": "favorite_categories", "type": "list", "label": "Favorite Categories"},
            {"field": "wishlist_size", "type": "number", "label": "Wishlist Items"}
        ],
        "layout_options": {
            "compact": True,
            "show_stats": False,
            "show_social": False
        }
    },
    "verified_seller": {
        "template_id": "verified_seller",
        "name": "Verified Seller Profile",
        "description": "Professional profile for verified sellers",
        "card_type": ProfileCardType.BRAND_CARD,
        "default_settings": {
            "card_type": ProfileCardType.BRAND_CARD,
            "visibility": CardVisibility.PUBLIC,
            "show_trust_score": True,
            "show_verification_badges": True,
            "show_activity_status": True,
            "show_location": True,
            "show_contact_methods": [ContactMethod.EMAIL, ContactMethod.WEBSITE, ContactMethod.PHONE],
            "custom_fields": {},
            "theme_color": "#2196F3",
            "background_image": None
        },
        "custom_fields": [
            {"field": "specialization", "type": "text", "label": "Business Specialization"},
            {"field": "shipping_countries", "type": "list", "label": "Ships To"},
            {"field": "certifications", "type": "list", "label": "Certifications"},
            {"field": "business_hours", "type": "text", "label": "Business Hours"}
        ],
        "layout_options": {
            "compact": False,
            "show_stats": True,
            "show_social": True,
            "show_business_info": True
        }
    },
    "premium_brand": {
        "template_id": "premium_brand",
        "name": "Premium Brand Profile",
        "description": "Enhanced profile for premium brands",
        "card_type": ProfileCardType.BRAND_CARD,
        "default_settings": {
            "card_type": ProfileCardType.BRAND_CARD,
            "visibility": CardVisibility.PUBLIC,
            "show_trust_score": True,
            "show_verification_badges": True,
            "show_activity_status": True,
            "show_location": True,
            "show_contact_methods": [ContactMethod.EMAIL, ContactMethod.WEBSITE, ContactMethod.PHONE, ContactMethod.SOCIAL_MEDIA],
            "custom_fields": {},
            "theme_color": "#FF9800",
            "background_image": None
        },
        "custom_fields": [
            {"field": "brand_story", "type": "text", "label": "Brand Story"},
            {"field": "awards", "type": "list", "label": "Awards & Recognition"},
            {"field": "partnerships", "type": "list", "label": "Key Partnerships"},
            {"field": "sustainability", "type": "text", "label": "Sustainability Commitment"}
        ],
        "layout_options": {
            "compact": False,
            "show_stats": True,
            "show_social": True,
            "show_business_info": True,
            "premium_features": True
        }
    }
}

# Default contact methods by region
REGIONAL_CONTACT_PREFERENCES = {
    "US": [ContactMethod.EMAIL, ContactMethod.PHONE, ContactMethod.WEBSITE],
    "EU": [ContactMethod.EMAIL, ContactMethod.WEBSITE, ContactMethod.PHONE],
    "ASIA": [ContactMethod.EMAIL, ContactMethod.MESSAGING, ContactMethod.SOCIAL_MEDIA],
    "GLOBAL": [ContactMethod.EMAIL, ContactMethod.WEBSITE]
}

# Social media platforms
SUPPORTED_SOCIAL_PLATFORMS = [
    "twitter", "linkedin", "facebook", "instagram", "youtube", 
    "tiktok", "pinterest", "discord", "telegram", "whatsapp"
]

def generate_public_url(username: str, card_type: ProfileCardType) -> str:
    """Generate public URL for profile card"""
    prefix = "profile"
    if card_type == ProfileCardType.BRAND_CARD:
        prefix = "brand"
    elif card_type == ProfileCardType.ADMIN_CARD:
        prefix = "admin"
    
    return f"https://aislemarts.com/{prefix}/{username}"

def get_template_by_user_role(role: str, is_premium: bool = False) -> str:
    """Get appropriate template based on user role"""
    if role == "seller_brand":
        return "premium_brand" if is_premium else "verified_seller"
    else:
        return "basic_buyer"

def validate_social_link(platform: str, username: str) -> Dict[str, Any]:
    """Validate social media link"""
    if platform not in SUPPORTED_SOCIAL_PLATFORMS:
        return {"valid": False, "error": "Unsupported social platform"}
    
    if not username or len(username) < 2:
        return {"valid": False, "error": "Invalid username"}
    
    # Platform-specific validation
    if platform in ["twitter", "instagram", "tiktok"]:
        if not username.startswith("@"):
            username = "@" + username
    
    # Generate URL
    url_mapping = {
        "twitter": f"https://twitter.com/{username.lstrip('@')}",
        "linkedin": f"https://linkedin.com/in/{username}",
        "facebook": f"https://facebook.com/{username}",
        "instagram": f"https://instagram.com/{username.lstrip('@')}",
        "youtube": f"https://youtube.com/@{username}",
        "tiktok": f"https://tiktok.com/@{username.lstrip('@')}",
        "pinterest": f"https://pinterest.com/{username}",
        "discord": username,  # Discord handles are different
        "telegram": f"https://t.me/{username.lstrip('@')}",
        "whatsapp": username  # WhatsApp links are different
    }
    
    return {
        "valid": True,
        "normalized_username": username,
        "url": url_mapping.get(platform, f"https://{platform}.com/{username}")
    }

def calculate_profile_completeness(profile_card: ProfileCard) -> Dict[str, Any]:
    """Calculate profile completeness score"""
    total_fields = 0
    completed_fields = 0
    missing_fields = []
    
    # Basic information (weight: 40%)
    basic_fields = ["display_name", "avatar_url", "bio", "city", "country"]
    for field in basic_fields:
        total_fields += 1
        if profile_card.get(field):
            completed_fields += 1
        else:
            missing_fields.append(field)
    
    # Contact information (weight: 20%)
    total_fields += 1
    if profile_card.get("contact_info") and len(profile_card["contact_info"]) > 0:
        completed_fields += 1
    else:
        missing_fields.append("contact_info")
    
    # Verification (weight: 20%)
    total_fields += 1
    if profile_card.get("verification_badges") and len(profile_card["verification_badges"]) > 0:
        completed_fields += 1
    else:
        missing_fields.append("verification_badges")
    
    # Business info for sellers (weight: 10%)
    if profile_card["card_type"] == ProfileCardType.BRAND_CARD:
        total_fields += 1
        if profile_card.get("business_info"):
            completed_fields += 1
        else:
            missing_fields.append("business_info")
    
    # Social links (weight: 10%)
    total_fields += 1
    if profile_card.get("social_links") and len(profile_card["social_links"]) > 0:
        completed_fields += 1
    else:
        missing_fields.append("social_links")
    
    completeness_percentage = (completed_fields / total_fields) * 100 if total_fields > 0 else 0
    
    return {
        "percentage": round(completeness_percentage, 1),
        "completed_fields": completed_fields,
        "total_fields": total_fields,
        "missing_fields": missing_fields,
        "suggestions": get_completion_suggestions(missing_fields, profile_card["card_type"])
    }

def get_completion_suggestions(missing_fields: List[str], card_type: ProfileCardType) -> List[str]:
    """Get suggestions to improve profile completeness"""
    suggestions = []
    
    if "avatar_url" in missing_fields:
        suggestions.append("Add a profile photo to help others recognize you")
    
    if "bio" in missing_fields:
        suggestions.append("Write a brief bio to introduce yourself")
    
    if "city" in missing_fields:
        suggestions.append("Add your location to connect with local users")
    
    if "contact_info" in missing_fields:
        suggestions.append("Add contact methods to make it easier for others to reach you")
    
    if "verification_badges" in missing_fields:
        suggestions.append("Complete verification to earn trust badges")
    
    if "business_info" in missing_fields and card_type == ProfileCardType.BRAND_CARD:
        suggestions.append("Add business information to build credibility with customers")
    
    if "social_links" in missing_fields:
        suggestions.append("Connect your social media accounts to expand your presence")
    
    return suggestions