from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import uuid

router = APIRouter()

# In-memory storage for demo (replace with MongoDB in production)
loyalty_data = {}
loyalty_tiers = {
    "bronze": {"min_points": 0, "benefits": ["5% cashback", "free shipping"], "multiplier": 1.0},
    "silver": {"min_points": 1000, "benefits": ["7% cashback", "priority support"], "multiplier": 1.2},
    "gold": {"min_points": 5000, "benefits": ["10% cashback", "exclusive deals"], "multiplier": 1.5},
    "platinum": {"min_points": 15000, "benefits": ["15% cashback", "VIP access"], "multiplier": 2.0}
}


@router.get("/health")
async def health_check():
    """Health check for Loyalty system"""
    return {
        "status": "operational",
        "service": "Advanced Loyalty & Rewards Program",
        "features": [
            "multi_tier_system",
            "ai_personalized_rewards",
            "cashback_optimization",
            "exclusive_access",
            "loyalty_analytics"
        ],
        "total_members": len(loyalty_data),
        "active_tiers": len(loyalty_tiers),
        "timestamp": datetime.now()
    }


@router.get("/user/{user_id}/loyalty")
async def get_user_loyalty(user_id: str):
    """Get user's loyalty program status"""
    if user_id not in loyalty_data:
        # Initialize new user
        loyalty_data[user_id] = {
            "user_id": user_id,
            "points": 0,
            "tier": "bronze",
            "lifetime_points": 0,
            "cashback_earned": 0.0,
            "transactions": [],
            "rewards_redeemed": [],
            "tier_progress": 0,
            "next_tier_points": 1000,
            "joined_date": datetime.now(),
            "last_activity": datetime.now()
        }
    
    user_loyalty = loyalty_data[user_id]
    
    # Calculate current tier
    current_tier = "bronze"
    for tier_name, tier_info in sorted(loyalty_tiers.items(), key=lambda x: x[1]["min_points"], reverse=True):
        if user_loyalty["lifetime_points"] >= tier_info["min_points"]:
            current_tier = tier_name
            break
    
    user_loyalty["tier"] = current_tier
    
    # Calculate progress to next tier
    next_tier = None
    for tier_name, tier_info in sorted(loyalty_tiers.items(), key=lambda x: x[1]["min_points"]):
        if tier_info["min_points"] > user_loyalty["lifetime_points"]:
            next_tier = tier_name
            user_loyalty["next_tier_points"] = tier_info["min_points"] - user_loyalty["lifetime_points"]
            user_loyalty["tier_progress"] = (user_loyalty["lifetime_points"] / tier_info["min_points"]) * 100
            break
    
    if not next_tier:  # Already at highest tier
        user_loyalty["tier_progress"] = 100
        user_loyalty["next_tier_points"] = 0
    
    return {
        **user_loyalty,
        "tier_benefits": loyalty_tiers[current_tier]["benefits"],
        "multiplier": loyalty_tiers[current_tier]["multiplier"],
        "next_tier": next_tier
    }


