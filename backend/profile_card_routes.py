from fastapi import APIRouter, Depends, HTTPException, Header, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime

from security import decode_access_token
from db import db
from profile_card_service import profile_card_service
from profile_card_models import (
    ProfileCardType, CardVisibility, ContactMethod, ProfileCardSettings,
    ContactInfo, SocialLink, BusinessInfo, SUPPORTED_SOCIAL_PLATFORMS
)

router = APIRouter(prefix="/api/profile-cards", tags=["Profile Cards"])

# Pydantic models for API
class CreateProfileCardRequest(BaseModel):
    display_name: Optional[str] = None
    username: Optional[str] = None
    role: str = "buyer"
    is_premium: bool = False
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    country: str = "US"
    language: str = "en"
    currency: str = "USD"
    timezone: str = "UTC"
    email: Optional[str] = None
    phone: Optional[str] = None
    email_verified: bool = False
    phone_verified: bool = False
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    business_address: Optional[Dict[str, str]] = None
    website: Optional[str] = None
    business_description: Optional[str] = None

class UpdateProfileCardRequest(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    city: Optional[str] = None
    avatar_url: Optional[str] = None

class ContactInfoAPI(BaseModel):
    method: ContactMethod
    value: str
    label: str
    verified: bool = False
    public: bool = True

class UpdateContactInfoRequest(BaseModel):
    contact_info: List[ContactInfoAPI]

class AddSocialLinkRequest(BaseModel):
    platform: str
    username: str

class BusinessInfoAPI(BaseModel):
    business_name: str
    business_type: str
    industry: str
    tax_id: Optional[str] = None
    registration_number: Optional[str] = None
    address: Dict[str, str] = {}
    website: Optional[str] = None
    description: Optional[str] = None

class UpdateBusinessInfoRequest(BaseModel):
    business_info: BusinessInfoAPI

class ProfileCardSettingsAPI(BaseModel):
    card_type: ProfileCardType
    visibility: CardVisibility
    show_trust_score: bool = True
    show_verification_badges: bool = True
    show_activity_status: bool = True
    show_location: bool = True
    show_contact_methods: List[ContactMethod] = []
    custom_fields: Dict[str, Any] = {}
    theme_color: Optional[str] = None
    background_image: Optional[str] = None

class UpdateCardSettingsRequest(BaseModel):
    settings: ProfileCardSettingsAPI

class UpdateStatsRequest(BaseModel):
    stat_updates: Dict[str, Any]

async def get_current_user_required(authorization: str | None = Header(None)):
    """Extract user from auth token (required)"""
    if not authorization:
        raise HTTPException(401, "Authorization header required")
    
    try:
        token = authorization.split()[1]
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token")
        
        user = await db().users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(401, "User not found")
        
        return user
    except Exception:
        raise HTTPException(401, "Invalid authorization")

async def get_current_user_optional(authorization: str | None = Header(None)):
    """Extract user from auth token (optional)"""
    if not authorization:
        return None
    
    try:
        token = authorization.split()[1]
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        user = await db().users.find_one({"_id": user_id})
        return user
    except Exception:
        return None

@router.post("/create")
async def create_profile_card(
    request: CreateProfileCardRequest,
    user = Depends(get_current_user_required)
):
    """Create new profile card for user"""
    try:
        user_id = str(user["_id"])
        user_data = request.dict()
        user_data["user_id"] = user_id
        
        # Use username from request or generate from user ID
        if not user_data.get("username"):
            user_data["username"] = user.get("username", f"user_{user_id[:8]}")
        
        card_id = await profile_card_service.create_profile_card(user_id, user_data)
        
        return {
            "success": True,
            "card_id": card_id,
            "message": "Profile card created successfully"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to create profile card: {str(e)}")

@router.get("/my-card")
async def get_my_profile_card(user = Depends(get_current_user_required)):
    """Get current user's profile card"""
    try:
        user_id = str(user["_id"])
        card = await profile_card_service.get_profile_card(user_id)
        
        if not card:
            raise HTTPException(404, "Profile card not found")
        
        return card
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error retrieving profile card: {str(e)}")

@router.get("/card/{user_id}")
async def get_profile_card_by_id(
    user_id: str,
    user = Depends(get_current_user_optional)
):
    """Get profile card by user ID"""
    try:
        viewer_id = str(user["_id"]) if user else None
        card_view = await profile_card_service.get_profile_card_view(user_id, viewer_id)
        
        if not card_view:
            raise HTTPException(404, "Profile card not found or not accessible")
        
        return card_view
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error retrieving profile card: {str(e)}")

@router.get("/username/{username}")
async def get_profile_card_by_username(
    username: str,
    user = Depends(get_current_user_optional)
):
    """Get profile card by username"""
    try:
        # Get the profile card first
        card = await profile_card_service.get_profile_card_by_username(username)
        if not card:
            raise HTTPException(404, "Profile card not found")
        
        # Get the view with proper permissions
        viewer_id = str(user["_id"]) if user else None
        card_view = await profile_card_service.get_profile_card_view(card["user_id"], viewer_id)
        
        if not card_view:
            raise HTTPException(404, "Profile card not accessible")
        
        return card_view
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error retrieving profile card: {str(e)}")

@router.put("/update")
async def update_profile_card(
    request: UpdateProfileCardRequest,
    user = Depends(get_current_user_required)
):
    """Update profile card information"""
    try:
        user_id = str(user["_id"])
        updates = {k: v for k, v in request.dict().items() if v is not None}
        
        success = await profile_card_service.update_profile_card(user_id, updates)
        
        if not success:
            raise HTTPException(400, "Failed to update profile card")
        
        return {
            "success": True,
            "message": "Profile card updated successfully",
            "updates": updates
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error updating profile card: {str(e)}")

@router.put("/contact-info")
async def update_contact_info(
    request: UpdateContactInfoRequest,
    user = Depends(get_current_user_required)
):
    """Update contact information"""
    try:
        user_id = str(user["_id"])
        
        # Convert API models to service models
        contact_info = []
        for contact in request.contact_info:
            contact_info.append({
                "method": contact.method,
                "value": contact.value,
                "label": contact.label,
                "verified": contact.verified,
                "public": contact.public
            })
        
        success = await profile_card_service.update_contact_info(user_id, contact_info)
        
        if not success:
            raise HTTPException(400, "Failed to update contact information")
        
        return {
            "success": True,
            "message": "Contact information updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error updating contact information: {str(e)}")

@router.post("/social-links/add")
async def add_social_link(
    request: AddSocialLinkRequest,
    user = Depends(get_current_user_required)
):
    """Add social media link to profile"""
    try:
        user_id = str(user["_id"])
        result = await profile_card_service.add_social_link(
            user_id, 
            request.platform, 
            request.username
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Error adding social link: {str(e)}")

@router.delete("/social-links/{platform}")
async def remove_social_link(
    platform: str,
    user = Depends(get_current_user_required)
):
    """Remove social media link from profile"""
    try:
        user_id = str(user["_id"])
        success = await profile_card_service.remove_social_link(user_id, platform)
        
        if not success:
            raise HTTPException(400, "Failed to remove social link")
        
        return {
            "success": True,
            "message": f"Social link for {platform} removed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error removing social link: {str(e)}")

@router.put("/business-info")
async def update_business_info(
    request: UpdateBusinessInfoRequest,
    user = Depends(get_current_user_required)
):
    """Update business information for seller profiles"""
    try:
        user_id = str(user["_id"])
        
        # Convert API model to service model
        business_info: BusinessInfo = {
            "business_name": request.business_info.business_name,
            "business_type": request.business_info.business_type,
            "industry": request.business_info.industry,
            "tax_id": request.business_info.tax_id,
            "registration_number": request.business_info.registration_number,
            "address": request.business_info.address,
            "website": request.business_info.website,
            "description": request.business_info.description
        }
        
        success = await profile_card_service.update_business_info(user_id, business_info)
        
        if not success:
            raise HTTPException(400, "Failed to update business information")
        
        return {
            "success": True,
            "message": "Business information updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error updating business information: {str(e)}")

@router.put("/settings")
async def update_card_settings(
    request: UpdateCardSettingsRequest,
    user = Depends(get_current_user_required)
):
    """Update profile card settings"""
    try:
        user_id = str(user["_id"])
        
        # Convert API model to service model
        settings: ProfileCardSettings = {
            "card_type": request.settings.card_type,
            "visibility": request.settings.visibility,
            "show_trust_score": request.settings.show_trust_score,
            "show_verification_badges": request.settings.show_verification_badges,
            "show_activity_status": request.settings.show_activity_status,
            "show_location": request.settings.show_location,
            "show_contact_methods": request.settings.show_contact_methods,
            "custom_fields": request.settings.custom_fields,
            "theme_color": request.settings.theme_color,
            "background_image": request.settings.background_image
        }
        
        success = await profile_card_service.update_card_settings(user_id, settings)
        
        if not success:
            raise HTTPException(400, "Failed to update card settings")
        
        return {
            "success": True,
            "message": "Profile card settings updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error updating card settings: {str(e)}")

@router.get("/completeness")
async def get_profile_completeness(user = Depends(get_current_user_required)):
    """Get profile completeness analysis"""
    try:
        user_id = str(user["_id"])
        completeness = await profile_card_service.get_profile_completeness(user_id)
        
        return completeness
        
    except Exception as e:
        raise HTTPException(500, f"Error getting profile completeness: {str(e)}")

@router.put("/stats")
async def update_profile_stats(
    request: UpdateStatsRequest,
    user = Depends(get_current_user_required)
):
    """Update profile statistics"""
    try:
        user_id = str(user["_id"])
        
        success = await profile_card_service.update_stats(user_id, request.stat_updates)
        
        if not success:
            raise HTTPException(400, "Failed to update profile stats")
        
        return {
            "success": True,
            "message": "Profile statistics updated successfully",
            "updates": request.stat_updates
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error updating profile stats: {str(e)}")

@router.get("/search")
async def search_profiles(
    query: str = Query(..., description="Search query for profiles"),
    card_type: Optional[ProfileCardType] = Query(None, description="Filter by card type"),
    country: Optional[str] = Query(None, description="Filter by country"),
    city: Optional[str] = Query(None, description="Filter by city"),
    limit: int = Query(20, description="Maximum number of results"),
    user = Depends(get_current_user_optional)
):
    """Search public profiles"""
    try:
        filters = {}
        if card_type:
            filters["card_type"] = card_type.value
        if country:
            filters["country"] = country
        if city:
            filters["city"] = city
        
        profiles = await profile_card_service.search_profiles(query, filters)
        
        return {
            "profiles": profiles[:limit],
            "count": len(profiles),
            "query": query,
            "filters": filters
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error searching profiles: {str(e)}")

@router.get("/templates")
async def get_profile_templates():
    """Get available profile card templates"""
    try:
        templates = await profile_card_service.get_templates()
        
        return {
            "templates": templates,
            "description": "Available profile card templates for different user types"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting templates: {str(e)}")

@router.get("/social-platforms")
async def get_supported_social_platforms():
    """Get supported social media platforms"""
    try:
        return {
            "platforms": SUPPORTED_SOCIAL_PLATFORMS,
            "count": len(SUPPORTED_SOCIAL_PLATFORMS)
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting social platforms: {str(e)}")

@router.get("/contact-methods")
async def get_contact_methods():
    """Get available contact methods"""
    try:
        return {
            "contact_methods": [method.value for method in ContactMethod],
            "description": "Available contact methods for profile cards"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting contact methods: {str(e)}")

@router.get("/health")
async def profile_cards_service_health():
    """Health check for Profile Cards service"""
    try:
        return {
            "status": "healthy",
            "capabilities": [
                "profile_card_creation",
                "profile_management",
                "contact_info_management",
                "social_links_management",
                "business_info_management",
                "profile_search",
                "completeness_analysis",
                "ai_suggestions"
            ],
            "card_types": ["user_card", "brand_card", "admin_card"],
            "visibility_levels": ["public", "verified_only", "private"],
            "ai_model": "openai/gpt-4o-mini",
            "supported_social_platforms": len(SUPPORTED_SOCIAL_PLATFORMS),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }