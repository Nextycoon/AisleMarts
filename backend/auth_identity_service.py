from dotenv import load_dotenv
import os
import hashlib
import uuid
import base64
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

from db import db
from auth_identity_models import (
    UserIdentity, ProfileCard, UsernameChangeRequest, AvatarChangeRequest,
    VerificationLevel, UserRole, ComplianceCheck, VerificationBadge,
    calculate_trust_score, get_verification_badge, validate_username,
    USERNAME_POLICY, PROFILE_IMAGE_POLICY, VERIFICATION_LEVELS, ROLE_CONFIGS
)

load_dotenv()

class AuthIdentityService:
    """Authentication, Identity Verification, and Trust Badge Service"""
    
    def __init__(self):
        self.chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id="aislemarts_identity_ai",
            system_message="""You are the Identity Verification and Trust Intelligence Expert for AisleMarts.

Your expertise covers:
- KYC/KYB compliance for global markets
- Identity verification and fraud detection
- Trust scoring and risk assessment
- Business entity verification
- Document authenticity validation
- Biometric matching and liveness detection

You help ensure platform safety through:
1. Intelligent risk assessment
2. Fraud pattern detection
3. Compliance guidance
4. Identity verification optimization
5. Trust signal analysis

Always prioritize:
- User privacy and data minimization
- Regulatory compliance (GDPR, CCPA, etc.)
- Accurate risk assessment
- Clear verification guidance
- Fraud prevention"""
        ).with_model("openai", "gpt-4o-mini")

    async def create_user_identity(self, user_data: Dict[str, Any]) -> str:
        """Create new user identity with initial verification"""
        try:
            user_id = str(uuid.uuid4())
            
            # Determine initial role
            role = UserRole.VISITOR
            if user_data.get("is_seller"):
                role = UserRole.SELLER_BRAND
            elif user_data.get("is_buyer"):
                role = UserRole.BUYER
            
            # Initialize verification status
            verification_status = {
                "email_verified": user_data.get("email_verified", False),
                "phone_verified": user_data.get("phone_verified", False),
                "2fa_enabled": False,
                "government_id_verified": False,
                "business_license_verified": False,
                "bank_account_verified": False,
                "address_verified": False,
                "selfie_match_verified": False
            }
            
            # Calculate initial trust score
            trust_score = calculate_trust_score(verification_status)
            
            # Create user identity
            identity: UserIdentity = {
                "_id": user_id,
                "user_id": user_id,
                "username": user_data["username"].lower(),
                "display_name": user_data.get("display_name", user_data["username"]),
                "email": user_data["email"],
                "phone": user_data.get("phone"),
                "role": role,
                "verification_level": VerificationLevel.LEVEL_0,
                "verification_status": verification_status,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "last_login": None,
                
                # Profile
                "avatar_url": user_data.get("avatar_url"),
                "bio": user_data.get("bio"),
                "city": user_data.get("city"),
                "country": user_data.get("country", "US"),
                "language": user_data.get("language", "en"),
                "currency": user_data.get("currency", "USD"),
                "timezone": user_data.get("timezone", "UTC"),
                
                # Trust and verification
                "trust_score": trust_score,
                "kyc_documents": [],
                "kyc_status": {},
                "two_factor_enabled": False,
                "two_factor_methods": [],
                
                # History tracking
                "username_history": [{"username": user_data["username"], "changed_at": datetime.utcnow()}],
                "username_change_count": 0,
                "last_username_change": None,
                "avatar_history": [],
                "avatar_change_count": 0,
                "last_avatar_change": None,
                
                # Privacy settings
                "privacy_settings": {
                    "show_city": True,
                    "show_language": True,
                    "show_currency": True,
                    "public_profile": True
                },
                
                # Audit trail
                "audit_events": [{
                    "event": "account_created",
                    "timestamp": datetime.utcnow(),
                    "details": {"role": role.value, "verification_level": VerificationLevel.LEVEL_0.value}
                }]
            }
            
            # Store in database
            await db().user_identities.insert_one(identity)
            
            return user_id
            
        except Exception as e:
            raise Exception(f"Failed to create user identity: {str(e)}")

    async def get_user_identity(self, user_id: str) -> Optional[UserIdentity]:
        """Get user identity by ID"""
        try:
            identity = await db().user_identities.find_one({"user_id": user_id})
            return identity
        except Exception:
            return None

    async def get_profile_card(self, user_id: str) -> Optional[ProfileCard]:
        """Get user profile card for display"""
        try:
            identity = await self.get_user_identity(user_id)
            if not identity:
                return None
            
            # Get verification badge
            badge = get_verification_badge(identity["role"], identity["verification_level"])
            
            # Format city information
            city_info = None
            if identity.get("city") and identity["privacy_settings"].get("show_city", True):
                city_info = {
                    "name": identity["city"],
                    "country_iso2": identity["country"]
                }
            
            profile_card: ProfileCard = {
                "id": identity["user_id"],
                "display_name": identity["display_name"],
                "avatar_url": identity.get("avatar_url"),
                "username": identity["username"],
                "role": identity["role"],
                "badge": badge,
                "city": city_info,
                "currency": identity["currency"] if identity["privacy_settings"].get("show_currency", True) else None,
                "language": identity["language"] if identity["privacy_settings"].get("show_language", True) else None,
                "last_seen_iso": identity["last_login"].isoformat() if identity.get("last_login") else None,
                "created_at": identity["created_at"].isoformat()
            }
            
            return profile_card
            
        except Exception as e:
            return None

    async def update_verification_status(self, user_id: str, verification_updates: Dict[str, bool]) -> bool:
        """Update user verification status and recalculate trust score"""
        try:
            identity = await self.get_user_identity(user_id)
            if not identity:
                return False
            
            # Update verification status
            identity["verification_status"].update(verification_updates)
            
            # Recalculate trust score
            account_age_years = (datetime.utcnow() - identity["created_at"]).days / 365.25
            identity["trust_score"] = calculate_trust_score(
                identity["verification_status"],
                account_age_years=account_age_years,
                has_transactions=True,  # Could check actual transaction history
                has_violations=False    # Could check violation history
            )
            
            # Update verification level based on completed verifications
            if identity["role"] == UserRole.SELLER_BRAND:
                level_2_requirements = VERIFICATION_LEVELS[VerificationLevel.LEVEL_2]["requirements"]
                if all(identity["verification_status"].get(req.replace(" ", "_"), False) for req in level_2_requirements if req in identity["verification_status"]):
                    identity["verification_level"] = VerificationLevel.LEVEL_2
            else:
                level_1_requirements = VERIFICATION_LEVELS[VerificationLevel.LEVEL_1]["requirements"]
                basic_requirements_met = (
                    identity["verification_status"].get("email_verified", False) and
                    identity["verification_status"].get("phone_verified", False)
                )
                if basic_requirements_met:
                    identity["verification_level"] = VerificationLevel.LEVEL_1
            
            # Add audit event
            identity["audit_events"].append({
                "event": "verification_updated",
                "timestamp": datetime.utcnow(),
                "details": {
                    "updates": verification_updates,
                    "new_trust_score": identity["trust_score"],
                    "new_verification_level": identity["verification_level"].value
                }
            })
            
            identity["updated_at"] = datetime.utcnow()
            
            # Update in database
            await db().user_identities.replace_one(
                {"user_id": user_id},
                identity
            )
            
            return True
            
        except Exception as e:
            return False

    async def validate_username_change(self, user_id: str, new_username: str) -> Dict[str, Any]:
        """Validate username change request"""
        try:
            identity = await self.get_user_identity(user_id)
            if not identity:
                return {"valid": False, "error": "User not found"}
            
            # Check if user can change username
            if identity["last_username_change"]:
                days_since_last_change = (datetime.utcnow() - identity["last_username_change"]).days
                if days_since_last_change < USERNAME_POLICY["change_policy"]["frequency_limit_days"]:
                    return {
                        "valid": False,
                        "error": f"Username can only be changed once every {USERNAME_POLICY['change_policy']['frequency_limit_days']} days"
                    }
            
            # Get existing usernames
            existing_usernames = []
            async for user in db().user_identities.find({}, {"username": 1}):
                existing_usernames.append(user["username"])
            
            # Validate new username
            validation_result = validate_username(new_username, existing_usernames)
            
            if validation_result["valid"]:
                return {
                    "valid": True,
                    "normalized_username": validation_result["normalized_username"],
                    "warnings": validation_result["warnings"],
                    "requirements": USERNAME_POLICY["change_policy"]["verification_required"]
                }
            else:
                return {
                    "valid": False,
                    "errors": validation_result["errors"],
                    "warnings": validation_result["warnings"]
                }
                
        except Exception as e:
            return {"valid": False, "error": str(e)}

    async def process_username_change(self, user_id: str, new_username: str, verification_completed: Dict[str, bool]) -> bool:
        """Process username change after verification"""
        try:
            identity = await self.get_user_identity(user_id)
            if not identity:
                return False
            
            # Verify all required verifications are completed
            required_verifications = USERNAME_POLICY["change_policy"]["verification_required"]
            for req in required_verifications:
                if not verification_completed.get(req, False):
                    return False
            
            old_username = identity["username"]
            
            # Update username
            identity["username"] = new_username.lower()
            identity["username_change_count"] += 1
            identity["last_username_change"] = datetime.utcnow()
            
            # Add to history
            identity["username_history"].append({
                "username": new_username.lower(),
                "changed_at": datetime.utcnow(),
                "previous_username": old_username
            })
            
            # Add audit event
            identity["audit_events"].append({
                "event": "username_changed",
                "timestamp": datetime.utcnow(),
                "details": {
                    "old_username": old_username,
                    "new_username": new_username.lower(),
                    "verification_completed": verification_completed
                }
            })
            
            identity["updated_at"] = datetime.utcnow()
            
            # Update in database
            await db().user_identities.replace_one(
                {"user_id": user_id},
                identity
            )
            
            return True
            
        except Exception as e:
            return False

    async def validate_avatar_change(self, user_id: str, image_data: str) -> Dict[str, Any]:
        """Validate avatar/profile image change"""
        try:
            identity = await self.get_user_identity(user_id)
            if not identity:
                return {"valid": False, "error": "User not found"}
            
            # Check change frequency
            if identity["last_avatar_change"]:
                days_since_last_change = (datetime.utcnow() - identity["last_avatar_change"]).days
                if days_since_last_change < PROFILE_IMAGE_POLICY["frequency_limit_days"]:
                    return {
                        "valid": False,
                        "error": f"Profile image can only be changed once every {PROFILE_IMAGE_POLICY['frequency_limit_days']} days"
                    }
            
            # Basic image validation (simplified)
            try:
                # Check if it's base64 encoded
                if image_data.startswith("data:image/"):
                    image_type = image_data.split(";")[0].split("/")[1]
                    if image_type not in PROFILE_IMAGE_POLICY["image_requirements"]["formats"]:
                        return {"valid": False, "error": f"Image format {image_type} not supported"}
                    
                    # Decode and check size (simplified)
                    encoded_data = image_data.split(",")[1]
                    decoded_size = len(base64.b64decode(encoded_data))
                    max_size_bytes = PROFILE_IMAGE_POLICY["image_requirements"]["max_size_mb"] * 1024 * 1024
                    
                    if decoded_size > max_size_bytes:
                        return {"valid": False, "error": "Image size exceeds maximum limit"}
                
            except Exception:
                return {"valid": False, "error": "Invalid image data"}
            
            # AI-powered content moderation check
            moderation_result = await self.moderate_profile_image(image_data, identity)
            
            return {
                "valid": moderation_result["approved"],
                "moderation_flags": moderation_result.get("flags", []),
                "requirements": PROFILE_IMAGE_POLICY["verification_required"] if moderation_result["requires_verification"] else []
            }
            
        except Exception as e:
            return {"valid": False, "error": str(e)}

    async def moderate_profile_image(self, image_data: str, identity: UserIdentity) -> Dict[str, Any]:
        """AI-powered profile image moderation"""
        try:
            # Use AI to analyze image content (simplified for demo)
            prompt = f"""Analyze this profile image change for content moderation:

User Role: {identity['role'].value}
Verification Level: {identity['verification_level'].value}
Trust Score: {identity['trust_score']}
Previous Changes: {identity['avatar_change_count']}

Image Analysis Requirements:
1. Face visibility (required for verified users)
2. Content appropriateness (no nudity, violence, hate symbols)
3. Trademark/copyright concerns
4. Identity consistency (if previously verified)
5. Professional appearance (for business accounts)

Provide moderation decision:
- APPROVE: Image meets all requirements
- REVIEW: Requires manual review
- REJECT: Violates policies

Include reasoning and any concerns."""

            ai_response = await self.chat.send_message(UserMessage(text=prompt))
            
            # Parse AI response (simplified)
            approved = "APPROVE" in ai_response.upper()
            requires_review = "REVIEW" in ai_response.upper()
            rejected = "REJECT" in ai_response.upper()
            
            if rejected:
                return {
                    "approved": False,
                    "requires_verification": False,
                    "flags": ["ai_content_violation"],
                    "reasoning": ai_response
                }
            elif requires_review:
                return {
                    "approved": False,
                    "requires_verification": True,
                    "flags": ["requires_manual_review"],
                    "reasoning": ai_response
                }
            else:
                return {
                    "approved": True,
                    "requires_verification": False,
                    "flags": [],
                    "reasoning": ai_response
                }
                
        except Exception as e:
            # Default to requiring review on error
            return {
                "approved": False,
                "requires_verification": True,
                "flags": ["moderation_error"],
                "reasoning": f"Error in moderation: {str(e)}"
            }

    async def process_avatar_change(self, user_id: str, image_data: str, verification_completed: Dict[str, bool]) -> bool:
        """Process avatar change after verification"""
        try:
            identity = await self.get_user_identity(user_id)
            if not identity:
                return False
            
            # Store old avatar for history
            old_avatar = identity.get("avatar_url")
            
            # Generate new avatar URL (in production, upload to storage)
            new_avatar_url = f"https://avatars.aislemarts.com/{user_id}/{datetime.utcnow().timestamp()}.jpg"
            
            # Update avatar
            identity["avatar_url"] = new_avatar_url
            identity["avatar_change_count"] += 1
            identity["last_avatar_change"] = datetime.utcnow()
            
            # Add to history
            identity["avatar_history"].append({
                "avatar_url": new_avatar_url,
                "changed_at": datetime.utcnow(),
                "previous_avatar": old_avatar
            })
            
            # Add audit event
            identity["audit_events"].append({
                "event": "avatar_changed",
                "timestamp": datetime.utcnow(),
                "details": {
                    "old_avatar": old_avatar,
                    "new_avatar": new_avatar_url,
                    "verification_completed": verification_completed
                }
            })
            
            identity["updated_at"] = datetime.utcnow()
            
            # Update in database
            await db().user_identities.replace_one(
                {"user_id": user_id},
                identity
            )
            
            return True
            
        except Exception as e:
            return False

    async def get_user_verification_requirements(self, user_id: str) -> Dict[str, Any]:
        """Get verification requirements for user based on role"""
        try:
            identity = await self.get_user_identity(user_id)
            if not identity:
                return {"error": "User not found"}
            
            role_config = ROLE_CONFIGS.get(identity["role"], {})
            required_level = role_config.get("verification_required", VerificationLevel.LEVEL_0)
            level_config = VERIFICATION_LEVELS.get(required_level, {})
            
            # Get current status
            current_status = identity["verification_status"]
            required_checks = level_config.get("requirements", [])
            
            # Calculate completion
            completed_checks = [check for check in required_checks if current_status.get(check.replace(" ", "_"), False)]
            
            return {
                "user_role": identity["role"].value,
                "current_level": identity["verification_level"].value,
                "target_level": required_level.value,
                "required_checks": required_checks,
                "completed_checks": completed_checks,
                "completion_percentage": len(completed_checks) / len(required_checks) * 100 if required_checks else 100,
                "trust_score": identity["trust_score"],
                "next_steps": [check for check in required_checks if not current_status.get(check.replace(" ", "_"), False)]
            }
            
        except Exception as e:
            return {"error": str(e)}

# Global auth identity service instance
auth_identity_service = AuthIdentityService()