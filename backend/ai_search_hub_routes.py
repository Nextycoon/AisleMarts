from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime, timedelta
import uuid
import base64

from security import decode_access_token
from db import db
from ai_search_hub_service import ai_search_hub
from ai_search_hub_models import (
    SearchRequest, QuickSearchResponse, DeepSearchRequest, DeepSearchResponse,
    ImageReadRequest, ImageReadResponse, QRScanRequest, QRScanResponse,
    BarcodeScanRequest, BarcodeScanResponse, VoiceInputRequest, VoiceInputResponse,
    IntentAnalysisResponse, SearchHubAnalytics, UserPreferences
)

router = APIRouter(prefix="/api/search-hub", tags=["AI Search Hub"])

# Request/Response models for FastAPI
class QuickSearchRequestAPI(BaseModel):
    q: str
    locale: str = "en-US"
    currency: str = "USD"
    country: str = "US"
    filters: Dict[str, Any] = {}

class DeepSearchRequestAPI(BaseModel):
    objective: str
    time_horizon: Optional[str] = "current"
    regions: Optional[List[str]] = []
    evidence_required: Optional[bool] = False

class ImageReadRequestAPI(BaseModel):
    image_base64: str
    tasks: List[Literal["ocr", "translate", "extract_entities"]] = ["ocr", "extract_entities"]
    languages_hint: Optional[List[str]] = ["en"]

class QRScanRequestAPI(BaseModel):
    image_base64: str

class BarcodeScanRequestAPI(BaseModel):
    image_base64: str
    symbologies: List[Literal["EAN13", "UPC", "CODE128", "QR"]] = ["EAN13", "UPC"]

class VoiceInputRequestAPI(BaseModel):
    audio_base64: str
    language_hint: Optional[str] = "en"

class IntentAnalysisRequestAPI(BaseModel):
    query: str
    context: Dict[str, Any] = {}

class UserPreferencesAPI(BaseModel):
    preferred_tools: List[str] = ["quick_search"]
    default_currency: str = "USD"
    default_language: str = "en"
    privacy_settings: Dict[str, bool] = {
        "allow_camera": False,
        "allow_microphone": False,
        "save_search_history": True,
        "personalized_results": True
    }

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

async def get_current_user_required(authorization: str | None = Header(None)):
    """Extract user from auth token (required)"""
    if not authorization:
        raise HTTPException(401, "Missing Authorization header")
    
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
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {str(e)}")

async def log_search_analytics(tool_used: str, query: str, success: bool, latency_ms: int, user=None):
    """Helper to log search analytics"""
    try:
        analytics = {
            "_id": str(uuid.uuid4()),
            "user_id": str(user["_id"]) if user else None,
            "session_id": str(uuid.uuid4()),  # In production, maintain session
            "tool_used": tool_used,
            "query": query[:500],  # Limit query length
            "success": success,
            "latency_ms": latency_ms,
            "timestamp": datetime.utcnow(),
            "country": "US",  # Could be extracted from user or IP
            "language": "en"   # Could be extracted from user preferences
        }
        
        await ai_search_hub.log_analytics(analytics)
    except Exception as e:
        print(f"Analytics logging failed: {e}")

@router.post("/quick-search")
async def quick_search(
    request: QuickSearchRequestAPI,
    user = Depends(get_current_user_optional)
):
    """Fast AI-enhanced product search with filters"""
    start_time = datetime.utcnow()
    
    try:
        # Convert API request to service request
        search_request: SearchRequest = {
            "q": request.q,
            "locale": request.locale,
            "currency": request.currency,
            "country": request.country,
            "filters": request.filters
        }
        
        # Perform search
        result = await ai_search_hub.quick_search(search_request)
        
        # Log analytics
        latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await log_search_analytics("quick_search", request.q, True, latency_ms, user)
        
        return result
        
    except Exception as e:
        latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await log_search_analytics("quick_search", request.q, False, latency_ms, user)
        raise HTTPException(500, f"Quick search error: {str(e)}")

@router.post("/deep-search")
async def deep_search(
    request: DeepSearchRequestAPI,
    user = Depends(get_current_user_optional)
):
    """AI-powered deep market analysis and insights"""
    start_time = datetime.utcnow()
    
    try:
        # Convert API request to service request
        deep_request: DeepSearchRequest = {
            "objective": request.objective,
            "time_horizon": request.time_horizon,
            "regions": request.regions,
            "evidence_required": request.evidence_required
        }
        
        # Perform deep search
        result = await ai_search_hub.deep_search(deep_request)
        
        # Log analytics
        latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await log_search_analytics("deep_search", request.objective, True, latency_ms, user)
        
        return result
        
    except Exception as e:
        latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await log_search_analytics("deep_search", request.objective, False, latency_ms, user)
        raise HTTPException(500, f"Deep search error: {str(e)}")

