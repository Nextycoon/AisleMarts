from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

from services.super_app_service import SuperAppEcosystemService
from models.super_app import (
    AisleWallet, PaymentTransaction, SuperAppService, SuperAppMetrics,
    WalletTopUpRequest, P2PTransferRequest, BillPaymentRequest,
    ServiceBookingRequest, AIAssistantRequest, UserLifestyleProfile
)

router = APIRouter()
super_app_service = SuperAppEcosystemService()


@router.get("/health")
async def health_check():
    """Health check for Super App Ecosystem"""
    return {
        "status": "operational",
        "service": "AisleMarts Super App Ecosystem",
        "features": [
            "aislepay_wallet",
            "ai_personal_assistant",
            "food_delivery_integration",
            "travel_booking",
            "entertainment_tickets",
            "bill_payment_system",
            "influencer_marketplace",
            "live_shopping_events",
            "lifestyle_content_generation"
        ],
        "active_services": len(super_app_service.services),
        "total_wallet_users": len(super_app_service.wallets),
        "ai_integration": "emergent_llm" if super_app_service.ai_assistant else "mock_mode",
        "timestamp": datetime.now()
    }


# AislePay Wallet Endpoints
@router.get("/wallet/{user_id}")
async def get_wallet(user_id: str) -> AisleWallet:
    """Get user's AislePay wallet"""
    try:
        wallet = await super_app_service.get_or_create_wallet(user_id)
        return wallet
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get wallet: {str(e)}")


