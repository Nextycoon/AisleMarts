from datetime import datetime
from typing import TypedDict, List, Dict, Any, Optional, Literal, Union
from enum import Enum

# Procedures by Category Models - Role-specific workflows

class UserRole(str, Enum):
    SELLER_BRAND = "seller_brand"
    BUYER = "buyer"
    VISITOR = "visitor"
    ADMIN = "admin"

class VerificationBadge(str, Enum):
    BLUE = "blue"  # Verified Seller/Brand
    GREEN = "green"  # Verified Buyer/Visitor
    NONE = "none"  # Unverified

class OnboardingStep(str, Enum):
    CREATE_ACCOUNT = "create_account"
    EMAIL_PHONE_VERIFY = "email_phone_verify"
    ENABLE_2FA = "enable_2fa"
    BUSINESS_PROFILE_SETUP = "business_profile_setup"
    KYB_SUBMISSION = "kyb_submission"
    BANK_ACCOUNT_VERIFICATION = "bank_account_verification"
    TAX_IDS_SUBMISSION = "tax_ids_submission"
    BRAND_ASSETS_UPLOAD = "brand_assets_upload"
    POLICY_ACCEPTANCE = "policy_acceptance"
    PROFILE_BASICS = "profile_basics"
    PAYMENT_METHOD_VERIFICATION = "payment_method_verification"

class AuthenticationMethod(str, Enum):
    EMAIL_PASSWORD = "email_password"
    PHONE_OTP = "phone_otp"
    SOCIAL_LOGIN = "social_login"
    WEBAUTHN = "webauthn"

class TwoFactorMethod(str, Enum):
    AUTH_APP = "auth_app"
    SMS = "sms"
    EMAIL = "email"
    WEBAUTHN = "webauthn"

class KYCDocument(str, Enum):
    BUSINESS_LICENSE = "business_license"
    TAX_ID = "tax_id"
    LEGAL_REPRESENTATIVE_ID = "legal_representative_id"
    PROOF_OF_ADDRESS = "proof_of_address"
    BENEFICIAL_OWNER_DECLARATION = "beneficial_owner_declaration"
    BANK_ACCOUNT_VERIFICATION = "bank_account_verification"
    PAYMENT_METHOD_VERIFICATION = "payment_method_verification"
    GOVERNMENT_ID = "government_id"

class Permission(str, Enum):
    LIST_PRODUCTS = "list_products"
    B2B_TRADING = "b2b_trading"
    CROSS_BORDER = "cross_border"
    PAYMENTS_ACCEPT = "payments_accept"
    PAYOUTS_RECEIVE = "payouts_receive"
    API_ACCESS = "api_access"
    CITY_TARGETING = "city_targeting"
    BROWSE_BUY = "browse_buy"
    WISHLIST = "wishlist"
    REVIEWS = "reviews"
    RETURNS_SUPPORT = "returns_support"
    SELLER_TOOLS = "seller_tools"

class OnboardingConfig(TypedDict):
    steps: List[OnboardingStep]
    sla: Dict[str, int]  # auto_checks_minutes, manual_review_hours

class AuthenticationConfig(TypedDict):
    sign_in: List[AuthenticationMethod]
    two_factor: List[TwoFactorMethod]
    session_policy: Dict[str, int]  # idle_timeout_min, device_limit

class VerificationConfig(TypedDict):
    required_documents: List[KYCDocument]
    badge: VerificationBadge
    reverification_interval_days: int

class PermissionsConfig(TypedDict):
    permissions: Dict[Permission, Union[bool, str, List[str]]]

class UserCategory(TypedDict):
    category_id: str
    label: str
    role_key: UserRole
    target_badge: Dict[str, str]  # color, label
    onboarding: OnboardingConfig
    authentication: AuthenticationConfig
    verification: VerificationConfig
    permissions: PermissionsConfig

