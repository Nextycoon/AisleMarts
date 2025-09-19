from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from pydantic import BaseModel, Field
import logging
import json
import requests
from geopy.geocoders import Nominatim
import pytz
from babel import Locale
import re

import sys
import os
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from routers.deps import get_db
from security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/awareness", tags=["AisleMarts Awareness Engine"])

# Awareness Models
class LocationContext(BaseModel):
    country: str
    country_code: str
    region: str
    city: str
    timezone: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    currency: str
    language: str
    cultural_context: Dict[str, Any] = Field(default_factory=dict)

class TimeContext(BaseModel):
    local_time: datetime
    timezone: str
    day_of_week: str
    is_weekend: bool
    is_holiday: bool
    business_hours: bool
    time_category: str  # morning, afternoon, evening, night
    seasonal_context: str  # spring, summer, fall, winter

class UserContext(BaseModel):
    user_id: str
    role: str  # buyer, seller, vendor, admin
    preferences: Dict[str, Any] = Field(default_factory=dict)
    purchase_history: List[Dict[str, Any]] = Field(default_factory=list)
    behavioral_patterns: Dict[str, Any] = Field(default_factory=dict)
    loyalty_tier: str = "standard"  # standard, premium, luxury, elite
    language_preference: Optional[str] = None
    currency_preference: Optional[str] = None

class CurrencyContext(BaseModel):
    primary_currency: str
    exchange_rates: Dict[str, float] = Field(default_factory=dict)
    display_dual_currency: bool = False
    secondary_currency: Optional[str] = None
    local_tax_rate: float = 0.0
    payment_methods: List[str] = Field(default_factory=list)

class DeviceContext(BaseModel):
    device_type: str  # mobile, tablet, desktop
    platform: str  # ios, android, web
    screen_size: str  # small, medium, large
    connection_speed: str  # slow, medium, fast
    capabilities: List[str] = Field(default_factory=list)

class AwarenessProfile(BaseModel):
    session_id: str
    user_context: Optional[UserContext] = None
    location_context: Optional[LocationContext] = None
    time_context: Optional[TimeContext] = None
    currency_context: Optional[CurrencyContext] = None
    device_context: Optional[DeviceContext] = None
    language: str = "en"
    personalization_score: float = 0.0
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    privacy_settings: Dict[str, bool] = Field(default_factory=dict)

class AdaptiveResponse(BaseModel):
    ui_config: Dict[str, Any]
    content_adaptations: Dict[str, Any]
    pricing_adjustments: Dict[str, Any]
    language_pack: Dict[str, str]
    recommendations: List[Dict[str, Any]]
    notifications: List[Dict[str, Any]]

# Global awareness storage (in production, use Redis or dedicated cache)
awareness_profiles = {}

# Language packs for multi-language support
LANGUAGE_PACKS = {
    "en": {
        "welcome": "Welcome to AisleMarts",
        "cart": "Shopping Cart",
        "checkout": "Checkout",
        "search": "Search products",
        "profile": "My Profile",
        "orders": "My Orders",
        "deals": "Today's Deals",
        "live_sale": "Live Sale",
        "chat": "Messages",
        "currency": "Currency",
        "language": "Language"
    },
    "es": {
        "welcome": "Bienvenido a AisleMarts",
        "cart": "Carrito de Compras",
        "checkout": "Finalizar Compra",
        "search": "Buscar productos",
        "profile": "Mi Perfil",
        "orders": "Mis Pedidos",
        "deals": "Ofertas del Día",
        "live_sale": "Venta en Vivo",
        "chat": "Mensajes",
        "currency": "Moneda",
        "language": "Idioma"
    },
    "fr": {
        "welcome": "Bienvenue chez AisleMarts",
        "cart": "Panier d'Achat",
        "checkout": "Commander",
        "search": "Rechercher des produits",
        "profile": "Mon Profil",
        "orders": "Mes Commandes",
        "deals": "Offres du Jour",
        "live_sale": "Vente en Direct",
        "chat": "Messages",
        "currency": "Devise",
        "language": "Langue"
    },
    "de": {
        "welcome": "Willkommen bei AisleMarts",
        "cart": "Einkaufswagen",
        "checkout": "Zur Kasse",
        "search": "Produkte suchen",
        "profile": "Mein Profil",
        "orders": "Meine Bestellungen",
        "deals": "Heutige Angebote",
        "live_sale": "Live-Verkauf",
        "chat": "Nachrichten",
        "currency": "Währung",
        "language": "Sprache"
    },
    "zh": {
        "welcome": "欢迎来到AisleMarts",
        "cart": "购物车",
        "checkout": "结账",
        "search": "搜索产品",
        "profile": "我的资料",
        "orders": "我的订单",
        "deals": "今日优惠",
        "live_sale": "直播销售",
        "chat": "消息",
        "currency": "货币",
        "language": "语言"
    },
    "ja": {
        "welcome": "AisleMartsへようこそ",
        "cart": "ショッピングカート",
        "checkout": "チェックアウト",
        "search": "商品を検索",
        "profile": "マイプロフィール",
        "orders": "注文履歴",
        "deals": "本日のお得情報",
        "live_sale": "ライブセール",
        "chat": "メッセージ",
        "currency": "通貨",
        "language": "言語"
    },
    "ar": {
        "welcome": "مرحباً بك في AisleMarts",
        "cart": "عربة التسوق",
        "checkout": "الدفع",
        "search": "البحث عن المنتجات",
        "profile": "ملفي الشخصي",
        "orders": "طلباتي",
        "deals": "عروض اليوم",
        "live_sale": "البيع المباشر",
        "chat": "الرسائل",
        "currency": "العملة",
        "language": "اللغة"
    }
}

# Currency and country mappings
COUNTRY_CURRENCY_MAP = {
    "US": {"currency": "USD", "symbol": "$", "tax_rate": 0.08},
    "GB": {"currency": "GBP", "symbol": "£", "tax_rate": 0.20},
    "EU": {"currency": "EUR", "symbol": "€", "tax_rate": 0.19},
    "CA": {"currency": "CAD", "symbol": "C$", "tax_rate": 0.13},
    "AU": {"currency": "AUD", "symbol": "A$", "tax_rate": 0.10},
    "JP": {"currency": "JPY", "symbol": "¥", "tax_rate": 0.08},
    "CN": {"currency": "CNY", "symbol": "¥", "tax_rate": 0.13},
    "IN": {"currency": "INR", "symbol": "₹", "tax_rate": 0.18},
    "BR": {"currency": "BRL", "symbol": "R$", "tax_rate": 0.17},
    "MX": {"currency": "MXN", "symbol": "$", "tax_rate": 0.16},
    "KE": {"currency": "KES", "symbol": "KSh", "tax_rate": 0.16},
    "NG": {"currency": "NGN", "symbol": "₦", "tax_rate": 0.075},
    "ZA": {"currency": "ZAR", "symbol": "R", "tax_rate": 0.15},
    "AE": {"currency": "AED", "symbol": "د.إ", "tax_rate": 0.05},
    "SA": {"currency": "SAR", "symbol": "﷼", "tax_rate": 0.15}
}

@router.get("/health")
async def health_check():
    """Awareness Engine health check"""
    return {
        "service": "awareness_engine",
        "status": "operational",
        "capabilities": [
            "location_awareness",
            "time_awareness", 
            "user_awareness",
            "currency_awareness",
            "language_awareness",
            "device_awareness",
            "cultural_sensitivity",
            "real_time_adaptation"
        ],
        "active_profiles": len(awareness_profiles),
        "supported_languages": list(LANGUAGE_PACKS.keys()),
        "supported_currencies": list(set([v["currency"] for v in COUNTRY_CURRENCY_MAP.values()])),
        "last_update": datetime.utcnow().isoformat()
    }

