from datetime import datetime
from typing import TypedDict, List, Dict, Any, Optional, Literal, Union
from enum import Enum

# Auth Identity Models - Verification, Trust Badges, Username/Image Policies

class VerificationLevel(str, Enum):
    LEVEL_0 = "level_0"  # Unverified
    LEVEL_1 = "level_1"  # Basic Verified  
    LEVEL_2 = "level_2"  # Business Verified

class UserRole(str, Enum):
    SELLER_BRAND = "seller_brand"
    BUYER = "buyer"
    VISITOR = "visitor"
    ADMIN = "admin"

class AuthFlow(str, Enum):
    EMAIL = "email"
    PHONE = "phone"
    SOCIAL_LOGIN = "social_login"
    WALLET = "wallet"

class TwoFactorMethod(str, Enum):
    SMS = "sms"
    EMAIL = "email"
    AUTH_APP = "auth_app"
    WEBAUTHN = "webauthn"

class KYCDocument(str, Enum):
    BUSINESS_LICENSE = "business_license"
    TAX_ID = "tax_id"
    BANK_ACCOUNT_VERIFICATION = "bank_account_verification"
    GOVERNMENT_ID = "government_id"
    PROOF_OF_ADDRESS = "proof_of_address"
    SELFIE_MATCH = "selfie_match"
    PAYMENT_METHOD_VERIFICATION = "payment_method_verification"

class VerificationBadge(TypedDict):
    color: Literal["green", "blue", "gold"]
    placement: Literal["prefix_username", "suffix_username", "profile_only"]
    tooltip: str
    icon: str

class VerificationRequirements(TypedDict):
    label: str
    requirements: List[str]
    badge: Optional[VerificationBadge]

class UserIdentity(TypedDict):
    _id: str
    user_id: str
    username: str
    display_name: str
    email: str
    phone: Optional[str]
    role: UserRole
    verification_level: VerificationLevel
    verification_status: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime]
    
    # Profile information
    avatar_url: Optional[str]
    bio: Optional[str]
    city: Optional[str]
    country: str
    language: str
    currency: str
    timezone: str
    
    # Trust and verification
    trust_score: float
    kyc_documents: List[str]
    kyc_status: Dict[str, str]
    two_factor_enabled: bool
    two_factor_methods: List[TwoFactorMethod]
    
    # Username history
    username_history: List[Dict[str, Any]]
    username_change_count: int
    last_username_change: Optional[datetime]
    
    # Profile image history  
    avatar_history: List[Dict[str, Any]]
    avatar_change_count: int
    last_avatar_change: Optional[datetime]
    
    # Privacy settings
    privacy_settings: Dict[str, bool]
    
    # Audit trail
    audit_events: List[Dict[str, Any]]

class ProfileCard(TypedDict):
    id: str
    display_name: str
    avatar_url: Optional[str]
    username: str
    role: UserRole
    badge: Optional[VerificationBadge]
    city: Optional[Dict[str, str]]
    currency: str
    language: str
    last_seen_iso: Optional[str]
    created_at: str

class UsernameChangeRequest(TypedDict):
    user_id: str
    old_username: str
    new_username: str
    reason: str
    verification_completed: Dict[str, bool]
    status: Literal["pending", "approved", "rejected"]
    created_at: datetime
    processed_at: Optional[datetime]

class AvatarChangeRequest(TypedDict):
    user_id: str
    image_data: str  # Base64 encoded
    image_url: Optional[str]
    verification_completed: Dict[str, bool]
    moderation_flags: List[str]
    status: Literal["pending", "processing", "approved", "rejected"]
    created_at: datetime
    processed_at: Optional[datetime]

class ComplianceCheck(TypedDict):
    check_type: str
    status: Literal["passed", "failed", "pending"]
    confidence: float
    details: Dict[str, Any]
    timestamp: datetime

# Verification Level Configurations
VERIFICATION_LEVELS = {
    VerificationLevel.LEVEL_0: {
        "label": "Unverified",
        "requirements": ["email_or_phone"],
        "badge": None
    },
    VerificationLevel.LEVEL_1: {
        "label": "Basic Verified", 
        "requirements": ["email", "phone", "2fa"],
        "badge": {
            "color": "green",
            "placement": "prefix_username",
            "tooltip": "Verified Buyer/Visitor",
            "icon": "check_circle"
        }
    },
    VerificationLevel.LEVEL_2: {
        "label": "Business Verified",
        "requirements": [
            "business_license", "tax_id", "bank_account_verification", 
            "government_id", "proof_of_address", "selfie_match"
        ],
        "badge": {
            "color": "blue", 
            "placement": "prefix_username",
            "tooltip": "Blue Mark = Verified Seller/Brand",
            "icon": "verified"
        }
    }
}