class UserProcedure(TypedDict):
    _id: str
    user_id: str
    category: UserRole
    current_step: OnboardingStep
    completed_steps: List[OnboardingStep]
    verification_status: Dict[str, bool]
    badge_earned: VerificationBadge
    permissions_granted: List[Permission]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    onboarding_completed_at: Optional[datetime]
    next_reverification_due: Optional[datetime]
    
    # Workflow state
    status: Literal["in_progress", "completed", "suspended", "under_review"]
    notes: Optional[str]
    assigned_reviewer: Optional[str]
    
    # Audit trail
    step_history: List[Dict[str, Any]]
    verification_history: List[Dict[str, Any]]

# Category configurations
USER_CATEGORIES: Dict[str, UserCategory] = {
    "companies_brands": {
        "category_id": "companies_brands",
        "label": "Companies & Brands",
        "role_key": UserRole.SELLER_BRAND,
        "target_badge": {
            "color": "blue",
            "label": "Verified Brand"
        },
        "onboarding": {
            "steps": [
                OnboardingStep.CREATE_ACCOUNT,
                OnboardingStep.EMAIL_PHONE_VERIFY,
                OnboardingStep.ENABLE_2FA,
                OnboardingStep.BUSINESS_PROFILE_SETUP,
                OnboardingStep.KYB_SUBMISSION,
                OnboardingStep.BANK_ACCOUNT_VERIFICATION,
                OnboardingStep.TAX_IDS_SUBMISSION,
                OnboardingStep.BRAND_ASSETS_UPLOAD,
                OnboardingStep.POLICY_ACCEPTANCE
            ],
            "sla": {
                "auto_checks_minutes": 5,
                "manual_review_hours": 24
            }
        },
        "authentication": {
            "sign_in": [
                AuthenticationMethod.EMAIL_PASSWORD,
                AuthenticationMethod.PHONE_OTP,
                AuthenticationMethod.SOCIAL_LOGIN,
                AuthenticationMethod.WEBAUTHN
            ],
            "two_factor": [
                TwoFactorMethod.AUTH_APP,
                TwoFactorMethod.SMS,
                TwoFactorMethod.EMAIL,
                TwoFactorMethod.WEBAUTHN
            ],
            "session_policy": {
                "idle_timeout_min": 30,
                "device_limit": 5
            }
        },
        "verification": {
            "required_documents": [
                KYCDocument.BUSINESS_LICENSE,
                KYCDocument.TAX_ID,
                KYCDocument.LEGAL_REPRESENTATIVE_ID,
                KYCDocument.PROOF_OF_ADDRESS,
                KYCDocument.BENEFICIAL_OWNER_DECLARATION,
                KYCDocument.BANK_ACCOUNT_VERIFICATION
            ],
            "badge": VerificationBadge.BLUE,
            "reverification_interval_days": 365
        },
        "permissions": {
            "permissions": {
                Permission.LIST_PRODUCTS: True,
                Permission.B2B_TRADING: True,
                Permission.CROSS_BORDER: True,
                Permission.PAYMENTS_ACCEPT: True,
                Permission.PAYOUTS_RECEIVE: True,
                Permission.API_ACCESS: "on_request",
                Permission.CITY_TARGETING: "4M+",
                Permission.BROWSE_BUY: True,
                Permission.WISHLIST: True,
                Permission.REVIEWS: True,
                Permission.RETURNS_SUPPORT: True,
                Permission.SELLER_TOOLS: True
            }
        }
    },
    "visitors_buyers": {
        "category_id": "visitors_buyers",
        "label": "Visitors & Buyers",
        "role_key": UserRole.BUYER,
        "target_badge": {
            "color": "green",
            "label": "Verified Buyer"
        },
        "onboarding": {
            "steps": [
                OnboardingStep.CREATE_ACCOUNT,
                OnboardingStep.EMAIL_PHONE_VERIFY,
                OnboardingStep.ENABLE_2FA,  # recommended, not required
                OnboardingStep.PROFILE_BASICS,
                OnboardingStep.PAYMENT_METHOD_VERIFICATION
            ],
            "sla": {
                "auto_checks_minutes": 2,
                "manual_review_hours": 8
            }
        },
        "authentication": {
            "sign_in": [
                AuthenticationMethod.EMAIL_PASSWORD,
                AuthenticationMethod.PHONE_OTP,
                AuthenticationMethod.SOCIAL_LOGIN,
                AuthenticationMethod.WEBAUTHN
            ],
            "two_factor": [
                TwoFactorMethod.AUTH_APP,
                TwoFactorMethod.SMS,
                TwoFactorMethod.EMAIL
            ],
            "session_policy": {
                "idle_timeout_min": 60,
                "device_limit": 8
            }
        },
        "verification": {
            "required_documents": [
                KYCDocument.PAYMENT_METHOD_VERIFICATION,
                KYCDocument.GOVERNMENT_ID  # optional
            ],
            "badge": VerificationBadge.GREEN,
            "reverification_interval_days": 730
        },
        "permissions": {
            "permissions": {
                Permission.BROWSE_BUY: True,
                Permission.WISHLIST: True,
                Permission.REVIEWS: True,
                Permission.RETURNS_SUPPORT: True,
                Permission.CITY_TARGETING: "view_only",
                Permission.LIST_PRODUCTS: False,
                Permission.B2B_TRADING: False,
                Permission.CROSS_BORDER: False,
                Permission.PAYMENTS_ACCEPT: False,
                Permission.PAYOUTS_RECEIVE: False,
                Permission.API_ACCESS: False,
                Permission.SELLER_TOOLS: False
            }
        }
    }
}

