import asyncio
import json
import uuid
import random
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import math

# Load environment variables
load_dotenv()

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    class LlmChat:
        def __init__(self, *args, **kwargs):
            pass
        async def send_message(self, message):
            return "Monetization AI: Advanced revenue optimization and analytics available."
    class UserMessage:
        def __init__(self, text):
            self.text = text

from models.global_monetization import (
    DynamicCommissionStructure, TransactionCommission, AdvertisingCampaign,
    AdPlacement, ProgrammaticAdBidding, SubscriptionPlan, UserSubscription,
    AffiliateProgram, ReferralTransaction, VirtualGood, VirtualCurrency,
    VirtualGoodPurchase, MarketplaceService, ServiceSubscription,
    RevenueAnalytics, MonetizationMetrics, MonetizationDashboard,
    CommissionCalculationRequest, AdCampaignCreateRequest,
    SubscriptionUpgradeRequest, AffiliateSignupRequest,
    VirtualGoodPurchaseRequest, CommissionTier, SubscriptionType,
    AdFormat, PaymentMethod, RevenueStream
)


class GlobalMonetizationService:
    def __init__(self):
        self.emergent_llm_key = os.getenv("EMERGENT_LLM_KEY", "sk-emergent-35d93F3CeFf0c7aD50")
        self.monetization_ai = None
        self.init_monetization_ai()
        
        # In-memory storage (replace with MongoDB in production)
        self.commission_structures: Dict[str, DynamicCommissionStructure] = {}
        self.transaction_commissions: Dict[str, TransactionCommission] = {}
        self.ad_campaigns: Dict[str, AdvertisingCampaign] = {}
        self.ad_placements: Dict[str, AdPlacement] = {}
        self.subscription_plans: Dict[str, SubscriptionPlan] = {}
        self.user_subscriptions: Dict[str, UserSubscription] = {}
        self.affiliate_programs: Dict[str, AffiliateProgram] = {}
        self.referral_transactions: Dict[str, ReferralTransaction] = {}
        self.virtual_goods: Dict[str, VirtualGood] = {}
        self.virtual_currencies: Dict[str, VirtualCurrency] = {}
        self.virtual_purchases: Dict[str, VirtualGoodPurchase] = {}
        self.marketplace_services: Dict[str, MarketplaceService] = {}
        self.service_subscriptions: Dict[str, ServiceSubscription] = {}
        self.revenue_analytics: Dict[str, RevenueAnalytics] = {}
        
        # Initialize sample data
        self._initialize_monetization_data()

    def init_monetization_ai(self):
        """Initialize Monetization AI for revenue optimization"""
        try:
            self.monetization_ai = LlmChat(
                api_key=self.emergent_llm_key,
                session_id=f"monetization_ai_{uuid.uuid4()}",
                system_message="""You are the AisleMarts Global Monetization AI - an expert in revenue optimization, pricing strategies, and business model innovation.

Your capabilities include:
1. Dynamic commission optimization and tier management
2. Advertising campaign optimization and programmatic bidding
3. Subscription pricing and retention strategies
4. Affiliate program performance optimization
5. Virtual goods pricing and engagement strategies
6. Revenue analytics and forecasting
7. Cross-selling and upselling optimization
8. Market expansion and monetization strategies

Provide data-driven recommendations for maximizing revenue while maintaining user satisfaction and platform growth."""
            )
        except Exception as e:
            print(f"Monetization AI initialization error: {e}")
            self.monetization_ai = None

    def _initialize_monetization_data(self):
        """Initialize sample monetization data"""
        
        # Sample subscription plans
        subscription_plans = [
            {
                "id": "plan_basic",
                "plan_type": SubscriptionType.BASIC,
                "name": "AisleMarts Basic",
                "description": "Essential features for casual users",
                "price_monthly": 9.99,
                "price_yearly": 99.99,
                "features": [
                    "Basic personalized recommendations",
                    "Standard customer support",
                    "Basic analytics dashboard",
                    "Up to 10 product listings"
                ],
                "limitations": {"max_listings": 10, "api_calls_per_month": 1000},
                "target_audience": "casual_users"
            },
            {
                "id": "plan_premium",
                "plan_type": SubscriptionType.PREMIUM,
                "name": "AisleMarts Premium",
                "description": "Advanced features for power users",
                "price_monthly": 29.99,
                "price_yearly": 299.99,
                "features": [
                    "Advanced AI personalization",
                    "Priority customer support",
                    "Advanced analytics & insights",
                    "Unlimited product listings",
                    "Custom branding options",
                    "Advanced marketing tools"
                ],
                "limitations": {"api_calls_per_month": 10000},
                "target_audience": "power_users",
                "priority_support": True,
                "custom_branding": True,
                "advanced_analytics": True
            },
            {
                "id": "plan_enterprise",
                "plan_type": SubscriptionType.ENTERPRISE,
                "name": "AisleMarts Enterprise",
                "description": "Complete solution for businesses",
                "price_monthly": 99.99,
                "price_yearly": 999.99,
                "features": [
                    "Enterprise-grade AI & analytics",
                    "Dedicated account manager",
                    "Custom integrations & API access",
                    "White-label solutions",
                    "Advanced security & compliance",
                    "Custom reporting & dashboards"
                ],
                "limitations": {},
                "target_audience": "businesses",
                "priority_support": True,
                "custom_branding": True,
                "advanced_analytics": True
            }
        ]
        
        for plan_data in subscription_plans:
            plan = SubscriptionPlan(**plan_data)
            self.subscription_plans[plan.id] = plan

        # Sample virtual goods
        virtual_goods = [
            {
                "id": "vg_001",
                "name": "Premium Profile Badge",
                "category": "cosmetic",
                "description": "Show off your premium status with exclusive badges",
                "price_usd": 4.99,
                "price_tokens": 500,
                "rarity": "rare",
                "functionality": {"profile_enhancement": True, "visibility_boost": 1.5}
            },
            {
                "id": "vg_002", 
                "name": "AisleCoins Pack (1000)",
                "category": "currency",
                "description": "1000 AisleCoins for virtual purchases",
                "price_usd": 9.99,
                "price_tokens": 0,
                "rarity": "common",
                "functionality": {"currency_amount": 1000}
            },
            {
                "id": "vg_003",
                "name": "Priority Support Access",
                "category": "functional",
                "description": "30-day priority customer support access",
                "price_usd": 14.99,
                "price_tokens": 1500,
                "rarity": "epic",
                "functionality": {"support_priority": True, "duration_days": 30}
            }
        ]
        
        for good_data in virtual_goods:
            good = VirtualGood(**good_data)
            self.virtual_goods[good.id] = good

        # Sample marketplace services
        marketplace_services = [
            {
                "id": "svc_001",
                "service_name": "Advanced Analytics Pro",
                "service_category": "analytics",
                "description": "Deep dive analytics and business intelligence",
                "provider_id": "aislemarts_official",
                "pricing_model": "subscription",
                "base_price": 49.99,
                "features": [
                    "Real-time sales analytics",
                    "Customer behavior insights",
                    "Predictive analytics",
                    "Custom reporting",
                    "API access"
                ],
                "rating": 4.8,
                "active_users": 2547
            },
            {
                "id": "svc_002",
                "service_name": "Social Media Marketing Suite",
                "service_category": "marketing",
                "description": "Automated social media marketing and management",
                "provider_id": "socialmarketpro",
                "pricing_model": "subscription",
                "base_price": 79.99,
                "features": [
                    "Multi-platform posting",
                    "Content scheduling",
                    "Engagement analytics",
                    "Hashtag optimization",
                    "Influencer discovery"
                ],
                "rating": 4.6,
                "active_users": 1823
            }
        ]
        
        for service_data in marketplace_services:
            service = MarketplaceService(**service_data)
            self.marketplace_services[service.id] = service

    # Dynamic Commission System
    async def calculate_dynamic_commission(self, request: CommissionCalculationRequest) -> Dict[str, Any]:
        """Calculate dynamic commission based on multiple factors"""
        
        if self.monetization_ai:
            try:
                commission_prompt = f"""
                Calculate optimal dynamic commission for transaction:
                
                Seller ID: {request.seller_id}
                Transaction Amount: ${request.transaction_amount}
                Product Category: {request.product_category}
                Buyer Location: {request.buyer_location}
                Premium Seller: {request.is_premium_seller}
                Referral Code: {request.referral_code}
                
                Consider factors:
                1. Seller performance tier and volume
                2. Product category margins and competition
                3. Geographic market conditions
                4. Seasonal adjustments and promotions
                5. Loyalty discounts and incentives
                6. Referral bonuses and affiliate commissions
                
                Provide commission calculation with detailed breakdown.
                """
                
                ai_response = await self.monetization_ai.send_message(UserMessage(commission_prompt))
                
            except Exception as e:
                print(f"Commission AI analysis error: {e}")
        
        # Get or create commission structure for seller
        if request.seller_id not in self.commission_structures:
            self.commission_structures[request.seller_id] = DynamicCommissionStructure(
                seller_id=request.seller_id,
                current_tier=CommissionTier.BRONZE,
                base_commission_rate=0.05,
                volume_based_rates={
                    "0-10000": 0.05,
                    "10000-100000": 0.04,
                    "100000-1000000": 0.035,
                    "1000000+": 0.03
                },
                category_multipliers={
                    "electronics": 1.2,
                    "fashion": 1.0,
                    "home": 0.9,
                    "books": 0.8
                },
                performance_bonuses={
                    "high_rating": 0.005,
                    "fast_shipping": 0.003,
                    "premium_seller": 0.01
                }
            )
        
        commission_structure = self.commission_structures[request.seller_id]
        
        # Calculate base commission rate
        base_rate = commission_structure.base_commission_rate
        
        # Apply volume-based adjustments
        if commission_structure.total_gmv > 1000000:
            base_rate = 0.03
        elif commission_structure.total_gmv > 100000:
            base_rate = 0.035
        elif commission_structure.total_gmv > 10000:
            base_rate = 0.04
        
        # Apply category multiplier
        category_multiplier = commission_structure.category_multipliers.get(request.product_category, 1.0)
        adjusted_rate = base_rate * category_multiplier
        
        # Apply performance bonuses
        if request.is_premium_seller:
            adjusted_rate += commission_structure.performance_bonuses.get("premium_seller", 0.01)
        
        # Calculate final commission
        commission_amount = request.transaction_amount * adjusted_rate
        platform_fee = commission_amount * 0.1  # 10% platform fee
        net_commission = commission_amount - platform_fee
        
        # Update seller statistics
        commission_structure.total_gmv += request.transaction_amount
        commission_structure.monthly_gmv += request.transaction_amount
        commission_structure.commission_earned_total += commission_amount
        commission_structure.commission_earned_monthly += commission_amount
        commission_structure.effective_commission_rate = adjusted_rate
        commission_structure.last_calculated = datetime.now()
        
        # Create transaction record
        transaction_id = str(uuid.uuid4())
        transaction_commission = TransactionCommission(
            id=transaction_id,
            transaction_id=f"txn_{uuid.uuid4().hex[:8]}",
            seller_id=request.seller_id,
            buyer_id=f"buyer_{uuid.uuid4().hex[:8]}",
            product_id=f"prod_{uuid.uuid4().hex[:8]}",
            gross_amount=request.transaction_amount,
            commission_rate=adjusted_rate,
            commission_amount=commission_amount,
            platform_fee=platform_fee,
            net_seller_amount=request.transaction_amount - commission_amount,
            commission_tier=commission_structure.current_tier,
            category=request.product_category
        )
        
        self.transaction_commissions[transaction_id] = transaction_commission
        
        return {
            "transaction_id": transaction_id,
            "commission_calculation": {
                "base_rate": base_rate,
                "category_multiplier": category_multiplier,
                "final_rate": adjusted_rate,
                "commission_amount": commission_amount,
                "platform_fee": platform_fee,
                "net_commission": net_commission,
                "seller_net_amount": request.transaction_amount - commission_amount
            },
            "seller_performance": {
                "current_tier": commission_structure.current_tier.value,
                "total_gmv": commission_structure.total_gmv,
                "next_tier_threshold": commission_structure.next_tier_threshold,
                "commission_earned_total": commission_structure.commission_earned_total
            },
            "optimization_suggestions": [
                "Increase sales volume to reach next tier for better rates",
                "Focus on high-margin categories for better commissions",
                "Maintain high ratings for performance bonuses"
            ]
        }

    # Advanced Advertising System
    async def create_ad_campaign(self, advertiser_id: str, request: AdCampaignCreateRequest) -> AdvertisingCampaign:
        """Create advanced advertising campaign with AI optimization"""
        
        campaign_id = str(uuid.uuid4())
        
        if self.monetization_ai:
            try:
                campaign_prompt = f"""
                Optimize advertising campaign setup:
                
                Campaign Name: {request.campaign_name}
                Budget Total: ${request.budget_total}
                Budget Daily: ${request.budget_daily}
                Target Audience: {json.dumps(request.target_audience)}
                Ad Formats: {request.ad_formats}
                
                Provide optimization recommendations for:
                1. Bid strategy and pricing
                2. Audience targeting refinement
                3. Ad format selection and creative guidelines
                4. Budget allocation and pacing
                5. Performance prediction and KPIs
                """
                
                ai_response = await self.monetization_ai.send_message(UserMessage(campaign_prompt))
                
            except Exception as e:
                print(f"Campaign optimization error: {e}")
        
        # Convert date strings to datetime objects
        start_date = datetime.fromisoformat(request.start_date.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(request.end_date.replace('Z', '+00:00')) if request.end_date else None
        
        campaign = AdvertisingCampaign(
            id=campaign_id,
            advertiser_id=advertiser_id,
            campaign_name=request.campaign_name,
            campaign_type="conversions",  # Default type
            ad_formats=[AdFormat(fmt) for fmt in request.ad_formats],
            target_audience=request.target_audience,
            budget_total=request.budget_total,
            budget_daily=request.budget_daily,
            bid_strategy="automatic",
            start_date=start_date,
            end_date=end_date,
            status="draft",
            creative_assets=request.creative_assets,
            performance_metrics={
                "estimated_reach": random.randint(10000, 100000),
                "estimated_impressions": random.randint(50000, 500000),
                "estimated_clicks": random.randint(1000, 10000),
                "estimated_ctr": random.uniform(0.02, 0.08),
                "estimated_cpm": random.uniform(2.0, 8.0)
            }
        )
        
        self.ad_campaigns[campaign_id] = campaign
        return campaign

    async def run_programmatic_auction(self, ad_slot_id: str, user_profile: Dict[str, Any]) -> ProgrammaticAdBidding:
        """Run real-time programmatic ad auction"""
        
        auction_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        # Find eligible campaigns
        eligible_campaigns = []
        for campaign in self.ad_campaigns.values():
            if (campaign.status == "active" and 
                campaign.budget_daily > 0 and
                self._matches_targeting(campaign.target_audience, user_profile)):
                eligible_campaigns.append(campaign.id)
        
        if not eligible_campaigns:
            # No eligible campaigns, return empty auction
            return ProgrammaticAdBidding(
                auction_id=auction_id,
                ad_slot_id=ad_slot_id,
                auction_type="second_price",
                participating_campaigns=[],
                winning_bid=0.0,
                winning_campaign_id="",
                clearing_price=0.0,
                auction_duration_ms=0.0,
                user_profile=user_profile
            )
        
        # Simulate bidding process
        bids = []
        for campaign_id in eligible_campaigns:
            # Calculate bid based on campaign settings and user value
            base_bid = random.uniform(0.5, 5.0)
            user_value_multiplier = self._calculate_user_value(user_profile)
            quality_score = random.uniform(0.7, 1.0)
            
            final_bid = base_bid * user_value_multiplier * quality_score
            bids.append({
                "campaign_id": campaign_id,
                "bid_amount": final_bid,
                "quality_score": quality_score
            })
        
        # Sort bids by amount (descending)
        bids.sort(key=lambda x: x["bid_amount"], reverse=True)
        
        # Determine winner (highest bid)
        winning_bid = bids[0] if bids else None
        second_price = bids[1]["bid_amount"] if len(bids) > 1 else (bids[0]["bid_amount"] * 0.9 if bids else 0)
        
        end_time = datetime.now()
        auction_duration = (end_time - start_time).total_seconds() * 1000
        
        auction = ProgrammaticAdBidding(
            auction_id=auction_id,
            ad_slot_id=ad_slot_id,
            auction_type="second_price",
            participating_campaigns=eligible_campaigns,
            winning_bid=winning_bid["bid_amount"] if winning_bid else 0.0,
            winning_campaign_id=winning_bid["campaign_id"] if winning_bid else "",
            clearing_price=second_price,
            auction_duration_ms=auction_duration,
            user_profile=user_profile,
            quality_score=winning_bid["quality_score"] if winning_bid else 0.0,
            expected_ctr=random.uniform(0.02, 0.08)
        )
        
        return auction

    def _matches_targeting(self, target_audience: Dict[str, Any], user_profile: Dict[str, Any]) -> bool:
        """Check if user matches campaign targeting criteria"""
        # Simplified targeting match logic
        if "age_range" in target_audience and "age" in user_profile:
            age_range = target_audience["age_range"].split("-")
            user_age = user_profile["age"]
            if not (int(age_range[0]) <= user_age <= int(age_range[1])):
                return False
        
        if "interests" in target_audience and "interests" in user_profile:
            target_interests = set(target_audience["interests"])
            user_interests = set(user_profile["interests"])
            if not target_interests.intersection(user_interests):
                return False
        
        return True

    def _calculate_user_value(self, user_profile: Dict[str, Any]) -> float:
        """Calculate user value multiplier for bidding"""
        base_value = 1.0
        
        # Premium users are more valuable
        if user_profile.get("is_premium", False):
            base_value *= 1.5
        
        # High engagement users are more valuable
        engagement_score = user_profile.get("engagement_score", 0.5)
        base_value *= (0.5 + engagement_score)
        
        # Purchase history affects value
        purchase_frequency = user_profile.get("purchase_frequency", 0.1)
        base_value *= (0.8 + purchase_frequency * 2)
        
        return min(base_value, 3.0)  # Cap at 3x multiplier

    # Subscription Management
    async def upgrade_subscription(self, request: SubscriptionUpgradeRequest) -> UserSubscription:
        """Upgrade user subscription with optimized pricing"""
        
        subscription_id = str(uuid.uuid4())
        
        # Get the target plan
        plan = None
        for p in self.subscription_plans.values():
            if p.plan_type == request.new_plan_type:
                plan = p
                break
        
        if not plan:
            raise ValueError(f"Subscription plan {request.new_plan_type} not found")
        
        # Calculate pricing (with potential discounts)
        base_price = plan.price_monthly if request.billing_frequency == "monthly" else plan.price_yearly
        discount_multiplier = 1.0
        
        # Apply promo code discount (if any)
        if request.promo_code:
            discount_multiplier = 0.8  # 20% discount
        
        final_price = base_price * discount_multiplier
        
        # Calculate next billing date
        next_billing = datetime.now()
        if request.billing_frequency == "monthly":
            next_billing += timedelta(days=30)
        else:
            next_billing += timedelta(days=365)
        
        subscription = UserSubscription(
            id=subscription_id,
            user_id=request.user_id,
            plan_id=plan.id,
            subscription_type=request.new_plan_type,
            billing_amount=final_price,
            payment_method=request.payment_method,
            next_billing_date=next_billing,
            usage_statistics={
                "features_used": [],
                "api_calls_this_month": 0,
                "storage_used_gb": 0
            }
        )
        
        self.user_subscriptions[subscription_id] = subscription
        return subscription

    # Virtual Goods & Currency
    async def purchase_virtual_good(self, request: VirtualGoodPurchaseRequest) -> VirtualGoodPurchase:
        """Process virtual good purchase with currency management"""
        
        purchase_id = str(uuid.uuid4())
        
        # Get virtual good details
        virtual_good = self.virtual_goods.get(request.virtual_good_id)
        if not virtual_good:
            raise ValueError(f"Virtual good {request.virtual_good_id} not found")
        
        # Calculate total cost
        unit_price_usd = virtual_good.price_usd
        unit_price_tokens = virtual_good.price_tokens
        total_price_usd = unit_price_usd * request.quantity
        total_price_tokens = unit_price_tokens * request.quantity
        
        # Process payment based on method
        if request.payment_method == "virtual_currency":
            # Check user's virtual currency balance
            user_currency = self.virtual_currencies.get(request.user_id)
            if not user_currency or user_currency.balance < total_price_tokens:
                raise ValueError("Insufficient virtual currency balance")
            
            # Deduct from balance
            user_currency.balance -= total_price_tokens
            user_currency.total_spent += total_price_tokens
            user_currency.spending_categories[virtual_good.category] = (
                user_currency.spending_categories.get(virtual_good.category, 0) + total_price_tokens
            )
        
        purchase = VirtualGoodPurchase(
            id=purchase_id,
            user_id=request.user_id,
            virtual_good_id=request.virtual_good_id,
            quantity=request.quantity,
            unit_price_usd=unit_price_usd,
            unit_price_tokens=unit_price_tokens,
            total_price_usd=total_price_usd,
            total_price_tokens=total_price_tokens,
            payment_method=request.payment_method,
            gift_recipient_id=request.gift_recipient_id
        )
        
        self.virtual_purchases[purchase_id] = purchase
        return purchase

    async def get_user_virtual_currency(self, user_id: str) -> VirtualCurrency:
        """Get or create user's virtual currency account"""
        
        if user_id not in self.virtual_currencies:
            self.virtual_currencies[user_id] = VirtualCurrency(
                user_id=user_id,
                balance=100,  # Welcome bonus
                total_earned=100,
                earning_sources={"welcome_bonus": 100}
            )
        
        return self.virtual_currencies[user_id]

    # Revenue Analytics & Insights
    async def generate_revenue_analytics(self, period: str = "monthly") -> RevenueAnalytics:
        """Generate comprehensive revenue analytics"""
        
        end_date = datetime.now()
        if period == "daily":
            start_date = end_date - timedelta(days=1)
        elif period == "weekly":
            start_date = end_date - timedelta(weeks=1)
        elif period == "monthly":
            start_date = end_date - timedelta(days=30)
        elif period == "quarterly":
            start_date = end_date - timedelta(days=90)
        else:  # yearly
            start_date = end_date - timedelta(days=365)
        
        # Calculate revenue by stream
        commission_revenue = sum([tc.commission_amount for tc in self.transaction_commissions.values()])
        subscription_revenue = sum([us.billing_amount for us in self.user_subscriptions.values() if us.status == "active"])
        virtual_goods_revenue = sum([vp.total_price_usd for vp in self.virtual_purchases.values()])
        service_revenue = sum([ss.total_monthly_cost for ss in self.service_subscriptions.values()])
        
        total_revenue = commission_revenue + subscription_revenue + virtual_goods_revenue + service_revenue
        
        # Calculate key metrics
        total_users = len(set([us.user_id for us in self.user_subscriptions.values()]))
        arpu = total_revenue / max(total_users, 1)
        
        analytics = RevenueAnalytics(
            period=period,
            start_date=start_date,
            end_date=end_date,
            revenue_by_stream={
                "transaction_commissions": commission_revenue,
                "subscriptions": subscription_revenue,
                "virtual_goods": virtual_goods_revenue,
                "marketplace_services": service_revenue,
                "advertising": random.uniform(10000, 50000)  # Mock ad revenue
            },
            total_revenue=total_revenue,
            revenue_growth_rate=random.uniform(0.05, 0.25),
            average_revenue_per_user=arpu,
            customer_lifetime_value=arpu * 12,  # Simplified CLV
            churn_rate=random.uniform(0.02, 0.08),
            retention_rate=1 - random.uniform(0.02, 0.08),
            new_customer_acquisition_cost=random.uniform(20, 80),
            return_on_ad_spend=random.uniform(2.5, 6.0),
            gross_margin=0.75,
            net_margin=0.45,
            top_revenue_categories=[
                {"category": "fashion", "revenue": total_revenue * 0.35},
                {"category": "electronics", "revenue": total_revenue * 0.25},
                {"category": "home", "revenue": total_revenue * 0.20},
                {"category": "beauty", "revenue": total_revenue * 0.20}
            ],
            geographic_revenue_split={
                "US": total_revenue * 0.45,
                "EU": total_revenue * 0.25,
                "APAC": total_revenue * 0.20,
                "Other": total_revenue * 0.10
            }
        )
        
        return analytics

    async def get_monetization_dashboard(self) -> MonetizationDashboard:
        """Get comprehensive monetization dashboard"""
        
        # Calculate platform metrics
        platform_gmv = sum([tc.gross_amount for tc in self.transaction_commissions.values()])
        total_revenue = sum([
            sum([tc.commission_amount for tc in self.transaction_commissions.values()]),
            sum([us.billing_amount for us in self.user_subscriptions.values() if us.status == "active"]),
            sum([vp.total_price_usd for vp in self.virtual_purchases.values()])
        ])
        
        metrics = MonetizationMetrics(
            platform_gmv=platform_gmv,
            take_rate=total_revenue / max(platform_gmv, 1),
            net_revenue=total_revenue,
            advertising_revenue=random.uniform(25000, 75000),
            subscription_revenue=sum([us.billing_amount for us in self.user_subscriptions.values() if us.status == "active"]),
            virtual_goods_revenue=sum([vp.total_price_usd for vp in self.virtual_purchases.values()]),
            total_active_sellers=len(set([tc.seller_id for tc in self.transaction_commissions.values()])),
            total_paying_users=len([us for us in self.user_subscriptions.values() if us.status == "active"]),
            average_order_value=platform_gmv / max(len(self.transaction_commissions), 1),
            conversion_rate=random.uniform(0.02, 0.06),
            revenue_per_seller=total_revenue / max(len(set([tc.seller_id for tc in self.transaction_commissions.values()])), 1),
            monetization_efficiency=total_revenue / max(platform_gmv, 1)
        )
        
        dashboard = MonetizationDashboard(
            overview={
                "total_revenue": total_revenue,
                "revenue_growth": "+23.5%",
                "platform_gmv": platform_gmv,
                "active_monetization_streams": 6
            },
            revenue_streams={
                "commissions": sum([tc.commission_amount for tc in self.transaction_commissions.values()]),
                "subscriptions": sum([us.billing_amount for us in self.user_subscriptions.values() if us.status == "active"]),
                "advertising": random.uniform(25000, 75000),
                "virtual_goods": sum([vp.total_price_usd for vp in self.virtual_purchases.values()]),
                "marketplace_services": sum([ss.total_monthly_cost for ss in self.service_subscriptions.values()]),
                "affiliate_commissions": sum([rt.commission_amount for rt in self.referral_transactions.values()])
            },
            performance_metrics=metrics,
            growth_trends={
                "revenue": [100, 115, 132, 145, 168, 192, 223],
                "users": [1000, 1150, 1320, 1450, 1680, 1920, 2230],
                "gmv": [50000, 57500, 66125, 72625, 84000, 96600, 111500]
            },
            optimization_opportunities=[
                {
                    "area": "commission_optimization",
                    "potential_impact": "15% revenue increase",
                    "recommendation": "Implement tier-based commission structure"
                },
                {
                    "area": "subscription_upselling",
                    "potential_impact": "25% subscription revenue increase", 
                    "recommendation": "Add premium features and targeted upgrade campaigns"
                }
            ],
            alerts=[
                {
                    "type": "opportunity",
                    "message": "Virtual goods showing 40% week-over-week growth",
                    "priority": "medium"
                }
            ]
        )
        
        return dashboard