# Role Configurations
ROLE_CONFIGS = {
    UserRole.SELLER_BRAND: {
        "label": "Verified Brand",
        "verification_required": VerificationLevel.LEVEL_2,
        "badge_color": "blue",
        "permissions": [
            "list_products", "b2b_trading", "cross_border", 
            "payments_accept", "payouts_receive", "api_access_on_request",
            "city_targeting_4m", "bulk_tools"
        ]
    },
    UserRole.BUYER: {
        "label": "Verified Buyer",
        "verification_required": VerificationLevel.LEVEL_1,
        "badge_color": "green",
        "permissions": [
            "browse_buy", "wishlist", "reviews", "returns_support"
        ]
    },
    UserRole.VISITOR: {
        "label": "Visitor", 
        "verification_required": VerificationLevel.LEVEL_1,
        "badge_color": "green",
        "permissions": [
            "browse_buy", "wishlist", "reviews"
        ]
    },
    UserRole.ADMIN: {
        "label": "Admin",
        "verification_required": VerificationLevel.LEVEL_2,
        "badge_color": "gold",
        "permissions": ["all"]
    }
}

# Username Policy Configuration
USERNAME_POLICY = {
    "uniqueness": "global",
    "case_sensitivity": "lowercase_only", 
    "allowed_chars": "a-z0-9._-",
    "min_length": 3,
    "max_length": 30,
    "reserved_words": [
        "admin", "support", "aislemarts", "official", "help", 
        "moderator", "system", "root", "api", "www", "mail",
        "ftp", "ssl", "secure", "payment", "billing", "legal",
        "privacy", "terms", "about", "contact", "careers"
    ],
    "change_policy": {
        "allowed": True,
        "frequency_limit_days": 180,
        "verification_required": [
            "2fa", "email_reconfirmation", "phone_reconfirmation",
            "government_id_recheck", "selfie_match"
        ],
        "legacy_handling": {
            "previous_username_reserved": True,
            "profile_redirect": True,
            "search_alias": True,
            "redirect_duration_days": 365
        },
        "audit_trail": True,
        "public_notice": {
            "enabled": True,
            "duration_days": 30,
            "label": "This account recently changed its username"
        }
    }
}

# Profile Image Policy Configuration  
PROFILE_IMAGE_POLICY = {
    "change_allowed": True,
    "frequency_limit_days": 90,
    "verification_required": [
        "2fa", "email_reconfirmation", "phone_reconfirmation",
        "government_id_recheck", "selfie_liveness_face_match"
    ],
    "moderation_checks": {
        "face_required_for_verified": True,
        "nudity_violence_hate": "block",
        "child_safety": "strict_block", 
        "impersonation": "block_if_not_owner",
        "trademark_copyright": "block_if_claimed",
        "watermark_detection": "warn_or_block"
    },
    "image_requirements": {
        "min_resolution_px": [400, 400],
        "aspect_ratio": "1:1",
        "formats": ["jpg", "jpeg", "png", "webp"],
        "max_size_mb": 5,
        "background_guidance": "neutral_or_brand_safe",
        "no_filters_that_obscure_identity": True
    },
    "processing": {
        "strip_exif_metadata": True,
        "face_crop_centering": True,
        "store_derivatives": ["48", "96", "192", "384"],
        "encryption_at_rest": "AES-256",
        "retention_days_old_images": 30
    },
    "review_flow": {
        "mode": "auto_first_then_manual_on_flags",
        "sla_minutes_auto": 2,
        "manual_review_triggers": [
            "low_face_match_score", "policy_classifier_flag",
            "copyright_flag", "repeated_changes", "high_profile_impact"
        ]
    },
    "transparency": {
        "public_notice": {
            "enabled": True,
            "duration_days": 14,
            "label": "This account recently updated its profile image"
        },
        "audit_trail": True
    }
}