@router.post("/user/{user_id}/earn-points")
async def earn_points(
    user_id: str,
    points: int = Query(..., description="Points to add"),
    activity: str = Query(..., description="Activity that earned points"),
    transaction_id: Optional[str] = Query(None, description="Associated transaction ID")
):
    """Add points to user's loyalty account"""
    try:
        # Get or create user loyalty data
        user_loyalty = await get_user_loyalty(user_id)
        
        # Add points
        loyalty_data[user_id]["points"] += points
        loyalty_data[user_id]["lifetime_points"] += points
        loyalty_data[user_id]["last_activity"] = datetime.now()
        
        # Record transaction
        transaction = {
            "id": transaction_id or str(uuid.uuid4()),
            "type": "earn",
            "points": points,
            "activity": activity,
            "timestamp": datetime.now()
        }
        
        loyalty_data[user_id]["transactions"].append(transaction)
        
        # Check for tier upgrade
        old_tier = user_loyalty["tier"]
        updated_loyalty = await get_user_loyalty(user_id)
        new_tier = updated_loyalty["tier"]
        
        tier_upgraded = old_tier != new_tier
        
        return {
            "success": True,
            "points_added": points,
            "current_points": loyalty_data[user_id]["points"],
            "lifetime_points": loyalty_data[user_id]["lifetime_points"],
            "current_tier": new_tier,
            "tier_upgraded": tier_upgraded,
            "transaction": transaction
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to earn points: {str(e)}")


@router.post("/user/{user_id}/redeem-points")
async def redeem_points(
    user_id: str,
    points: int = Query(..., description="Points to redeem"),
    reward: str = Query(..., description="Reward being redeemed"),
    reward_value: float = Query(..., description="Value of reward in USD")
):
    """Redeem points for rewards"""
    try:
        if user_id not in loyalty_data:
            raise HTTPException(status_code=404, detail="User not found in loyalty program")
        
        user_loyalty = loyalty_data[user_id]
        
        if user_loyalty["points"] < points:
            raise HTTPException(status_code=400, detail="Insufficient points")
        
        # Deduct points
        loyalty_data[user_id]["points"] -= points
        loyalty_data[user_id]["last_activity"] = datetime.now()
        
        # Record redemption
        redemption = {
            "id": str(uuid.uuid4()),
            "points_used": points,
            "reward": reward,
            "reward_value": reward_value,
            "timestamp": datetime.now()
        }
        
        loyalty_data[user_id]["rewards_redeemed"].append(redemption)
        
        # Add to cashback if it's a cashback redemption
        if "cashback" in reward.lower():
            loyalty_data[user_id]["cashback_earned"] += reward_value
        
        return {
            "success": True,
            "points_redeemed": points,
            "reward": reward,
            "reward_value": reward_value,
            "remaining_points": loyalty_data[user_id]["points"],
            "redemption": redemption
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to redeem points: {str(e)}")


@router.get("/user/{user_id}/history")
async def get_loyalty_history(
    user_id: str,
    limit: int = Query(50, description="Number of transactions to return"),
    transaction_type: Optional[str] = Query(None, description="Filter by type: earn, redeem")
):
    """Get user's loyalty transaction history"""
    try:
        if user_id not in loyalty_data:
            raise HTTPException(status_code=404, detail="User not found in loyalty program")
        
        user_loyalty = loyalty_data[user_id]
        
        # Combine earn and redeem transactions
        all_transactions = []
        
        # Add earn transactions
        for transaction in user_loyalty["transactions"]:
            all_transactions.append({
                **transaction,
                "category": "earned"
            })
        
        # Add redemption transactions
        for redemption in user_loyalty["rewards_redeemed"]:
            all_transactions.append({
                "id": redemption["id"],
                "type": "redeem",
                "points": -redemption["points_used"],  # Negative for redemptions
                "activity": f"Redeemed: {redemption['reward']}",
                "timestamp": redemption["timestamp"],
                "category": "redeemed",
                "reward_value": redemption["reward_value"]
            })
        
        # Filter by type if specified
        if transaction_type:
            all_transactions = [t for t in all_transactions if t["type"] == transaction_type]
        
        # Sort by timestamp (newest first)
        all_transactions.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return {
            "user_id": user_id,
            "transactions": all_transactions[:limit],
            "total_transactions": len(all_transactions),
            "summary": {
                "total_earned": sum([t["points"] for t in all_transactions if t["points"] > 0]),
                "total_redeemed": abs(sum([t["points"] for t in all_transactions if t["points"] < 0])),
                "total_cashback": user_loyalty["cashback_earned"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get loyalty history: {str(e)}")


@router.get("/tiers")
async def get_loyalty_tiers():
    """Get all loyalty tier information"""
    return {
        "tiers": loyalty_tiers,
        "total_tiers": len(loyalty_tiers),
        "tier_progression": [
            {
                "tier": tier_name,
                "min_points": tier_info["min_points"],
                "benefits": tier_info["benefits"],
                "multiplier": tier_info["multiplier"]
            }
            for tier_name, tier_info in sorted(loyalty_tiers.items(), key=lambda x: x[1]["min_points"])
        ]
    }


@router.get("/rewards-catalog")
async def get_rewards_catalog():
    """Get available rewards for point redemption"""
    catalog = [
        {
            "id": "cashback_5",
            "name": "$5 Cashback",
            "points_required": 500,
            "value": 5.0,
            "category": "cashback",
            "availability": "unlimited"
        },
        {
            "id": "cashback_10",
            "name": "$10 Cashback",
            "points_required": 1000,
            "value": 10.0,
            "category": "cashback",
            "availability": "unlimited"
        },
        {
            "id": "free_shipping",
            "name": "Free Shipping (Any Order)",
            "points_required": 200,
            "value": 9.99,
            "category": "shipping",
            "availability": "unlimited"
        },
        {
            "id": "exclusive_deal",
            "name": "20% Off Next Purchase",
            "points_required": 750,
            "value": "20% discount",
            "category": "discount",
            "availability": "limited"
        },
        {
            "id": "premium_access",
            "name": "30-Day Premium Access",
            "points_required": 2000,
            "value": "Premium features",
            "category": "premium",
            "availability": "limited"
        }
    ]
    
    return {
        "catalog": catalog,
        "total_rewards": len(catalog),
        "categories": list(set([reward["category"] for reward in catalog]))
    }


@router.get("/analytics/program")
async def get_program_analytics():
    """Get loyalty program analytics"""
    try:
        total_members = len(loyalty_data)
        active_members = len([
            user for user in loyalty_data.values()
            if user["last_activity"] > datetime.now() - timedelta(days=30)
        ])
        
        # Tier distribution
        tier_distribution = {}
        total_points_distributed = 0
        total_cashback_paid = 0
        
        for user_data in loyalty_data.values():
            tier = user_data["tier"]
            tier_distribution[tier] = tier_distribution.get(tier, 0) + 1
            total_points_distributed += user_data["lifetime_points"]
            total_cashback_paid += user_data["cashback_earned"]
        
        # Average points per user
        avg_points = total_points_distributed / max(total_members, 1)
        
        # Recent activity (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        recent_activities = 0
        
        for user_data in loyalty_data.values():
            recent_activities += len([
                t for t in user_data["transactions"]
                if t["timestamp"] > week_ago
            ])
        
        return {
            "program_metrics": {
                "total_members": total_members,
                "active_members": active_members,
                "activity_rate": (active_members / max(total_members, 1)) * 100,
                "avg_points_per_user": avg_points,
                "total_points_distributed": total_points_distributed,
                "total_cashback_paid": total_cashback_paid
            },
            "tier_distribution": tier_distribution,
            "engagement_metrics": {
                "recent_activities_7_days": recent_activities,
                "avg_transactions_per_user": sum([len(user["transactions"]) for user in loyalty_data.values()]) / max(total_members, 1),
                "redemption_rate": sum([len(user["rewards_redeemed"]) for user in loyalty_data.values()]) / max(total_members, 1)
            },
            "financial_impact": {
                "total_cashback_distributed": total_cashback_paid,
                "avg_cashback_per_user": total_cashback_paid / max(total_members, 1),
                "estimated_revenue_impact": total_points_distributed * 0.01  # Assume $0.01 per point value
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get program analytics: {str(e)}")


@router.get("/user/{user_id}/recommendations")
async def get_loyalty_recommendations(user_id: str):
    """Get personalized loyalty recommendations"""
    try:
        if user_id not in loyalty_data:
            return {
                "recommendations": [
                    "Join the loyalty program to start earning points",
                    "Make your first purchase to earn 100 bonus points",
                    "Complete your profile for 50 points"
                ]
            }
        
        user_loyalty = loyalty_data[user_id]
        recommendations = []
        
        # Points balance recommendations
        if user_loyalty["points"] >= 500:
            recommendations.append({
                "type": "redemption",
                "message": f"You have {user_loyalty['points']} points! Redeem for cashback or rewards",
                "action": "view_rewards_catalog",
                "priority": "high"
            })
        
        # Tier upgrade recommendations
        if user_loyalty["next_tier_points"] > 0:
            recommendations.append({
                "type": "tier_progress",
                "message": f"Earn {user_loyalty['next_tier_points']} more points to reach {user_loyalty.get('next_tier', 'next tier')}",
                "action": "earn_points",
                "priority": "medium"
            })
        
        # Activity recommendations
        days_since_activity = (datetime.now() - user_loyalty["last_activity"]).days
        if days_since_activity > 7:
            recommendations.append({
                "type": "engagement",
                "message": "Make a purchase or complete activities to keep earning points",
                "action": "browse_deals",
                "priority": "medium"
            })
        
        # Cashback recommendations
        if user_loyalty["points"] >= 1000:
            recommendations.append({
                "type": "cashback",
                "message": "Convert your points to cashback for immediate savings",
                "action": "redeem_cashback",
                "priority": "low"
            })
        
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "loyalty_status": {
                "tier": user_loyalty["tier"],
                "points": user_loyalty["points"],
                "tier_progress": user_loyalty.get("tier_progress", 0)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")