@router.post("/image-read")
async def image_read(
    request: ImageReadRequestAPI,
    user = Depends(get_current_user_optional)
):
    """OCR and entity extraction from images"""
    start_time = datetime.utcnow()
    
    try:
        # Convert API request to service request
        image_request: ImageReadRequest = {
            "image_ref": request.image_base64,
            "tasks": request.tasks,
            "languages_hint": request.languages_hint
        }
        
        # Process image
        result = await ai_search_hub.image_read(image_request)
        
        # Log analytics
        latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await log_search_analytics("image_read", f"Image OCR ({len(request.tasks)} tasks)", True, latency_ms, user)
        
        return result
        
    except Exception as e:
        latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await log_search_analytics("image_read", "Image OCR failed", False, latency_ms, user)
        raise HTTPException(500, f"Image read error: {str(e)}")

@router.post("/qr-scan")
async def qr_scan(
    request: QRScanRequestAPI,
    user = Depends(get_current_user_optional)
):
    """QR code scanning and intent detection"""
    start_time = datetime.utcnow()
    
    try:
        # Convert API request to service request
        qr_request: QRScanRequest = {
            "image_ref": request.image_base64
        }
        
        # Scan QR code
        result = await ai_search_hub.qr_scan(qr_request)
        
        # Log analytics
        latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await log_search_analytics("qr_scan", f"QR: {result.get('intent_guess', 'unknown')}", True, latency_ms, user)
        
        return result
        
    except Exception as e:
        latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await log_search_analytics("qr_scan", "QR scan failed", False, latency_ms, user)
        raise HTTPException(500, f"QR scan error: {str(e)}")

@router.post("/barcode-scan")
async def barcode_scan(
    request: BarcodeScanRequestAPI,
    user = Depends(get_current_user_optional)
):
    """Barcode scanning and product lookup"""
    start_time = datetime.utcnow()
    
    try:
        # Convert API request to service request
        barcode_request: BarcodeScanRequest = {
            "image_ref": request.image_base64,
            "symbologies": request.symbologies
        }
        
        # Scan barcode
        result = await ai_search_hub.barcode_scan(barcode_request)
        
        # Log analytics
        latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await log_search_analytics("barcode_scan", f"Barcode: {result.get('symbology', 'unknown')}", True, latency_ms, user)
        
        return result
        
    except Exception as e:
        latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await log_search_analytics("barcode_scan", "Barcode scan failed", False, latency_ms, user)
        raise HTTPException(500, f"Barcode scan error: {str(e)}")

@router.post("/voice-input")
async def voice_input(
    request: VoiceInputRequestAPI,
    user = Depends(get_current_user_optional)
):
    """Speech-to-text processing"""
    start_time = datetime.utcnow()
    
    try:
        # Convert API request to service request
        voice_request: VoiceInputRequest = {
            "audio_ref": request.audio_base64,
            "language_hint": request.language_hint
        }
        
        # Process voice input
        result = await ai_search_hub.voice_input(voice_request)
        
        # Log analytics
        latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await log_search_analytics("voice_input", f"Voice ({result.get('language', 'unknown')})", True, latency_ms, user)
        
        return result
        
    except Exception as e:
        latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        await log_search_analytics("voice_input", "Voice input failed", False, latency_ms, user)
        raise HTTPException(500, f"Voice input error: {str(e)}")

@router.post("/analyze-intent")
async def analyze_intent(
    request: IntentAnalysisRequestAPI,
    user = Depends(get_current_user_optional)
):
    """Analyze user intent and suggest appropriate tools"""
    try:
        result = await ai_search_hub.analyze_intent(request.query, request.context)
        return result
        
    except Exception as e:
        raise HTTPException(500, f"Intent analysis error: {str(e)}")

@router.get("/user-preferences")
async def get_user_preferences(user = Depends(get_current_user_required)):
    """Get user search preferences"""
    try:
        preferences = await ai_search_hub.get_user_preferences(str(user["_id"]))
        
        if not preferences:
            # Return default preferences
            return {
                "preferred_tools": ["quick_search"],
                "default_currency": "USD",
                "default_language": "en",
                "privacy_settings": {
                    "allow_camera": False,
                    "allow_microphone": False,
                    "save_search_history": True,
                    "personalized_results": True
                }
            }
        
        return preferences
        
    except Exception as e:
        raise HTTPException(500, f"Error fetching preferences: {str(e)}")