# Sample verification documents for testing
SAMPLE_VERIFICATION_DATA = {
    "business_licenses": [
        {
            "document_type": "business_license",
            "issuing_authority": "Delaware Secretary of State",
            "document_number": "DE-2024-123456",
            "business_name": "Global Trade Solutions LLC",
            "issue_date": "2024-01-15",
            "expiry_date": "2025-01-15",
            "verified": True
        },
        {
            "document_type": "business_license", 
            "issuing_authority": "UK Companies House",
            "document_number": "12345678",
            "business_name": "European Imports Ltd",
            "issue_date": "2023-06-20",
            "expiry_date": "2024-06-20",
            "verified": True
        }
    ],
    "tax_ids": [
        {
            "document_type": "tax_id",
            "country": "US",
            "tax_id": "12-3456789", 
            "tax_id_type": "EIN",
            "verified": True
        },
        {
            "document_type": "tax_id",
            "country": "GB", 
            "tax_id": "GB123456789",
            "tax_id_type": "VAT",
            "verified": True
        },
        {
            "document_type": "tax_id",
            "country": "TR",
            "tax_id": "1234567890",
            "tax_id_type": "VKN",
            "verified": True
        }
    ]
}

# Trust score calculation weights
TRUST_SCORE_WEIGHTS = {
    "email_verified": 10.0,
    "phone_verified": 10.0,
    "2fa_enabled": 15.0,
    "government_id_verified": 20.0,
    "business_license_verified": 25.0,
    "bank_account_verified": 15.0,
    "address_verified": 10.0,
    "selfie_match_verified": 15.0,
    "no_violations_bonus": 10.0,
    "account_age_bonus": 5.0,  # Per year
    "transaction_history_bonus": 10.0
}

def calculate_trust_score(verification_status: Dict[str, bool], 
                         account_age_years: float = 0.0,
                         has_transactions: bool = False,
                         has_violations: bool = False) -> float:
    """Calculate user trust score based on verification status"""
    score = 0.0
    
    # Base verification scores
    for check, verified in verification_status.items():
        if verified and check in TRUST_SCORE_WEIGHTS:
            score += TRUST_SCORE_WEIGHTS[check]
    
    # Bonuses
    if not has_violations:
        score += TRUST_SCORE_WEIGHTS["no_violations_bonus"]
    
    if account_age_years > 0:
        score += min(account_age_years * TRUST_SCORE_WEIGHTS["account_age_bonus"], 25.0)
    
    if has_transactions:
        score += TRUST_SCORE_WEIGHTS["transaction_history_bonus"]
    
    # Normalize to 0-100 scale
    return min(score, 100.0)

def get_verification_badge(role: UserRole, verification_level: VerificationLevel) -> Optional[VerificationBadge]:
    """Get verification badge for user based on role and level"""
    level_config = VERIFICATION_LEVELS.get(verification_level)
    if not level_config or not level_config.get("badge"):
        return None
    
    badge = level_config["badge"].copy()
    role_config = ROLE_CONFIGS.get(role, {})
    
    # Override badge color based on role
    if "badge_color" in role_config:
        badge["color"] = role_config["badge_color"]
    
    # Role-specific tooltips
    if role == UserRole.SELLER_BRAND:
        badge["tooltip"] = "Blue Mark = Verified Seller/Brand"
    elif role in [UserRole.BUYER, UserRole.VISITOR]:
        badge["tooltip"] = "Green Mark = Verified Buyer"
    elif role == UserRole.ADMIN:
        badge["tooltip"] = "Gold Mark = Platform Admin"
        badge["color"] = "gold"
    
    return badge

def validate_username(username: str, existing_usernames: List[str] = []) -> Dict[str, Any]:
    """Validate username according to policy"""
    errors = []
    warnings = []
    
    # Length check
    if len(username) < USERNAME_POLICY["min_length"]:
        errors.append(f"Username must be at least {USERNAME_POLICY['min_length']} characters")
    if len(username) > USERNAME_POLICY["max_length"]:
        errors.append(f"Username must be no more than {USERNAME_POLICY['max_length']} characters")
    
    # Character validation
    import re
    if not re.match(r'^[a-z0-9._-]+$', username.lower()):
        errors.append("Username can only contain letters, numbers, periods, underscores, and hyphens")
    
    # Case sensitivity
    if USERNAME_POLICY["case_sensitivity"] == "lowercase_only":
        if username != username.lower():
            warnings.append("Username will be converted to lowercase")
    
    # Reserved words
    if username.lower() in USERNAME_POLICY["reserved_words"]:
        errors.append("This username is reserved and cannot be used")
    
    # Uniqueness
    if username.lower() in [u.lower() for u in existing_usernames]:
        errors.append("This username is already taken")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "normalized_username": username.lower() if USERNAME_POLICY["case_sensitivity"] == "lowercase_only" else username
    }