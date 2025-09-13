from dotenv import load_dotenv
import os
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

from db import db
from profile_card_models import (
    ProfileCard, ProfileCardView, ProfileCardSettings, ContactInfo, SocialLink,
    BusinessInfo, StatsInfo, ProfileCardType, CardVisibility, ContactMethod,
    PROFILE_CARD_TEMPLATES, generate_public_url, get_template_by_user_role,
    validate_social_link, calculate_profile_completeness
)

load_dotenv()

class ProfileCardService:
    """Profile Card Service - Unified user/profile cards system"""
    
    def __init__(self):
        self.chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id="aislemarts_profile_ai",
            system_message="""You are the Profile Card Intelligence Expert for AisleMarts.

Your expertise covers:
- User profile optimization for global commerce
- Trust signal enhancement and verification display
- Professional brand presentation
- Cross-cultural profile customization
- Privacy-conscious profile management
- Contact method optimization by region

You help users create compelling profiles that:
1. Build trust and credibility
2. Enhance discoverability
3. Comply with regional preferences
4. Maintain privacy while being informative
5. Optimize for their target audience
6. Present consistent brand identity

Always consider:
- User's role (buyer, seller, admin)
- Geographic and cultural context
- Privacy preferences
- Trust building opportunities
- Professional presentation standards"""
        ).with_model("openai", "gpt-4o-mini")

    async def create_profile_card(self, user_id: str, user_data: Dict[str, Any]) -> str:
        """Create new profile card for user"""
        try:
            card_id = str(uuid.uuid4())
            
            # Determine card type and template
            user_role = user_data.get("role", "buyer")
            is_premium = user_data.get("is_premium", False)
            template_id = get_template_by_user_role(user_role, is_premium)
            template = PROFILE_CARD_TEMPLATES.get(template_id, PROFILE_CARD_TEMPLATES["basic_buyer"])
            
            # Get initial stats
            stats: StatsInfo = {
                "total_orders": 0,
                "total_sales": 0.0,
                "member_since": datetime.utcnow().isoformat(),
                "last_active": datetime.utcnow().isoformat(),
                "products_listed": 0 if user_role == "seller_brand" else None,
                "average_rating": None,
                "response_time": None
            }
            
            # Initialize contact info
            contact_info: List[ContactInfo] = []
            if user_data.get("email"):
                contact_info.append({
                    "method": ContactMethod.EMAIL,
                    "value": user_data["email"],
                    "label": "Email",
                    "verified": user_data.get("email_verified", False),
                    "public": True
                })
            
            if user_data.get("phone"):
                contact_info.append({
                    "method": ContactMethod.PHONE,
                    "value": user_data["phone"],
                    "label": "Phone",
                    "verified": user_data.get("phone_verified", False),
                    "public": False
                })
            
            # Create profile card
            profile_card: ProfileCard = {
                "_id": card_id,
                "user_id": user_id,
                "card_type": template["card_type"],
                
                # Basic Information
                "display_name": user_data.get("display_name", user_data.get("username", "User")),
                "username": user_data.get("username", f"user_{user_id[:8]}"),
                "avatar_url": user_data.get("avatar_url"),
                "bio": user_data.get("bio"),
                
                # Location & Identity
                "city": user_data.get("city"),
                "country": user_data.get("country", "US"),
                "language": user_data.get("language", "en"),
                "currency": user_data.get("currency", "USD"),
                "timezone": user_data.get("timezone", "UTC"),
                
                # Verification & Trust
                "verification_level": user_data.get("verification_level", "level_0"),
                "verification_badges": user_data.get("verification_badges", []),
                "trust_score": user_data.get("trust_score", 0.0),
                
                # Contact & Social
                "contact_info": contact_info,
                "social_links": [],
                
                # Business Information
                "business_info": None,
                
                # Statistics & Activity
                "stats": stats,
                
                # Card Settings
                "settings": template["default_settings"],
                
                # Metadata
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "public_url": generate_public_url(user_data.get("username", f"user_{user_id[:8]}"), template["card_type"])
            }
            
            # Add business info for sellers
            if user_role == "seller_brand" and user_data.get("business_name"):
                business_info: BusinessInfo = {
                    "business_name": user_data["business_name"],
                    "business_type": user_data.get("business_type", "retail"),
                    "industry": user_data.get("industry", "general"),
                    "tax_id": user_data.get("tax_id"),
                    "registration_number": user_data.get("registration_number"),
                    "address": user_data.get("business_address", {}),
                    "website": user_data.get("website"),
                    "description": user_data.get("business_description")
                }
                profile_card["business_info"] = business_info
            
            # Store in database
            await db().profile_cards.insert_one(profile_card)
            
            return card_id
            
        except Exception as e:
            raise Exception(f"Failed to create profile card: {str(e)}")

    async def get_profile_card(self, user_id: str) -> Optional[ProfileCard]:
        """Get profile card by user ID"""
        try:
            card = await db().profile_cards.find_one({"user_id": user_id})
            return card
        except Exception:
            return None

    async def get_profile_card_by_username(self, username: str) -> Optional[ProfileCard]:
        """Get profile card by username"""
        try:
            card = await db().profile_cards.find_one({"username": username.lower()})
            return card
        except Exception:
            return None

    async def get_profile_card_view(self, user_id: str, viewer_id: str = None) -> Optional[ProfileCardView]:
        """Get public view of profile card"""
        try:
            card = await self.get_profile_card(user_id)
            if not card:
                return None
            
            # Check visibility permissions
            if card["settings"]["visibility"] == CardVisibility.PRIVATE:
                if viewer_id != user_id:
                    return None
            elif card["settings"]["visibility"] == CardVisibility.VERIFIED_ONLY:
                # Check if viewer is verified (simplified)
                if viewer_id and viewer_id != user_id:
                    viewer_card = await self.get_profile_card(viewer_id)
                    if not viewer_card or not viewer_card.get("verification_badges"):
                        return None
            
            # Filter contact methods based on settings
            contact_methods = []
            for contact in card.get("contact_info", []):
                if contact["public"] and contact["method"].value in [method.value for method in card["settings"]["show_contact_methods"]]:
                    contact_methods.append(contact["method"].value)
            
            # Build view
            profile_view: ProfileCardView = {
                "id": card["user_id"],
                "display_name": card["display_name"],
                "username": card["username"],
                "avatar_url": card.get("avatar_url"),
                "bio": card.get("bio"),
                "city": card.get("city") if card["settings"]["show_location"] else None,
                "country": card["country"] if card["settings"]["show_location"] else None,
                "verification_badges": card.get("verification_badges", []) if card["settings"]["show_verification_badges"] else [],
                "trust_score": card.get("trust_score") if card["settings"]["show_trust_score"] else None,
                "stats": {
                    "member_since": card["stats"]["member_since"],
                    "last_active": card["stats"]["last_active"] if card["settings"]["show_activity_status"] else None
                },
                "contact_methods": contact_methods,
                "member_since": card["stats"]["member_since"],
                "public_url": card["public_url"]
            }
            
            return profile_view
            
        except Exception as e:
            return None

    async def update_profile_card(self, user_id: str, updates: Dict[str, Any]) -> bool:
        """Update profile card information"""
        try:
            card = await self.get_profile_card(user_id)
            if not card:
                return False
            
            # Update allowed fields
            updatable_fields = [
                "display_name", "bio", "city", "avatar_url", "contact_info", 
                "social_links", "business_info", "settings"
            ]
            
            for field, value in updates.items():
                if field in updatable_fields:
                    card[field] = value
            
            card["updated_at"] = datetime.utcnow()
            
            # Update public URL if username changed
            if "username" in updates:
                card["public_url"] = generate_public_url(updates["username"], card["card_type"])
            
            # Update in database
            await db().profile_cards.replace_one(
                {"user_id": user_id},
                card
            )
            
            return True
            
        except Exception as e:
            return False

    async def add_social_link(self, user_id: str, platform: str, username: str) -> Dict[str, Any]:
        """Add social media link to profile"""
        try:
            card = await self.get_profile_card(user_id)
            if not card:
                return {"success": False, "error": "Profile card not found"}
            
            # Validate social link
            validation = validate_social_link(platform, username)
            if not validation["valid"]:
                return {"success": False, "error": validation["error"]}
            
            # Check if platform already exists
            for link in card.get("social_links", []):
                if link["platform"] == platform:
                    return {"success": False, "error": "Platform already linked"}
            
            # Add new social link
            social_link: SocialLink = {
                "platform": platform,
                "username": validation["normalized_username"],
                "url": validation["url"],
                "verified": False  # Would need verification process
            }
            
            if "social_links" not in card:
                card["social_links"] = []
            card["social_links"].append(social_link)
            card["updated_at"] = datetime.utcnow()
            
            # Update in database
            await db().profile_cards.replace_one(
                {"user_id": user_id},
                card
            )
            
            return {"success": True, "social_link": social_link}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def remove_social_link(self, user_id: str, platform: str) -> bool:
        """Remove social media link from profile"""
        try:
            card = await self.get_profile_card(user_id)
            if not card:
                return False
            
            # Remove social link
            card["social_links"] = [link for link in card.get("social_links", []) if link["platform"] != platform]
            card["updated_at"] = datetime.utcnow()
            
            # Update in database
            await db().profile_cards.replace_one(
                {"user_id": user_id},
                card
            )
            
            return True
            
        except Exception as e:
            return False

    async def update_contact_info(self, user_id: str, contact_updates: List[ContactInfo]) -> bool:
        """Update contact information"""
        try:
            card = await self.get_profile_card(user_id)
            if not card:
                return False
            
            card["contact_info"] = contact_updates
            card["updated_at"] = datetime.utcnow()
            
            # Update in database
            await db().profile_cards.replace_one(
                {"user_id": user_id},
                card
            )
            
            return True
            
        except Exception as e:
            return False

    async def update_business_info(self, user_id: str, business_info: BusinessInfo) -> bool:
        """Update business information for seller profiles"""
        try:
            card = await self.get_profile_card(user_id)
            if not card:
                return False
            
            if card["card_type"] != ProfileCardType.BRAND_CARD:
                return False
            
            card["business_info"] = business_info
            card["updated_at"] = datetime.utcnow()
            
            # Update in database
            await db().profile_cards.replace_one(
                {"user_id": user_id},
                card
            )
            
            return True
            
        except Exception as e:
            return False

    async def update_card_settings(self, user_id: str, settings: ProfileCardSettings) -> bool:
        """Update profile card settings"""
        try:
            card = await self.get_profile_card(user_id)
            if not card:
                return False
            
            card["settings"] = settings
            card["updated_at"] = datetime.utcnow()
            
            # Update in database
            await db().profile_cards.replace_one(
                {"user_id": user_id},
                card
            )
            
            return True
            
        except Exception as e:
            return False

    async def get_profile_completeness(self, user_id: str) -> Dict[str, Any]:
        """Get profile completeness analysis"""
        try:
            card = await self.get_profile_card(user_id)
            if not card:
                return {"error": "Profile card not found"}
            
            completeness = calculate_profile_completeness(card)
            
            # Add AI suggestions for improvement
            if completeness["percentage"] < 100:
                ai_suggestions = await self.get_ai_profile_suggestions(card, completeness["missing_fields"])
                completeness["ai_suggestions"] = ai_suggestions
            
            return completeness
            
        except Exception as e:
            return {"error": str(e)}

    async def get_ai_profile_suggestions(self, card: ProfileCard, missing_fields: List[str]) -> str:
        """Get AI-powered profile improvement suggestions"""
        try:
            prompt = f"""Analyze this user profile and provide personalized suggestions for improvement:

Profile Type: {card['card_type'].value}
Current Display Name: {card['display_name']}
Role: {'Seller/Brand' if card['card_type'] == ProfileCardType.BRAND_CARD else 'Buyer'}
Country: {card['country']}
Current Bio: {card.get('bio', 'No bio provided')}
Trust Score: {card.get('trust_score', 0)}

Missing Information: {', '.join(missing_fields)}
Current Contact Methods: {len(card.get('contact_info', []))}
Social Links: {len(card.get('social_links', []))}
Verification Status: {len(card.get('verification_badges', []))} badges

Provide specific, actionable suggestions to:
1. Improve profile completeness and attractiveness
2. Build trust and credibility
3. Enhance discoverability
4. Appeal to their target audience
5. Optimize for their geographic market

Focus on practical steps they can take immediately."""

            ai_response = await self.chat.send_message(UserMessage(text=prompt))
            return ai_response
            
        except Exception as e:
            return f"Error getting AI suggestions: {str(e)}"

    async def search_profiles(self, query: str, filters: Dict[str, Any] = {}) -> List[ProfileCardView]:
        """Search public profiles"""
        try:
            search_filters = {"settings.visibility": {"$ne": CardVisibility.PRIVATE.value}}
            
            # Add text search
            if query:
                search_filters["$or"] = [
                    {"display_name": {"$regex": query, "$options": "i"}},
                    {"username": {"$regex": query, "$options": "i"}},
                    {"bio": {"$regex": query, "$options": "i"}}
                ]
            
            # Add additional filters
            if filters.get("card_type"):
                search_filters["card_type"] = filters["card_type"]
            
            if filters.get("country"):
                search_filters["country"] = filters["country"]
            
            if filters.get("city"):
                search_filters["city"] = filters["city"]
            
            # Execute search
            cursor = db().profile_cards.find(search_filters).limit(20)
            cards = await cursor.to_list(length=20)
            
            # Convert to views
            profile_views = []
            for card in cards:
                view = await self.get_profile_card_view(card["user_id"])
                if view:
                    profile_views.append(view)
            
            return profile_views
            
        except Exception as e:
            return []

    async def get_templates(self) -> Dict[str, Any]:
        """Get available profile card templates"""
        return PROFILE_CARD_TEMPLATES

    async def update_stats(self, user_id: str, stat_updates: Dict[str, Any]) -> bool:
        """Update profile statistics"""
        try:
            card = await self.get_profile_card(user_id)
            if not card:
                return False
            
            # Update stats
            for stat, value in stat_updates.items():
                if stat in card["stats"]:
                    card["stats"][stat] = value
            
            card["stats"]["last_active"] = datetime.utcnow().isoformat()
            card["updated_at"] = datetime.utcnow()
            
            # Update in database
            await db().profile_cards.replace_one(
                {"user_id": user_id},
                card
            )
            
            return True
            
        except Exception as e:
            return False

# Global profile card service instance
profile_card_service = ProfileCardService()