@router.post("/wallet/{user_id}/top-up")
async def top_up_wallet(user_id: str, request: WalletTopUpRequest):
    """Top up user's wallet"""
    try:
        result = await super_app_service.top_up_wallet(user_id, request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Top-up failed: {str(e)}")


@router.post("/wallet/transfer")
async def p2p_transfer(from_user_id: str = Query(...), request: P2PTransferRequest = None):
    """Peer-to-peer money transfer"""
    try:
        result = await super_app_service.p2p_transfer(from_user_id, request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/wallet/{user_id}/transactions")
async def get_wallet_transactions(
    user_id: str,
    limit: int = Query(20, description="Number of transactions to return"),
    offset: int = Query(0, description="Offset for pagination")
):
    """Get user's transaction history"""
    try:
        wallet = await super_app_service.get_or_create_wallet(user_id)
        
        # Get transactions from history
        transaction_ids = wallet.transaction_history[-limit-offset:-offset] if offset > 0 else wallet.transaction_history[-limit:]
        transactions = [
            super_app_service.transactions[tid] for tid in transaction_ids 
            if tid in super_app_service.transactions
        ]
        
        return {
            "transactions": transactions,
            "total": len(wallet.transaction_history),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get transactions: {str(e)}")


# Service Endpoints
@router.get("/services")
async def get_services() -> List[SuperAppService]:
    """Get all available super app services"""
    try:
        services = await super_app_service.get_available_services()
        return services
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get services: {str(e)}")


@router.post("/services/food/order")
async def order_food(
    user_id: str = Query(..., description="User ID"),
    restaurant_id: str = Query(..., description="Restaurant ID"),
    restaurant_name: str = Query(..., description="Restaurant name"),
    items: str = Query(..., description="JSON string of order items"),
    total_amount: float = Query(..., description="Total order amount"),
    delivery_address: str = Query(..., description="JSON string of delivery address")
):
    """Order food delivery"""
    try:
        import json
        
        order_data = {
            "restaurant_id": restaurant_id,
            "restaurant_name": restaurant_name,
            "items": json.loads(items),
            "total_amount": total_amount,
            "delivery_fee": total_amount * 0.1,  # 10% delivery fee
            "service_fee": 2.99,
            "tax_amount": total_amount * 0.08,  # 8% tax
            "delivery_address": json.loads(delivery_address),
            "estimated_delivery": 30
        }
        
        # Calculate final amount
        order_data["final_amount"] = (
            order_data["total_amount"] + 
            order_data["delivery_fee"] + 
            order_data["service_fee"] + 
            order_data["tax_amount"]
        )
        
        result = await super_app_service.book_food_delivery(user_id, order_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Food order failed: {str(e)}")


@router.post("/services/travel/book")
async def book_travel(
    user_id: str = Query(..., description="User ID"),
    booking_type: str = Query(..., description="Type: flight, hotel, car_rental"),
    destination: str = Query(..., description="Destination"),
    departure_date: str = Query(..., description="Departure date (ISO format)"),
    return_date: Optional[str] = Query(None, description="Return date (ISO format)"),
    passengers: int = Query(1, description="Number of passengers"),
    total_cost: float = Query(..., description="Total booking cost"),
    provider: str = Query(..., description="Travel provider")
):
    """Book travel services"""
    try:
        booking_data = {
            "booking_type": booking_type,
            "destination": destination,
            "departure_date": datetime.fromisoformat(departure_date.replace('Z', '+00:00')),
            "return_date": datetime.fromisoformat(return_date.replace('Z', '+00:00')) if return_date else None,
            "passengers": passengers,
            "total_cost": total_cost,
            "provider": provider
        }
        
        result = await super_app_service.book_travel(user_id, booking_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Travel booking failed: {str(e)}")


@router.post("/services/bills/pay")
async def pay_bill(user_id: str = Query(...), request: BillPaymentRequest = None):
    """Pay utility bills"""
    try:
        result = await super_app_service.pay_bill(user_id, request)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# AI Personal Assistant
@router.post("/assistant/chat")
async def chat_with_assistant(
    user_id: str = Query(..., description="User ID"),
    query: str = Query(..., description="User's question or request"),
    context: Optional[str] = Query(None, description="Additional context (JSON string)")
):
    """Chat with AI Personal Assistant"""
    try:
        import json
        
        context_dict = json.loads(context) if context else {}
        response = await super_app_service.chat_with_assistant(user_id, query, context_dict)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Assistant error: {str(e)}")


@router.get("/assistant/daily-content/{user_id}")
async def get_daily_content(user_id: str):
    """Get personalized daily lifestyle content"""
    try:
        content = await super_app_service.generate_daily_content(user_id)
        return {
            "user_id": user_id,
            "daily_content": content,
            "generated_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate content: {str(e)}")


# User Profile & Lifestyle
@router.get("/profile/{user_id}/lifestyle")
async def get_lifestyle_profile(user_id: str):
    """Get user's lifestyle profile"""
    try:
        profile = super_app_service.user_profiles.get(
            user_id, 
            UserLifestyleProfile(user_id=user_id)
        )
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")


@router.patch("/profile/{user_id}/lifestyle")
async def update_lifestyle_profile(
    user_id: str,
    preferences: Optional[str] = Query(None, description="JSON string of user preferences"),
    interests: Optional[str] = Query(None, description="JSON string of user interests"),
    notification_settings: Optional[str] = Query(None, description="JSON string of notification preferences")
):
    """Update user's lifestyle profile"""
    try:
        import json
        
        if user_id not in super_app_service.user_profiles:
            super_app_service.user_profiles[user_id] = UserLifestyleProfile(user_id=user_id)
        
        profile = super_app_service.user_profiles[user_id]
        
        if preferences:
            profile.preferences.update(json.loads(preferences))
        
        if interests:
            profile.preferences["interests"] = json.loads(interests)
        
        if notification_settings:
            profile.notification_settings.update(json.loads(notification_settings))
        
        profile.last_updated = datetime.now()
        
        return {
            "success": True,
            "message": "Lifestyle profile updated successfully",
            "updated_profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")


# User Service History
@router.get("/user/{user_id}/history")
async def get_user_service_history(user_id: str):
    """Get user's history across all super app services"""
    try:
        history = await super_app_service.get_user_service_history(user_id)
        
        # Add summary stats
        summary = {
            "total_transactions": len(history["transactions"]),
            "total_spent": sum([t.amount for t in history["transactions"] if t.from_user == user_id]),
            "total_cashback": sum([t.cashback_amount for t in history["transactions"]]),
            "services_used": len(set([
                "food" if history["food_orders"] else None,
                "travel" if history["travel_bookings"] else None,
                "entertainment" if history["entertainment_bookings"] else None,
                "bills" if history["bill_payments"] else None
            ]) - {None}),
            "last_activity": max([
                max([t.created_at for t in history["transactions"]] + [datetime.min]),
                max([o.created_at for o in history["food_orders"]] + [datetime.min]),
                max([b.created_at for b in history["travel_bookings"]] + [datetime.min])
            ])
        }
        
        return {
            "user_id": user_id,
            "summary": summary,
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user history: {str(e)}")


# Influencer & Social Commerce
@router.post("/influencer/register")
async def register_influencer(
    user_id: str = Query(...),
    specialties: str = Query(..., description="JSON array of specialties"),
    bio: str = Query("", description="Influencer bio"),
    contact_info: str = Query("{}", description="JSON object of contact information")
):
    """Register as an influencer"""
    try:
        import json
        
        profile_data = {
            "specialties": json.loads(specialties),
            "bio": bio,
            "contact_info": json.loads(contact_info)
        }
        
        profile = await super_app_service.create_influencer_profile(user_id, profile_data)
        return {
            "success": True,
            "message": "Influencer profile created successfully",
            "profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create influencer profile: {str(e)}")


@router.post("/live-shopping/create")
async def create_live_shopping_event(
    host_id: str = Query(...),
    title: str = Query(...),
    description: str = Query(...),
    scheduled_time: str = Query(..., description="ISO format datetime"),
    duration_minutes: int = Query(60),
    featured_products: str = Query("[]", description="JSON array of featured products")
):
    """Create live shopping event"""
    try:
        import json
        
        event_data = {
            "host_name": f"Host_{host_id[-6:]}",  # Mock host name
            "title": title,
            "description": description,
            "scheduled_time": datetime.fromisoformat(scheduled_time.replace('Z', '+00:00')),
            "duration_minutes": duration_minutes,
            "featured_products": json.loads(featured_products)
        }
        
        event = await super_app_service.create_live_shopping_event(host_id, event_data)
        return {
            "success": True,
            "message": "Live shopping event created successfully",
            "event": event
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create live shopping event: {str(e)}")


@router.get("/live-shopping/events")
async def get_live_shopping_events(
    status: Optional[str] = Query(None, description="Filter by status: scheduled, live, ended"),
    limit: int = Query(10, description="Number of events to return")
):
    """Get live shopping events"""
    try:
        events = list(super_app_service.live_events.values())
        
        if status:
            events = [e for e in events if e.status == status]
        
        # Sort by scheduled time
        events.sort(key=lambda e: e.scheduled_time, reverse=True)
        
        return {
            "events": events[:limit],
            "total": len(events),
            "filtered_by_status": status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get live shopping events: {str(e)}")


# Analytics & Metrics
@router.get("/analytics/metrics")
async def get_super_app_metrics() -> SuperAppMetrics:
    """Get comprehensive super app analytics"""
    try:
        metrics = await super_app_service.get_super_app_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")


@router.get("/analytics/user-engagement/{user_id}")
async def get_user_engagement_analytics(user_id: str):
    """Get detailed user engagement analytics across all services"""
    try:
        wallet = await super_app_service.get_or_create_wallet(user_id)
        history = await super_app_service.get_user_service_history(user_id)
        
        # Calculate engagement metrics
        total_transactions = len(history["transactions"])
        services_used = []
        
        if history["food_orders"]:
            services_used.append("food_delivery")
        if history["travel_bookings"]:
            services_used.append("travel")
        if history["entertainment_bookings"]:
            services_used.append("entertainment")
        if history["bill_payments"]:
            services_used.append("bills")
        
        # Calculate user lifetime value
        total_spent = sum([t.amount for t in history["transactions"] if t.from_user == user_id])
        total_cashback = wallet.cashback_earned
        
        # User tier classification
        if total_spent > 5000:
            user_tier = "platinum"
        elif total_spent > 2000:
            user_tier = "gold"
        elif total_spent > 500:
            user_tier = "silver"
        else:
            user_tier = "bronze"
        
        engagement_score = (
            len(services_used) * 25 +  # 25 points per service used
            total_transactions * 2 +    # 2 points per transaction
            (100 if wallet.is_verified else 0)  # 100 bonus for verification
        )
        
        return {
            "user_id": user_id,
            "engagement_metrics": {
                "user_tier": user_tier,
                "engagement_score": engagement_score,
                "services_used": services_used,
                "total_services": len(services_used),
                "total_transactions": total_transactions,
                "total_lifetime_value": total_spent,
                "total_cashback_earned": total_cashback,
                "wallet_balance": wallet.balance,
                "is_verified": wallet.is_verified,
                "days_since_registration": (datetime.now() - wallet.created_at).days,
                "last_activity": wallet.last_activity
            },
            "recommendations": [
                f"Try our {service} service for additional rewards!" 
                for service in ["food delivery", "travel booking", "bill payments", "entertainment"]
                if service.replace(" ", "_") not in services_used
            ][:3]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user engagement analytics: {str(e)}")


@router.get("/dashboard/overview")
async def get_dashboard_overview():
    """Get super app dashboard overview"""
    try:
        metrics = await super_app_service.get_super_app_metrics()
        
        # Additional dashboard stats
        recent_transactions = [
            t for t in super_app_service.transactions.values()
            if t.created_at > datetime.now() - timedelta(hours=24)
        ]
        
        active_wallets = len([
            w for w in super_app_service.wallets.values()
            if w.last_activity > datetime.now() - timedelta(days=7)
        ])
        
        return {
            "platform_metrics": metrics.dict(),
            "recent_activity": {
                "transactions_24h": len(recent_transactions),
                "active_wallets_7d": active_wallets,
                "new_users_today": len([
                    w for w in super_app_service.wallets.values()
                    if w.created_at.date() == datetime.now().date()
                ]),
                "total_cashback_distributed": sum([w.cashback_earned for w in super_app_service.wallets.values()])
            },
            "service_health": {
                "aislepay": "operational",
                "ai_assistant": "operational" if super_app_service.ai_assistant else "limited",
                "food_delivery": "operational",
                "travel_booking": "operational", 
                "bill_payments": "operational",
                "live_shopping": "operational"
            },
            "generated_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard overview: {str(e)}")