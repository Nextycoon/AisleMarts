"""
AisleMarts Affiliate Marketing Router - Creator Monetization System
Implements comprehensive affiliate tracking, commission management, and creator earnings
Zero-commission platform with full creator revenue sharing
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime, timedelta
from enum import Enum
import json
import hashlib
import secrets

router = APIRouter()

class CampaignStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    EXPIRED = "expired"

class LinkStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    DISABLED = "disabled"

class EventType(str, Enum):
    CLICK = "click"
    VIEW = "view"
    ADD_TO_CART = "add_to_cart"
    PURCHASE = "purchase"
    REFUND = "refund"

class CreatorTier(str, Enum):
    VERIFIED = "verified"
    PRO = "pro"
    ELITE = "elite"

# Models
class CampaignModel(BaseModel):
    type: str = "percentage"  # percentage, fixed, tiered
    base_rate_bps: int = Field(ge=0, le=10000)  # basis points (1500 = 15%)
    tier_bonuses: Dict[str, int] = {}  # tier -> additional bps
    product_categories: List[str] = []  # specific categories
    min_order_value: Optional[float] = None

class AffiliateCampaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    seller_id: str
    seller_name: str
    name: str
    description: str
    model: CampaignModel
    open_collaboration: bool = True  # true = any creator can join
    invited_creators: List[str] = []  # specific creator IDs for targeted campaigns
    product_ids: List[str] = []  # specific products (empty = all seller products)
    status: CampaignStatus = CampaignStatus.ACTIVE
    start_date: datetime
    end_date: Optional[datetime] = None
    total_clicks: int = 0
    total_conversions: int = 0
    total_gmv: float = 0.0
    total_commissions: float = 0.0
    created_at: datetime = Field(default_factory=datetime.now)

class AffiliateLink(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    campaign_id: str
    creator_id: str
    creator_name: str
    creator_tier: CreatorTier = CreatorTier.VERIFIED
    code: str  # unique tracking code
    url: str   # full tracking URL
    clicks: int = 0
    conversions: int = 0
    gmv: float = 0.0
    commissions_earned: float = 0.0
    status: LinkStatus = LinkStatus.ACTIVE
    created_at: datetime = Field(default_factory=datetime.now)
    last_click: Optional[datetime] = None

class AffiliateEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    link_id: str
    event_type: EventType
    user_id: Optional[str] = None
    order_id: Optional[str] = None
    product_id: Optional[str] = None
    amount: Optional[float] = None
    commission_amount: Optional[float] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

class CreatorStats(BaseModel):
    creator_id: str
    creator_name: str
    creator_tier: CreatorTier
    total_clicks: int = 0
    total_conversions: int = 0
    conversion_rate: float = 0.0
    total_gmv: float = 0.0
    total_commissions: float = 0.0
    active_links: int = 0
    top_product: Optional[str] = None
    last_30_days_gmv: float = 0.0

# Request Models
class CreateCampaignRequest(BaseModel):
    name: str = Field(max_length=200)
    description: str = Field(max_length=1000)
    base_rate_bps: int = Field(ge=100, le=5000)  # 1% to 50%
    open_collaboration: bool = True
    invited_creators: List[str] = []
    product_ids: List[str] = []
    end_date: Optional[datetime] = None

class CreateLinkRequest(BaseModel):
    campaign_id: str
    custom_code: Optional[str] = None  # custom tracking code

# Mock Database
CAMPAIGNS_DB: Dict[str, AffiliateCampaign] = {}
LINKS_DB: Dict[str, AffiliateLink] = {}
EVENTS_DB: List[AffiliateEvent] = []

# Code mapping for URL generation
CODE_TO_LINK: Dict[str, str] = {}

def generate_tracking_code() -> str:
    """Generate unique tracking code"""
    return secrets.token_urlsafe(8)

def generate_tracking_url(code: str, base_url: str = "https://aislemarts.app") -> str:
    """Generate full tracking URL"""
    return f"{base_url}/ref/{code}"

def calculate_commission(amount: float, campaign: AffiliateCampaign, creator_tier: CreatorTier) -> float:
    """Calculate commission based on campaign model and creator tier"""
    base_rate_bps = campaign.model.base_rate_bps
    
    # Apply tier bonus
    tier_bonus = campaign.model.tier_bonuses.get(creator_tier.value, 0)
    total_rate_bps = base_rate_bps + tier_bonus
    
    # Convert basis points to percentage (10000 bps = 100%)
    commission = amount * (total_rate_bps / 10000)
    
    return round(commission, 2)

# Initialize sample data
def init_sample_affiliate_data():
    """Initialize sample campaigns, links, and events"""
    # Sample campaigns
    sample_campaigns = [
        AffiliateCampaign(
            id="camp_fashion_001",
            seller_id="seller_fashion_co",
            seller_name="@FashionCo",
            name="Designer Collection Spring 2025",
            description="Promote our latest designer collection with premium commissions for top performers.",
            model=CampaignModel(
                base_rate_bps=2000,  # 20%
                tier_bonuses={
                    "pro": 300,      # +3% for Pro creators
                    "elite": 500     # +5% for Elite creators
                },
                min_order_value=50.0
            ),
            open_collaboration=True,
            product_ids=["prod_fashion_jacket_002"],
            start_date=datetime.now() - timedelta(days=30),
            end_date=datetime.now() + timedelta(days=60),
            total_clicks=1247,
            total_conversions=89,
            total_gmv=12450.00,
            total_commissions=2490.00
        ),
        AffiliateCampaign(
            id="camp_beauty_001",
            seller_id="seller_beauty_brand", 
            seller_name="@BeautyBrand",
            name="Matte Lipstick Launch Campaign",
            description="Exclusive launch campaign for our new matte liquid lipstick line. High conversion rates guaranteed!",
            model=CampaignModel(
                base_rate_bps=2500,  # 25%
                tier_bonuses={
                    "verified": 0,
                    "pro": 250,      # +2.5%
                    "elite": 500     # +5%
                }
            ),
            open_collaboration=False,  # Targeted campaign
            invited_creators=["creator_beauty_001", "creator_lifestyle_001"],
            product_ids=["prod_beauty_lipstick_004"],
            start_date=datetime.now() - timedelta(days=15),
            end_date=datetime.now() + timedelta(days=45),
            total_clicks=856,
            total_conversions=134,
            total_gmv=3348.00,
            total_commissions=837.00
        ),
        AffiliateCampaign(
            id="camp_tech_001",
            seller_id="seller_tech_luxury",
            seller_name="@TechLuxury", 
            name="Premium Smartwatch Affiliate Program",
            description="Ongoing affiliate program for our luxury smartwatch collection. Perfect for tech and lifestyle creators.",
            model=CampaignModel(
                base_rate_bps=1500,  # 15%
                tier_bonuses={
                    "pro": 200,      # +2%
                    "elite": 400     # +4%
                },
                min_order_value=200.0
            ),
            open_collaboration=True,
            product_ids=["prod_luxury_watch_001"],
            start_date=datetime.now() - timedelta(days=45),
            total_clicks=2341,
            total_conversions=156,
            total_gmv=46788.00,
            total_commissions=7018.20
        )
    ]
    
    for campaign in sample_campaigns:
        CAMPAIGNS_DB[campaign.id] = campaign
    
    # Sample affiliate links
    sample_links = [
        AffiliateLink(
            id="link_001",
            campaign_id="camp_fashion_001",
            creator_id="creator_fashion_001",
            creator_name="@StyleInfluencer",
            creator_tier=CreatorTier.PRO,
            code="STYLE2025",
            url=generate_tracking_url("STYLE2025"),
            clicks=456,
            conversions=34,
            gmv=6460.00,
            commissions_earned=1520.60,
            last_click=datetime.now() - timedelta(hours=2)
        ),
        AffiliateLink(
            id="link_002",
            campaign_id="camp_beauty_001",
            creator_id="creator_beauty_001", 
            creator_name="@BeautyGuru",
            creator_tier=CreatorTier.ELITE,
            code="BEAUTY30",
            url=generate_tracking_url("BEAUTY30"),
            clicks=623,
            conversions=98,
            gmv=2450.20,
            commissions_earned=735.06,
            last_click=datetime.now() - timedelta(minutes=15)
        ),
        AffiliateLink(
            id="link_003",
            campaign_id="camp_tech_001",
            creator_id="creator_tech_001",
            creator_name="@TechReviewer",
            creator_tier=CreatorTier.ELITE,
            code="TECHWAT",
            url=generate_tracking_url("TECHWAT"),
            clicks=1205,
            conversions=87,
            gmv=26073.00,
            commissions_earned=4961.87,
            last_click=datetime.now() - timedelta(hours=1)
        ),
        AffiliateLink(
            id="link_004",
            campaign_id="camp_fashion_001",
            creator_id="creator_lifestyle_001",
            creator_name="@LifestyleBlogger", 
            creator_tier=CreatorTier.VERIFIED,
            code="LIFE2025",
            url=generate_tracking_url("LIFE2025"),
            clicks=298,
            conversions=19,
            gmv=3610.00,
            commissions_earned=722.00,
            last_click=datetime.now() - timedelta(hours=6)
        )
    ]
    
    for link in sample_links:
        LINKS_DB[link.id] = link
        CODE_TO_LINK[link.code] = link.id
    
    # Sample affiliate events (recent activity)
    sample_events = [
        AffiliateEvent(
            link_id="link_002",
            event_type=EventType.PURCHASE,
            order_id="ord_affiliate_001",
            amount=74.97,
            commission_amount=26.24,
            created_at=datetime.now() - timedelta(minutes=15)
        ),
        AffiliateEvent(
            link_id="link_003", 
            event_type=EventType.CLICK,
            created_at=datetime.now() - timedelta(hours=1)
        ),
        AffiliateEvent(
            link_id="link_001",
            event_type=EventType.ADD_TO_CART,
            product_id="prod_fashion_jacket_002",
            created_at=datetime.now() - timedelta(hours=2)
        ),
        AffiliateEvent(
            link_id="link_004",
            event_type=EventType.PURCHASE,
            order_id="ord_affiliate_002", 
            amount=189.99,
            commission_amount=37.99,
            created_at=datetime.now() - timedelta(hours=6)
        )
    ]
    
    EVENTS_DB.extend(sample_events)

# Initialize sample data
init_sample_affiliate_data()

async def track_affiliate_event(event_type: str, data: Dict[str, Any]):
    """Track affiliate events for analytics"""
    event = {
        "event": event_type,
        "timestamp": datetime.now().isoformat(),
        "data": data
    }
    print(f"🎯 Affiliate Event: {event}")

# Campaign Management Endpoints
@router.post("/api/affiliate/campaigns", tags=["affiliate_campaigns"])
async def create_campaign(request: CreateCampaignRequest, seller_id: str = "demo_seller"):
    """Create new affiliate campaign"""
    campaign = AffiliateCampaign(
        seller_id=seller_id,
        seller_name="Demo Seller Co",
        name=request.name,
        description=request.description,
        model=CampaignModel(base_rate_bps=request.base_rate_bps),
        open_collaboration=request.open_collaboration,
        invited_creators=request.invited_creators,
        product_ids=request.product_ids,
        start_date=datetime.now(),
        end_date=request.end_date
    )
    
    CAMPAIGNS_DB[campaign.id] = campaign
    
    await track_affiliate_event("campaign_created", {
        "campaign_id": campaign.id,
        "seller_id": seller_id,
        "base_rate_bps": request.base_rate_bps,
        "open_collaboration": request.open_collaboration
    })
    
    return {"success": True, "campaign": campaign}

@router.get("/api/affiliate/campaigns", tags=["affiliate_campaigns"])
async def list_campaigns(
    seller_id: Optional[str] = None,
    status: Optional[CampaignStatus] = None,
    open_only: bool = False,
    limit: int = 20
):
    """List affiliate campaigns"""
    campaigns = list(CAMPAIGNS_DB.values())
    
    # Filter by seller
    if seller_id:
        campaigns = [c for c in campaigns if c.seller_id == seller_id]
    
    # Filter by status
    if status:
        campaigns = [c for c in campaigns if c.status == status]
    
    # Filter open collaboration only
    if open_only:
        campaigns = [c for c in campaigns if c.open_collaboration]
    
    # Sort by created date
    campaigns.sort(key=lambda x: x.created_at, reverse=True)
    
    # Limit results
    campaigns = campaigns[:limit]
    
    return {"campaigns": campaigns, "total": len(campaigns)}

@router.get("/api/affiliate/campaigns/{campaign_id}", tags=["affiliate_campaigns"])
async def get_campaign(campaign_id: str):
    """Get campaign details with performance metrics"""
    if campaign_id not in CAMPAIGNS_DB:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    campaign = CAMPAIGNS_DB[campaign_id]
    
    # Get associated links
    campaign_links = [link for link in LINKS_DB.values() if link.campaign_id == campaign_id]
    
    # Calculate performance metrics
    total_creators = len(campaign_links)
    avg_conversion_rate = (campaign.total_conversions / campaign.total_clicks * 100) if campaign.total_clicks > 0 else 0
    avg_order_value = (campaign.total_gmv / campaign.total_conversions) if campaign.total_conversions > 0 else 0
    
    return {
        "campaign": campaign,
        "performance": {
            "total_creators": total_creators,
            "avg_conversion_rate": round(avg_conversion_rate, 2),
            "avg_order_value": round(avg_order_value, 2),
            "commission_rate": campaign.model.base_rate_bps / 100  # Convert to percentage
        },
        "top_creators": sorted(campaign_links, key=lambda x: x.gmv, reverse=True)[:5]
    }

# Creator Link Management
@router.post("/api/affiliate/links", tags=["affiliate_links"])
async def create_affiliate_link(request: CreateLinkRequest, creator_id: str = "demo_creator"):
    """Create affiliate link for creator"""
    if request.campaign_id not in CAMPAIGNS_DB:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    campaign = CAMPAIGNS_DB[request.campaign_id]
    
    # Check if campaign allows this creator
    if not campaign.open_collaboration and creator_id not in campaign.invited_creators:
        raise HTTPException(status_code=403, detail="Not invited to this campaign")
    
    # Check if creator already has link for this campaign
    existing_link = next((link for link in LINKS_DB.values() 
                         if link.campaign_id == request.campaign_id and link.creator_id == creator_id), None)
    
    if existing_link:
        return {"success": True, "link": existing_link, "message": "Link already exists"}
    
    # Generate tracking code
    tracking_code = request.custom_code or generate_tracking_code()
    
    # Ensure code is unique
    while tracking_code in CODE_TO_LINK:
        tracking_code = generate_tracking_code()
    
    link = AffiliateLink(
        campaign_id=request.campaign_id,
        creator_id=creator_id,
        creator_name="Demo Creator",
        creator_tier=CreatorTier.PRO,
        code=tracking_code,
        url=generate_tracking_url(tracking_code)
    )
    
    LINKS_DB[link.id] = link
    CODE_TO_LINK[tracking_code] = link.id
    
    await track_affiliate_event("link_created", {
        "link_id": link.id,
        "campaign_id": request.campaign_id,
        "creator_id": creator_id,
        "tracking_code": tracking_code
    })
    
    return {"success": True, "link": link}

@router.get("/api/affiliate/creators/{creator_id}/links", tags=["affiliate_links"])
async def get_creator_links(creator_id: str):
    """Get all affiliate links for a creator"""
    creator_links = [link for link in LINKS_DB.values() if link.creator_id == creator_id]
    creator_links.sort(key=lambda x: x.created_at, reverse=True)
    
    # Calculate total stats
    total_stats = {
        "total_clicks": sum(link.clicks for link in creator_links),
        "total_conversions": sum(link.conversions for link in creator_links),
        "total_gmv": sum(link.gmv for link in creator_links),
        "total_commissions": sum(link.commissions_earned for link in creator_links),
        "avg_conversion_rate": 0
    }
    
    if total_stats["total_clicks"] > 0:
        total_stats["avg_conversion_rate"] = round(
            (total_stats["total_conversions"] / total_stats["total_clicks"]) * 100, 2
        )
    
    return {
        "links": creator_links,
        "total_links": len(creator_links),
        "stats": total_stats
    }

# Tracking and Analytics
@router.get("/api/affiliate/track/{tracking_code}", tags=["affiliate_tracking"])
async def track_click(tracking_code: str, user_id: Optional[str] = None, ip: Optional[str] = None):
    """Track affiliate click (redirect endpoint)"""
    if tracking_code not in CODE_TO_LINK:
        raise HTTPException(status_code=404, detail="Invalid tracking code")
    
    link_id = CODE_TO_LINK[tracking_code]
    link = LINKS_DB[link_id]
    
    # Record click event
    event = AffiliateEvent(
        link_id=link_id,
        event_type=EventType.CLICK,
        user_id=user_id,
        ip_address=ip
    )
    EVENTS_DB.append(event)
    
    # Update link stats
    link.clicks += 1
    link.last_click = datetime.now()
    
    # Update campaign stats
    campaign = CAMPAIGNS_DB[link.campaign_id]
    campaign.total_clicks += 1
    
    await track_affiliate_event("affiliate_click", {
        "link_id": link_id,
        "tracking_code": tracking_code,
        "creator_id": link.creator_id,
        "campaign_id": link.campaign_id
    })
    
    # Return redirect URL (in real implementation, this would be a 302 redirect)
    return {
        "redirect_to": "https://aislemarts.app/shop",
        "tracking_code": tracking_code,
        "creator": link.creator_name
    }

@router.post("/api/affiliate/track/purchase", tags=["affiliate_tracking"])
async def track_purchase(
    order_id: str,
    tracking_code: str,
    amount: float,
    product_ids: List[str] = []
):
    """Track affiliate purchase conversion"""
    if tracking_code not in CODE_TO_LINK:
        raise HTTPException(status_code=404, detail="Invalid tracking code")
    
    link_id = CODE_TO_LINK[tracking_code]
    link = LINKS_DB[link_id]
    campaign = CAMPAIGNS_DB[link.campaign_id]
    
    # Calculate commission
    commission = calculate_commission(amount, campaign, link.creator_tier)
    
    # Record purchase event
    event = AffiliateEvent(
        link_id=link_id,
        event_type=EventType.PURCHASE,
        order_id=order_id,
        amount=amount,
        commission_amount=commission
    )
    EVENTS_DB.append(event)
    
    # Update link stats
    link.conversions += 1
    link.gmv += amount
    link.commissions_earned += commission
    
    # Update campaign stats
    campaign.total_conversions += 1
    campaign.total_gmv += amount
    campaign.total_commissions += commission
    
    await track_affiliate_event("affiliate_purchase", {
        "link_id": link_id,
        "order_id": order_id,
        "amount": amount,
        "commission": commission,
        "creator_id": link.creator_id,
        "campaign_id": link.campaign_id
    })
    
    return {
        "success": True,
        "commission_earned": commission,
        "tracking_code": tracking_code,
        "creator": link.creator_name
    }

@router.get("/api/affiliate/analytics/creators", tags=["affiliate_analytics"])
async def get_creators_leaderboard(limit: int = 10, timeframe_days: int = 30):
    """Get top performing creators leaderboard"""
    cutoff_date = datetime.now() - timedelta(days=timeframe_days)
    
    # Get recent events
    recent_events = [e for e in EVENTS_DB if e.created_at >= cutoff_date]
    
    # Calculate creator stats
    creator_stats = {}
    for event in recent_events:
        link = LINKS_DB.get(event.link_id)
        if not link:
            continue
            
        creator_id = link.creator_id
        if creator_id not in creator_stats:
            creator_stats[creator_id] = CreatorStats(
                creator_id=creator_id,
                creator_name=link.creator_name,
                creator_tier=link.creator_tier
            )
        
        stats = creator_stats[creator_id]
        
        if event.event_type == EventType.CLICK:
            stats.total_clicks += 1
        elif event.event_type == EventType.PURCHASE:
            stats.total_conversions += 1
            stats.total_gmv += event.amount or 0
            stats.total_commissions += event.commission_amount or 0
    
    # Calculate conversion rates and sort
    leaderboard = []
    for stats in creator_stats.values():
        if stats.total_clicks > 0:
            stats.conversion_rate = (stats.total_conversions / stats.total_clicks) * 100
        leaderboard.append(stats)
    
    leaderboard.sort(key=lambda x: x.total_commissions, reverse=True)
    
    return {
        "leaderboard": leaderboard[:limit],
        "timeframe_days": timeframe_days,
        "total_creators": len(leaderboard)
    }

@router.get("/api/affiliate/analytics/performance", tags=["affiliate_analytics"])
async def get_performance_analytics(days: int = 30):
    """Get overall affiliate program performance"""
    cutoff_date = datetime.now() - timedelta(days=days)
    
    recent_events = [e for e in EVENTS_DB if e.created_at >= cutoff_date]
    
    # Calculate metrics
    total_clicks = len([e for e in recent_events if e.event_type == EventType.CLICK])
    total_purchases = len([e for e in recent_events if e.event_type == EventType.PURCHASE])
    total_revenue = sum(e.amount for e in recent_events if e.event_type == EventType.PURCHASE and e.amount)
    total_commissions = sum(e.commission_amount for e in recent_events if e.commission_amount)
    
    conversion_rate = (total_purchases / total_clicks * 100) if total_clicks > 0 else 0
    avg_order_value = (total_revenue / total_purchases) if total_purchases > 0 else 0
    commission_rate = (total_commissions / total_revenue * 100) if total_revenue > 0 else 0
    
    return {
        "period_days": days,
        "metrics": {
            "total_clicks": total_clicks,
            "total_conversions": total_purchases,
            "conversion_rate_percent": round(conversion_rate, 2),
            "total_revenue": round(total_revenue, 2),
            "total_commissions_paid": round(total_commissions, 2),
            "avg_order_value": round(avg_order_value, 2),
            "avg_commission_rate_percent": round(commission_rate, 2)
        },
        "active_campaigns": len([c for c in CAMPAIGNS_DB.values() if c.status == CampaignStatus.ACTIVE]),
        "active_creators": len(set(link.creator_id for link in LINKS_DB.values() if link.status == LinkStatus.ACTIVE))
    }

# Health check
@router.get("/api/affiliate/health", tags=["health"])
async def affiliate_health():
    """Affiliate system health check"""
    return {
        "status": "healthy",
        "service": "AisleMarts Affiliate System",
        "version": "1.0.0",
        "stats": {
            "campaigns": len(CAMPAIGNS_DB),
            "active_campaigns": len([c for c in CAMPAIGNS_DB.values() if c.status == CampaignStatus.ACTIVE]),
            "affiliate_links": len(LINKS_DB),
            "total_events": len(EVENTS_DB),
            "unique_creators": len(set(link.creator_id for link in LINKS_DB.values()))
        },
        "timestamp": datetime.now().isoformat()
    }