@router.post("/detect-context", response_model=AwarenessProfile)
async def detect_user_context(
    request: Request,
    user_agent: Optional[str] = Header(None),
    accept_language: Optional[str] = Header(None),
    x_forwarded_for: Optional[str] = Header(None),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Detect and build comprehensive user context awareness"""
    try:
        # Generate session ID
        session_id = f"session_{current_user['_id']}_{int(datetime.utcnow().timestamp())}"
        
        # Detect location context
        location_context = await detect_location_context(request, x_forwarded_for)
        
        # Detect time context
        time_context = detect_time_context(location_context.timezone if location_context else "UTC")
        
        # Build user context
        user_context = UserContext(
            user_id=current_user["_id"],
            role=current_user.get("role", "buyer"),
            preferences=current_user.get("preferences", {}),
            purchase_history=current_user.get("purchase_history", []),
            behavioral_patterns=current_user.get("behavioral_patterns", {}),
            loyalty_tier=current_user.get("loyalty_tier", "standard"),
            language_preference=current_user.get("language_preference"),
            currency_preference=current_user.get("currency_preference")
        )
        
        # Detect currency context
        currency_context = detect_currency_context(location_context, user_context)
        
        # Detect device context
        device_context = detect_device_context(user_agent)
        
        # Detect language
        detected_language = detect_language(accept_language, location_context, user_context)
        
        # Calculate personalization score
        personalization_score = calculate_personalization_score(user_context, location_context, time_context)
        
        # Create awareness profile
        awareness_profile = AwarenessProfile(
            session_id=session_id,
            user_context=user_context,
            location_context=location_context,
            time_context=time_context,
            currency_context=currency_context,
            device_context=device_context,
            language=detected_language,
            personalization_score=personalization_score,
            privacy_settings={
                "location_sharing": True,
                "behavioral_tracking": True,
                "personalized_ads": True,
                "cross_device_sync": True
            }
        )
        
        # Store profile
        awareness_profiles[session_id] = awareness_profile
        
        logger.info(f"Context detected for user {current_user['_id']}: {detected_language}, {location_context.country if location_context else 'Unknown'}")
        
        return awareness_profile
        
    except Exception as e:
        logger.error(f"Context detection failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to detect user context")

@router.get("/adaptive-response/{session_id}", response_model=AdaptiveResponse)
async def get_adaptive_response(
    session_id: str,
    content_type: str = "homepage",  # homepage, product, checkout, etc.
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Generate adaptive response based on awareness profile"""
    try:
        if session_id not in awareness_profiles:
            raise HTTPException(status_code=404, detail="Awareness profile not found")
        
        profile = awareness_profiles[session_id]
        
        # Generate UI adaptations
        ui_config = generate_ui_adaptations(profile, content_type)
        
        # Generate content adaptations
        content_adaptations = generate_content_adaptations(profile, content_type)
        
        # Generate pricing adjustments
        pricing_adjustments = generate_pricing_adaptations(profile)
        
        # Get language pack
        language_pack = LANGUAGE_PACKS.get(profile.language, LANGUAGE_PACKS["en"])
        
        # Generate personalized recommendations
        recommendations = generate_contextual_recommendations(profile)
        
        # Generate contextual notifications
        notifications = generate_contextual_notifications(profile)
        
        return AdaptiveResponse(
            ui_config=ui_config,
            content_adaptations=content_adaptations,
            pricing_adjustments=pricing_adjustments,
            language_pack=language_pack,
            recommendations=recommendations,
            notifications=notifications
        )
        
    except Exception as e:
        logger.error(f"Adaptive response generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate adaptive response")

@router.put("/update-preferences/{session_id}")
async def update_user_preferences(
    session_id: str,
    preferences: Dict[str, Any],
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Update user preferences and awareness profile"""
    try:
        if session_id not in awareness_profiles:
            raise HTTPException(status_code=404, detail="Awareness profile not found")
        
        profile = awareness_profiles[session_id]
        
        # Update user preferences
        if profile.user_context:
            profile.user_context.preferences.update(preferences)
        
        # Update language if provided
        if "language" in preferences:
            profile.language = preferences["language"]
        
        # Update currency preference if provided
        if "currency" in preferences and profile.currency_context:
            profile.currency_context.primary_currency = preferences["currency"]
        
        # Update privacy settings if provided
        if "privacy_settings" in preferences:
            profile.privacy_settings.update(preferences["privacy_settings"])
        
        # Recalculate personalization score
        profile.personalization_score = calculate_personalization_score(
            profile.user_context, profile.location_context, profile.time_context
        )
        
        profile.last_updated = datetime.utcnow()
        
        return {
            "status": "updated",
            "session_id": session_id,
            "personalization_score": profile.personalization_score,
            "updated_preferences": list(preferences.keys())
        }
        
    except Exception as e:
        logger.error(f"Preference update failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update preferences")

@router.get("/currency-rates")
async def get_currency_rates(
    base_currency: str = "USD",
    target_currencies: Optional[str] = None
):
    """Get real-time currency exchange rates"""
    try:
        # In production, use a real currency API like exchangerate-api.com or fixer.io
        # For now, we'll provide mock rates
        mock_rates = {
            "USD": 1.0,
            "EUR": 0.85,
            "GBP": 0.73,
            "JPY": 110.0,
            "CAD": 1.25,
            "AUD": 1.35,
            "CNY": 6.45,
            "INR": 74.5,
            "BRL": 5.2,
            "MXN": 20.1,
            "KES": 108.0,
            "NGN": 411.0,
            "ZAR": 14.8,
            "AED": 3.67,
            "SAR": 3.75
        }
        
        if target_currencies:
            target_list = target_currencies.split(",")
            filtered_rates = {curr: rate for curr, rate in mock_rates.items() if curr in target_list}
        else:
            filtered_rates = mock_rates
        
        return {
            "base_currency": base_currency,
            "rates": filtered_rates,
            "last_updated": datetime.utcnow().isoformat(),
            "source": "mock_exchange_api"
        }
        
    except Exception as e:
        logger.error(f"Currency rates fetch failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get currency rates")

# Helper Functions

async def detect_location_context(request: Request, forwarded_for: Optional[str]) -> Optional[LocationContext]:
    """Detect user location from IP and headers"""
    try:
        # In production, use IP geolocation service
        # For now, we'll provide mock location based on common scenarios
        mock_locations = [
            LocationContext(
                country="United States",
                country_code="US",
                region="California",
                city="San Francisco",
                timezone="America/Los_Angeles",
                currency="USD",
                language="en",
                cultural_context={"date_format": "MM/DD/YYYY", "time_format": "12h"}
            ),
            LocationContext(
                country="United Kingdom",
                country_code="GB",
                region="England",
                city="London",
                timezone="Europe/London",
                currency="GBP",
                language="en",
                cultural_context={"date_format": "DD/MM/YYYY", "time_format": "24h"}
            ),
            LocationContext(
                country="Japan",
                country_code="JP",
                region="Tokyo",
                city="Tokyo",
                timezone="Asia/Tokyo",
                currency="JPY",
                language="ja",
                cultural_context={"date_format": "YYYY/MM/DD", "time_format": "24h"}
            )
        ]
        
        # Return first mock location (in production, use actual IP geolocation)
        return mock_locations[0]
        
    except Exception as e:
        logger.error(f"Location detection failed: {str(e)}")
        return None

def detect_time_context(timezone_str: str) -> TimeContext:
    """Detect time-based context"""
    try:
        tz = pytz.timezone(timezone_str)
        local_time = datetime.now(tz)
        
        day_of_week = local_time.strftime("%A")
        is_weekend = local_time.weekday() >= 5
        
        # Simple business hours check (9 AM - 6 PM)
        business_hours = 9 <= local_time.hour < 18 and not is_weekend
        
        # Time categories
        if 5 <= local_time.hour < 12:
            time_category = "morning"
        elif 12 <= local_time.hour < 17:
            time_category = "afternoon"
        elif 17 <= local_time.hour < 22:
            time_category = "evening"
        else:
            time_category = "night"
        
        # Season detection (Northern Hemisphere)
        month = local_time.month
        if month in [12, 1, 2]:
            seasonal_context = "winter"
        elif month in [3, 4, 5]:
            seasonal_context = "spring"
        elif month in [6, 7, 8]:
            seasonal_context = "summer"
        else:
            seasonal_context = "fall"
        
        return TimeContext(
            local_time=local_time,
            timezone=timezone_str,
            day_of_week=day_of_week,
            is_weekend=is_weekend,
            is_holiday=False,  # Would integrate with holiday API in production
            business_hours=business_hours,
            time_category=time_category,
            seasonal_context=seasonal_context
        )
        
    except Exception as e:
        logger.error(f"Time context detection failed: {str(e)}")
        # Fallback to UTC
        utc_time = datetime.utcnow()
        return TimeContext(
            local_time=utc_time,
            timezone="UTC",
            day_of_week=utc_time.strftime("%A"),
            is_weekend=utc_time.weekday() >= 5,
            is_holiday=False,
            business_hours=True,
            time_category="afternoon",
            seasonal_context="summer"
        )

def detect_currency_context(location_context: Optional[LocationContext], user_context: UserContext) -> CurrencyContext:
    """Detect currency and payment context"""
    try:
        if user_context.currency_preference:
            primary_currency = user_context.currency_preference
        elif location_context and location_context.country_code in COUNTRY_CURRENCY_MAP:
            primary_currency = COUNTRY_CURRENCY_MAP[location_context.country_code]["currency"]
        else:
            primary_currency = "USD"
        
        # Mock exchange rates (in production, fetch real rates)
        exchange_rates = {
            "USD": 1.0,
            "EUR": 0.85,
            "GBP": 0.73,
            "JPY": 110.0,
            "CAD": 1.25
        }
        
        # Determine tax rate
        tax_rate = 0.08  # Default
        if location_context and location_context.country_code in COUNTRY_CURRENCY_MAP:
            tax_rate = COUNTRY_CURRENCY_MAP[location_context.country_code]["tax_rate"]
        
        return CurrencyContext(
            primary_currency=primary_currency,
            exchange_rates=exchange_rates,
            display_dual_currency=primary_currency != "USD",
            secondary_currency="USD" if primary_currency != "USD" else None,
            local_tax_rate=tax_rate,
            payment_methods=["card", "digital_wallet", "bank_transfer"]
        )
        
    except Exception as e:
        logger.error(f"Currency context detection failed: {str(e)}")
        return CurrencyContext(primary_currency="USD", local_tax_rate=0.08)

def detect_device_context(user_agent: Optional[str]) -> DeviceContext:
    """Detect device and platform context"""
    try:
        if not user_agent:
            return DeviceContext(device_type="unknown", platform="web", screen_size="medium", connection_speed="medium")
        
        user_agent_lower = user_agent.lower()
        
        # Device type detection
        if "mobile" in user_agent_lower or "android" in user_agent_lower or "iphone" in user_agent_lower:
            device_type = "mobile"
            screen_size = "small"
        elif "tablet" in user_agent_lower or "ipad" in user_agent_lower:
            device_type = "tablet"
            screen_size = "medium"
        else:
            device_type = "desktop"
            screen_size = "large"
        
        # Platform detection
        if "android" in user_agent_lower:
            platform = "android"
        elif any(x in user_agent_lower for x in ["iphone", "ipad", "ios"]):
            platform = "ios"
        else:
            platform = "web"
        
        return DeviceContext(
            device_type=device_type,
            platform=platform,
            screen_size=screen_size,
            connection_speed="medium",  # Would detect from performance metrics in production
            capabilities=["touch", "camera", "location", "notifications"]
        )
        
    except Exception as e:
        logger.error(f"Device context detection failed: {str(e)}")
        return DeviceContext(device_type="unknown", platform="web", screen_size="medium", connection_speed="medium")

def detect_language(accept_language: Optional[str], location_context: Optional[LocationContext], user_context: UserContext) -> str:
    """Detect preferred language"""
    try:
        # Priority: User preference > Accept-Language header > Location > Default (English)
        if user_context.language_preference:
            return user_context.language_preference
        
        if accept_language:
            # Parse Accept-Language header (e.g., "en-US,en;q=0.9,es;q=0.8")
            languages = []
            for lang_pair in accept_language.split(","):
                lang = lang_pair.split(";")[0].strip()
                # Extract primary language code
                primary_lang = lang.split("-")[0].lower()
                if primary_lang in LANGUAGE_PACKS:
                    languages.append(primary_lang)
            
            if languages:
                return languages[0]
        
        if location_context and location_context.language in LANGUAGE_PACKS:
            return location_context.language
        
        return "en"  # Default to English
        
    except Exception as e:
        logger.error(f"Language detection failed: {str(e)}")
        return "en"

def calculate_personalization_score(user_context: Optional[UserContext], location_context: Optional[LocationContext], time_context: Optional[TimeContext]) -> float:
    """Calculate personalization strength score (0.0 to 1.0)"""
    try:
        score = 0.0
        
        if user_context:
            # User data availability
            if user_context.purchase_history:
                score += 0.3
            if user_context.preferences:
                score += 0.2
            if user_context.behavioral_patterns:
                score += 0.2
        
        if location_context:
            score += 0.15
            
        if time_context:
            score += 0.15
            
        return min(score, 1.0)
        
    except Exception as e:
        logger.error(f"Personalization score calculation failed: {str(e)}")
        return 0.5

def generate_ui_adaptations(profile: AwarenessProfile, content_type: str) -> Dict[str, Any]:
    """Generate UI adaptations based on awareness profile"""
    try:
        adaptations = {
            "theme": "luxury_dark",  # Default luxury theme
            "layout": "grid",
            "currency_display": profile.currency_context.primary_currency if profile.currency_context else "USD",
            "language": profile.language,
            "rtl_support": profile.language in ["ar", "he"],
            "time_format": "12h" if profile.location_context and profile.location_context.country_code == "US" else "24h"
        }
        
        # Device-specific adaptations
        if profile.device_context:
            if profile.device_context.device_type == "mobile":
                adaptations["layout"] = "list"
                adaptations["navigation"] = "bottom_tabs"
            elif profile.device_context.device_type == "desktop":
                adaptations["layout"] = "grid"
                adaptations["navigation"] = "sidebar"
        
        # Time-based adaptations
        if profile.time_context:
            if profile.time_context.time_category == "night":
                adaptations["theme"] = "luxury_dark"
            elif profile.time_context.time_category == "morning":
                adaptations["theme"] = "luxury_bright"
        
        return adaptations
        
    except Exception as e:
        logger.error(f"UI adaptations generation failed: {str(e)}")
        return {"theme": "luxury_dark", "layout": "grid", "currency_display": "USD", "language": "en"}

def generate_content_adaptations(profile: AwarenessProfile, content_type: str) -> Dict[str, Any]:
    """Generate content adaptations based on awareness profile"""
    try:
        adaptations = {
            "featured_products": [],
            "promotional_banners": [],
            "content_priorities": [],
            "cultural_adaptations": {}
        }
        
        # Time-based content
        if profile.time_context:
            if profile.time_context.time_category == "morning":
                adaptations["featured_products"].extend(["coffee", "breakfast", "workwear"])
            elif profile.time_context.time_category == "evening":
                adaptations["featured_products"].extend(["dining", "entertainment", "relaxation"])
            
            if profile.time_context.is_weekend:
                adaptations["promotional_banners"].append("weekend_deals")
        
        # Location-based content
        if profile.location_context:
            if profile.location_context.seasonal_context:
                adaptations["featured_products"].append(f"{profile.location_context.seasonal_context}_collection")
        
        # User behavior adaptations
        if profile.user_context:
            if profile.user_context.loyalty_tier == "luxury":
                adaptations["content_priorities"].append("exclusive_products")
            elif profile.user_context.loyalty_tier == "premium":
                adaptations["content_priorities"].append("premium_deals")
        
        return adaptations
        
    except Exception as e:
        logger.error(f"Content adaptations generation failed: {str(e)}")
        return {"featured_products": [], "promotional_banners": [], "content_priorities": []}

def generate_pricing_adaptations(profile: AwarenessProfile) -> Dict[str, Any]:
    """Generate pricing adaptations based on awareness profile"""
    try:
        adaptations = {
            "primary_currency": "USD",
            "show_tax_inclusive": False,
            "show_dual_currency": False,
            "dynamic_pricing": False,
            "local_shipping_rates": True
        }
        
        if profile.currency_context:
            adaptations["primary_currency"] = profile.currency_context.primary_currency
            adaptations["show_dual_currency"] = profile.currency_context.display_dual_currency
            adaptations["tax_rate"] = profile.currency_context.local_tax_rate
        
        if profile.location_context:
            # EU countries require tax-inclusive pricing
            if profile.location_context.country_code in ["GB", "DE", "FR", "IT", "ES"]:
                adaptations["show_tax_inclusive"] = True
        
        if profile.time_context:
            # Enable dynamic pricing during peak hours
            if profile.time_context.business_hours:
                adaptations["dynamic_pricing"] = True
        
        return adaptations
        
    except Exception as e:
        logger.error(f"Pricing adaptations generation failed: {str(e)}")
        return {"primary_currency": "USD", "show_tax_inclusive": False}

def generate_contextual_recommendations(profile: AwarenessProfile) -> List[Dict[str, Any]]:
    """Generate contextual product recommendations"""
    try:
        recommendations = []
        
        # Time-based recommendations
        if profile.time_context:
            if profile.time_context.time_category == "morning":
                recommendations.append({
                    "type": "time_based",
                    "title": "Morning Essentials",
                    "products": ["premium_coffee", "breakfast_set", "morning_skincare"],
                    "reason": "Perfect for your morning routine"
                })
            elif profile.time_context.is_weekend:
                recommendations.append({
                    "type": "time_based", 
                    "title": "Weekend Specials",
                    "products": ["leisure_wear", "home_entertainment", "gourmet_food"],
                    "reason": "Enjoy your weekend with these picks"
                })
        
        # Location-based recommendations
        if profile.location_context:
            recommendations.append({
                "type": "location_based",
                "title": f"Popular in {profile.location_context.city}",
                "products": ["local_favorites", "weather_appropriate", "cultural_items"],
                "reason": f"Trending now in {profile.location_context.city}"
            })
        
        # User behavior recommendations
        if profile.user_context and profile.user_context.purchase_history:
            recommendations.append({
                "type": "behavioral",
                "title": "Based on Your Style",
                "products": ["similar_items", "complementary_products", "upgrade_options"],
                "reason": "Matches your previous purchases"
            })
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Contextual recommendations generation failed: {str(e)}")
        return []

def generate_contextual_notifications(profile: AwarenessProfile) -> List[Dict[str, Any]]:
    """Generate contextual notifications"""
    try:
        notifications = []
        
        # Time-sensitive notifications
        if profile.time_context:
            if profile.time_context.time_category == "evening" and not profile.time_context.is_weekend:
                notifications.append({
                    "type": "promotion",
                    "title": "Evening Flash Sale",
                    "message": "20% off selected items - ends at midnight!",
                    "priority": "medium",
                    "expires_at": "23:59"
                })
        
        # Location-based notifications
        if profile.location_context:
            notifications.append({
                "type": "shipping",
                "title": "Fast Delivery Available",
                "message": f"Same-day delivery available in {profile.location_context.city}",
                "priority": "low"
            })
        
        # Currency notifications
        if profile.currency_context and profile.currency_context.primary_currency != "USD":
            notifications.append({
                "type": "currency",
                "title": "Currency Notice",
                "message": f"Prices shown in {profile.currency_context.primary_currency}",
                "priority": "low"
            })
        
        return notifications
        
    except Exception as e:
        logger.error(f"Contextual notifications generation failed: {str(e)}")
        return []