@router.post("/user-preferences")
async def update_user_preferences(
    preferences: UserPreferencesAPI,
    user = Depends(get_current_user_required)
):
    """Update user search preferences"""
    try:
        user_prefs: UserPreferences = {
            "_id": str(uuid.uuid4()),
            "user_id": str(user["_id"]),
            "preferred_tools": preferences.preferred_tools,
            "default_currency": preferences.default_currency,
            "default_language": preferences.default_language,
            "privacy_settings": preferences.privacy_settings,
            "last_updated": datetime.utcnow()
        }
        
        await ai_search_hub.save_user_preferences(user_prefs)
        
        return {"status": "success", "message": "Preferences updated"}
        
    except Exception as e:
        raise HTTPException(500, f"Error updating preferences: {str(e)}")

@router.get("/analytics")
async def get_search_analytics(
    days: int = 7,
    user = Depends(get_current_user_required)
):
    """Get search analytics (admin only or user's own data)"""
    try:
        is_admin = "admin" in user.get("roles", [])
        
        # Build query filter
        filter_query = {}
        if not is_admin:
            filter_query["user_id"] = str(user["_id"])
        
        # Add time filter
        start_date = datetime.utcnow() - timedelta(days=days)
        filter_query["timestamp"] = {"$gte": start_date}
        
        # Get analytics data
        analytics_cursor = db().search_hub_analytics.find(filter_query).sort("timestamp", -1)
        analytics = await analytics_cursor.to_list(length=1000)
        
        # Calculate summary statistics
        total_searches = len(analytics)
        successful_searches = len([a for a in analytics if a.get("success", False)])
        success_rate = successful_searches / total_searches if total_searches > 0 else 0
        
        # Tool usage statistics
        tool_usage = {}
        for a in analytics:
            tool = a.get("tool_used", "unknown")
            if tool not in tool_usage:
                tool_usage[tool] = {"count": 0, "success_count": 0}
            tool_usage[tool]["count"] += 1
            if a.get("success", False):
                tool_usage[tool]["success_count"] += 1
        
        # Calculate tool success rates
        for tool, stats in tool_usage.items():
            stats["success_rate"] = stats["success_count"] / stats["count"] if stats["count"] > 0 else 0
        
        return {
            "summary": {
                "total_searches": total_searches,
                "successful_searches": successful_searches,
                "success_rate": round(success_rate, 3),
                "time_period_days": days
            },
            "tool_usage": tool_usage,
            "recent_searches": analytics[:10]  # Last 10 searches
        }
        
    except Exception as e:
        raise HTTPException(500, f"Analytics error: {str(e)}")

@router.get("/health")
async def search_hub_health():
    """Health check for AI Search Hub"""
    try:
        # Check database connections
        analytics_count = await db().search_hub_analytics.count_documents({})
        preferences_count = await db().user_search_preferences.count_documents({})
        
        return {
            "status": "healthy",
            "services": {
                "ai_search_hub": {"status": "ok"},
                "analytics": {"count": analytics_count, "status": "ok"},
                "user_preferences": {"count": preferences_count, "status": "ok"},
                "emergent_llm": {"status": "ok"}
            },
            "tools": {
                "quick_search": {"status": "ok"},
                "deep_search": {"status": "ok"},
                "image_read": {"status": "ok"},
                "qr_scan": {"status": "ok"},
                "barcode_scan": {"status": "ok"},
                "voice_input": {"status": "ok"}
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# File upload endpoint for images/audio
@router.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...),
    user = Depends(get_current_user_optional)
):
    """Upload file (image/audio) and return base64 for processing"""
    try:
        # Read file content
        content = await file.read()
        
        # Convert to base64
        base64_content = base64.b64encode(content).decode('utf-8')
        
        # Add MIME type prefix for proper handling
        if file.content_type:
            if file.content_type.startswith('image/'):
                base64_content = f"data:{file.content_type};base64,{base64_content}"
            elif file.content_type.startswith('audio/'):
                base64_content = f"data:{file.content_type};base64,{base64_content}"
        
        return {
            "base64_content": base64_content,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(content)
        }
        
    except Exception as e:
        raise HTTPException(500, f"File upload error: {str(e)}")