# Badge configuration
BADGE_CONFIG = {
    "seller_brand": {
        "icon": "check_circle",
        "color": "blue",
        "placement": "prefix_username",
        "tooltip": "Blue Mark = Verified Seller/Brand"
    },
    "buyer": {
        "icon": "check_circle",
        "color": "green",
        "placement": "prefix_username",
        "tooltip": "Green Mark = Verified Buyer"
    },
    "visitor": {
        "icon": "check_circle",
        "color": "green",
        "placement": "prefix_username",
        "tooltip": "Green Mark = Verified Visitor"
    }
}

# Step requirements and validation
STEP_REQUIREMENTS = {
    OnboardingStep.CREATE_ACCOUNT: {
        "required_fields": ["email", "password", "role"],
        "validation": ["email_format", "password_strength"],
        "auto_complete": True
    },
    OnboardingStep.EMAIL_PHONE_VERIFY: {
        "required_fields": ["email_verified", "phone_verified"],
        "validation": ["otp_verification"],
        "auto_complete": False
    },
    OnboardingStep.ENABLE_2FA: {
        "required_fields": ["two_factor_enabled"],
        "validation": ["2fa_setup_complete"],
        "auto_complete": False,
        "optional_for": [UserRole.BUYER]
    },
    OnboardingStep.BUSINESS_PROFILE_SETUP: {
        "required_fields": ["business_name", "business_type", "industry"],
        "validation": ["business_info_complete"],
        "auto_complete": False,
        "required_for": [UserRole.SELLER_BRAND]
    },
    OnboardingStep.KYB_SUBMISSION: {
        "required_fields": ["kyb_documents"],
        "validation": ["document_upload_complete"],
        "auto_complete": False,
        "required_for": [UserRole.SELLER_BRAND]
    },
    OnboardingStep.BANK_ACCOUNT_VERIFICATION: {
        "required_fields": ["bank_account_verified"],
        "validation": ["bank_verification_complete"],
        "auto_complete": False,
        "required_for": [UserRole.SELLER_BRAND]
    },
    OnboardingStep.PAYMENT_METHOD_VERIFICATION: {
        "required_fields": ["payment_method_verified"],
        "validation": ["payment_verification_complete"],
        "auto_complete": False,
        "required_for": [UserRole.BUYER]
    }
}

def get_category_config(role: UserRole) -> Optional[UserCategory]:
    """Get category configuration for user role"""
    role_to_category = {
        UserRole.SELLER_BRAND: "companies_brands",
        UserRole.BUYER: "visitors_buyers",
        UserRole.VISITOR: "visitors_buyers"
    }
    
    category_id = role_to_category.get(role)
    return USER_CATEGORIES.get(category_id)

def get_next_onboarding_step(current_step: OnboardingStep, role: UserRole) -> Optional[OnboardingStep]:
    """Get next onboarding step for user role"""
    config = get_category_config(role)
    if not config:
        return None
    
    steps = config["onboarding"]["steps"]
    try:
        current_index = steps.index(current_step)
        if current_index + 1 < len(steps):
            return steps[current_index + 1]
    except ValueError:
        pass
    
    return None

def calculate_onboarding_progress(completed_steps: List[OnboardingStep], role: UserRole) -> Dict[str, Any]:
    """Calculate onboarding progress for user"""
    config = get_category_config(role)
    if not config:
        return {"percentage": 0, "completed": 0, "total": 0}
    
    total_steps = len(config["onboarding"]["steps"])
    completed_count = len(completed_steps)
    
    percentage = (completed_count / total_steps) * 100 if total_steps > 0 else 0
    
    return {
        "percentage": round(percentage, 1),
        "completed": completed_count,
        "total": total_steps,
        "remaining_steps": [step for step in config["onboarding"]["steps"] if step not in completed_steps]
    }

def get_required_permissions(role: UserRole) -> List[Permission]:
    """Get permissions that should be granted for completed verification"""
    config = get_category_config(role)
    if not config:
        return []
    
    permissions = []
    for perm, value in config["permissions"]["permissions"].items():
        if value is True or (isinstance(value, str) and value not in ["false", "no"]):
            permissions.append(perm)
    
    return permissions

def validate_step_completion(step: OnboardingStep, user_data: Dict[str, Any], role: UserRole) -> Dict[str, Any]:
    """Validate if step can be marked as completed"""
    step_config = STEP_REQUIREMENTS.get(step, {})
    
    # Check if step is required for this role
    required_for = step_config.get("required_for", [])
    optional_for = step_config.get("optional_for", [])
    
    if required_for and role not in required_for:
        return {"valid": False, "reason": f"Step not required for {role.value}"}
    
    if optional_for and role in optional_for:
        return {"valid": True, "reason": "Optional step for this role"}
    
    # Check required fields
    required_fields = step_config.get("required_fields", [])
    missing_fields = []
    
    for field in required_fields:
        if field not in user_data or not user_data[field]:
            missing_fields.append(field)
    
    if missing_fields:
        return {
            "valid": False,
            "reason": f"Missing required fields: {', '.join(missing_fields)}",
            "missing_fields": missing_fields
        }
    
    return {"valid": True, "reason": "All requirements met"}

def get_badge_for_role(role: UserRole) -> Dict[str, str]:
    """Get badge configuration for user role"""
    role_mapping = {
        UserRole.SELLER_BRAND: "seller_brand",
        UserRole.BUYER: "buyer",
        UserRole.VISITOR: "visitor"
    }
    
    badge_key = role_mapping.get(role, "visitor")
    return BADGE_CONFIG.get(badge_key, BADGE_CONFIG["visitor"])

def should_show_public_notice(procedure: UserProcedure, notice_type: str) -> bool:
    """Determine if public notice should be shown"""
    notice_configs = {
        "username_changed": {"duration_days": 30},
        "profile_image_changed": {"duration_days": 14}
    }
    
    config = notice_configs.get(notice_type)
    if not config:
        return False
    
    # Check if notice should be shown based on recent changes
    # Implementation would check user's recent changes from audit log
    return False  # Simplified for now