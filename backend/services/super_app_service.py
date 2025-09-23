import asyncio
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    class LlmChat:
        def __init__(self, *args, **kwargs):
            pass
        async def send_message(self, message):
            return "AI Assistant: I can help you with shopping, bookings, and lifestyle needs."
    class UserMessage:
        def __init__(self, text):
            self.text = text

from models.super_app import (
    AisleWallet, PaymentTransaction, PaymentType, TransactionStatus,
    SuperAppService, ServiceType, FoodOrder, TravelBooking, EntertainmentBooking,
    AIAssistantRequest, AIAssistantResponse, LifestyleContent,
    BillPayment, UserLifestyleProfile, InfluencerProfile, BrandPartnership,
    LiveShoppingEvent, WalletTopUpRequest, P2PTransferRequest,
    BillPaymentRequest, ServiceBookingRequest, SuperAppMetrics
)


class SuperAppEcosystemService:
    def __init__(self):
        self.emergent_llm_key = os.getenv("EMERGENT_LLM_KEY", "sk-emergent-35d93F3CeFf0c7aD50")
        self.ai_assistant = None
        self.init_ai_assistant()
        
        # In-memory storage (replace with MongoDB in production)
        self.wallets: Dict[str, AisleWallet] = {}
        self.transactions: Dict[str, PaymentTransaction] = {}
        self.services: Dict[str, SuperAppService] = {}
        self.food_orders: Dict[str, FoodOrder] = {}
        self.travel_bookings: Dict[str, TravelBooking] = {}
        self.entertainment_bookings: Dict[str, EntertainmentBooking] = {}
        self.lifestyle_content: Dict[str, LifestyleContent] = {}
        self.bill_payments: Dict[str, BillPayment] = {}
        self.user_profiles: Dict[str, UserLifestyleProfile] = {}
        self.influencers: Dict[str, InfluencerProfile] = {}
        self.partnerships: Dict[str, BrandPartnership] = {}
        self.live_events: Dict[str, LiveShoppingEvent] = {}
        
        # Initialize default services
        self._initialize_services()

    def init_ai_assistant(self):
        """Initialize AI Personal Assistant"""
        try:
            self.ai_assistant = LlmChat(
                api_key=self.emergent_llm_key,
                session_id=f"aislemarts_assistant_{uuid.uuid4()}",
                system_message="""You are AisleMarts AI Assistant - a personal lifestyle concierge for users of the AisleMarts super app.

Your capabilities include:
1. Shopping assistance (product recommendations, price comparisons, purchase help)
2. Service bookings (food delivery, travel, entertainment, bills)
3. Lifestyle management (reminders, schedules, daily routines)
4. Financial assistance (payments, budgeting, cashback optimization)
5. Social commerce guidance (influencer recommendations, live shopping events)

Always provide helpful, actionable responses that guide users to relevant services within AisleMarts. Be concise but comprehensive, and always suggest specific actions the user can take."""
            ).with_model("openai", "gpt-4o-mini")
        except Exception as e:
            print(f"AI Assistant initialization error: {e}")
            self.ai_assistant = None

    def _initialize_services(self):
        """Initialize default super app services"""
        default_services = [
            {
                "id": "aislepay",
                "name": "AislePay Wallet",
                "service_type": ServiceType.PAYMENT,
                "description": "Digital wallet for seamless payments and transfers",
                "icon": "💳"
            },
            {
                "id": "aisle_eats",
                "name": "AisleEats Delivery",
                "service_type": ServiceType.DELIVERY,
                "description": "Food delivery from local restaurants",
                "icon": "🍕"
            },
            {
                "id": "aisle_travel",
                "name": "AisleTravel",
                "service_type": ServiceType.TRAVEL,
                "description": "Book flights, hotels, and experiences",
                "icon": "✈️"
            },
            {
                "id": "aisle_entertainment",
                "name": "AisleTickets",
                "service_type": ServiceType.ENTERTAINMENT,
                "description": "Movie tickets, concerts, and events",
                "icon": "🎬"
            },
            {
                "id": "aisle_bills",
                "name": "AisleBills",
                "service_type": ServiceType.UTILITIES,
                "description": "Pay utility bills and manage subscriptions",
                "icon": "🧾"
            },
            {
                "id": "aisle_finance",
                "name": "AisleFinance",
                "service_type": ServiceType.FINANCE,
                "description": "Personal finance management and insights",
                "icon": "📊"
            }
        ]
        
        for service_data in default_services:
            service = SuperAppService(**service_data)
            self.services[service.id] = service

    # AislePay Wallet Operations
    async def get_or_create_wallet(self, user_id: str) -> AisleWallet:
        """Get or create user wallet"""
        if user_id not in self.wallets:
            self.wallets[user_id] = AisleWallet(user_id=user_id)
        return self.wallets[user_id]

    async def top_up_wallet(self, user_id: str, request: WalletTopUpRequest) -> Dict[str, Any]:
        """Top up user wallet"""
        wallet = await self.get_or_create_wallet(user_id)
        
        # Create transaction record
        transaction_id = str(uuid.uuid4())
        transaction = PaymentTransaction(
            id=transaction_id,
            from_user="system",
            to_user=user_id,
            amount=request.amount,
            payment_type=PaymentType.TOP_UP,
            description=f"Wallet top-up via {request.payment_method}",
            status=TransactionStatus.COMPLETED,
            fee=0.0,
            cashback_amount=request.amount * 0.01  # 1% cashback on top-ups
        )
        
        # Update wallet
        wallet.balance += request.amount
        wallet.cashback_earned += transaction.cashback_amount
        wallet.last_activity = datetime.now()
        
        self.transactions[transaction_id] = transaction
        wallet.transaction_history.append(transaction_id)
        
        return {
            "success": True,
            "transaction_id": transaction_id,
            "new_balance": wallet.balance,
            "cashback_earned": transaction.cashback_amount
        }

    async def p2p_transfer(self, from_user_id: str, request: P2PTransferRequest) -> Dict[str, Any]:
        """Peer-to-peer money transfer"""
        from_wallet = await self.get_or_create_wallet(from_user_id)
        to_wallet = await self.get_or_create_wallet(request.to_user_id)
        
        if from_wallet.balance < request.amount:
            return {"error": "Insufficient balance"}
        
        # Calculate fee (small fee for P2P transfers)
        fee = max(0.5, request.amount * 0.005)  # 0.5% or minimum $0.50
        total_deduction = request.amount + fee
        
        if from_wallet.balance < total_deduction:
            return {"error": "Insufficient balance including fees"}
        
        # Create transaction
        transaction_id = str(uuid.uuid4())
        transaction = PaymentTransaction(
            id=transaction_id,
            from_user=from_user_id,
            to_user=request.to_user_id,
            amount=request.amount,
            payment_type=PaymentType.P2P,
            description=request.description or "P2P Transfer",
            status=TransactionStatus.COMPLETED,
            fee=fee
        )
        
        # Update wallets
        from_wallet.balance -= total_deduction
        to_wallet.balance += request.amount
        
        from_wallet.last_activity = datetime.now()
        to_wallet.last_activity = datetime.now()
        
        self.transactions[transaction_id] = transaction
        from_wallet.transaction_history.append(transaction_id)
        to_wallet.transaction_history.append(transaction_id)
        
        return {
            "success": True,
            "transaction_id": transaction_id,
            "amount_sent": request.amount,
            "fee_charged": fee,
            "remaining_balance": from_wallet.balance
        }

    # Service Bookings
    async def book_food_delivery(self, user_id: str, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Book food delivery order"""
        wallet = await self.get_or_create_wallet(user_id)
        
        order_id = str(uuid.uuid4())
        order = FoodOrder(
            id=order_id,
            user_id=user_id,
            **order_data
        )
        
        if wallet.balance < order.final_amount:
            return {"error": "Insufficient wallet balance"}
        
        # Process payment
        transaction_id = str(uuid.uuid4())
        transaction = PaymentTransaction(
            id=transaction_id,
            from_user=user_id,
            merchant_id=order.restaurant_id,
            amount=order.final_amount,
            payment_type=PaymentType.MERCHANT,
            description=f"Food order from {order.restaurant_name}",
            status=TransactionStatus.COMPLETED,
            cashback_amount=order.final_amount * 0.02  # 2% cashback on food orders
        )
        
        # Update wallet
        wallet.balance -= order.final_amount
        wallet.cashback_earned += transaction.cashback_amount
        
        self.food_orders[order_id] = order
        self.transactions[transaction_id] = transaction
        
        return {
            "success": True,
            "order_id": order_id,
            "estimated_delivery": order.estimated_delivery,
            "cashback_earned": transaction.cashback_amount
        }

    async def book_travel(self, user_id: str, booking_data: Dict[str, Any]) -> Dict[str, Any]:
        """Book travel (flights, hotels, etc.)"""
        wallet = await self.get_or_create_wallet(user_id)
        
        booking_id = str(uuid.uuid4())
        booking = TravelBooking(
            id=booking_id,
            user_id=user_id,
            booking_reference=f"AISLE{booking_id[:8].upper()}",
            **booking_data
        )
        
        if wallet.balance < booking.total_cost:
            return {"error": "Insufficient wallet balance"}
        
        # Process payment
        transaction_id = str(uuid.uuid4())
        transaction = PaymentTransaction(
            id=transaction_id,
            from_user=user_id,
            merchant_id=booking.provider,
            amount=booking.total_cost,
            payment_type=PaymentType.MERCHANT,
            description=f"Travel booking - {booking.booking_type}",
            status=TransactionStatus.COMPLETED,
            cashback_amount=booking.total_cost * 0.015  # 1.5% cashback on travel
        )
        
        # Update wallet
        wallet.balance -= booking.total_cost
        wallet.cashback_earned += transaction.cashback_amount
        
        self.travel_bookings[booking_id] = booking
        self.transactions[transaction_id] = transaction
        
        return {
            "success": True,
            "booking_id": booking_id,
            "booking_reference": booking.booking_reference,
            "cashback_earned": transaction.cashback_amount
        }

    # AI Personal Assistant
    async def chat_with_assistant(self, user_id: str, query: str, context: Dict[str, Any] = None) -> AIAssistantResponse:
        """Chat with AI Personal Assistant"""
        request = AIAssistantRequest(
            user_id=user_id,
            query=query,
            request_type="general",
            context=context or {}
        )
        
        if not self.ai_assistant:
            return AIAssistantResponse(
                request_id=str(uuid.uuid4()),
                response_text="AI Assistant is currently unavailable. Please try again later.",
                confidence_score=0.5
            )
        
        try:
            # Get user context
            wallet = await self.get_or_create_wallet(user_id)
            user_profile = self.user_profiles.get(user_id, UserLifestyleProfile(user_id=user_id))
            
            # Build context for AI
            user_context = {
                "wallet_balance": wallet.balance,
                "recent_transactions": len(wallet.transaction_history),
                "preferences": user_profile.preferences,
                "favorite_services": user_profile.favorite_services
            }
            
            prompt = f"""User Query: {query}

User Context: {json.dumps(user_context, indent=2)}

Available Services in AisleMarts:
- AislePay: Digital wallet and payments
- AisleEats: Food delivery
- AisleTravel: Flight and hotel bookings  
- AisleTickets: Entertainment bookings
- AisleBills: Utility bill payments
- Shopping: Browse and buy products
- Social Commerce: Follow influencers, join live shopping

Provide a helpful response with specific action suggestions."""
            
            message = UserMessage(text=prompt)
            ai_response = await self.ai_assistant.send_message(message)
            
            # Parse response and generate suggested actions
            suggested_actions = await self._parse_ai_suggestions(ai_response, user_context)
            
            return AIAssistantResponse(
                request_id=str(uuid.uuid4()),
                response_text=ai_response,
                suggested_actions=suggested_actions,
                confidence_score=0.85
            )
            
        except Exception as e:
            print(f"AI Assistant error: {e}")
            return AIAssistantResponse(
                request_id=str(uuid.uuid4()),
                response_text="I'm having trouble processing your request right now. Please try rephrasing your question.",
                confidence_score=0.3
            )

    async def _parse_ai_suggestions(self, ai_response: str, user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse AI response to extract actionable suggestions"""
        suggestions = []
        
        # Simple keyword-based action extraction
        response_lower = ai_response.lower()
        
        if "food" in response_lower or "restaurant" in response_lower:
            suggestions.append({
                "action": "open_food_delivery",
                "title": "Order Food",
                "description": "Browse restaurants and order delivery",
                "service": "aisle_eats"
            })
        
        if "travel" in response_lower or "flight" in response_lower or "hotel" in response_lower:
            suggestions.append({
                "action": "open_travel_booking",
                "title": "Book Travel",
                "description": "Find flights, hotels, and experiences",
                "service": "aisle_travel"
            })
        
        if "bill" in response_lower or "payment" in response_lower:
            suggestions.append({
                "action": "open_bill_payment",
                "title": "Pay Bills",
                "description": "Manage and pay utility bills",
                "service": "aisle_bills"
            })
        
        if "shop" in response_lower or "buy" in response_lower:
            suggestions.append({
                "action": "open_shopping",
                "title": "Shop Products",
                "description": "Browse and purchase items",
                "service": "shopping"
            })
        
        return suggestions[:3]  # Return top 3 suggestions

    # Lifestyle Content Generation
    async def generate_daily_content(self, user_id: str) -> List[LifestyleContent]:
        """Generate personalized daily lifestyle content"""
        user_profile = self.user_profiles.get(user_id, UserLifestyleProfile(user_id=user_id))
        
        content_items = []
        
        # Daily horoscope (if user is interested)
        if "astrology" in user_profile.preferences.get("interests", []):
            horoscope = LifestyleContent(
                id=str(uuid.uuid4()),
                content_type="daily_horoscope",
                title="Your Daily Horoscope",
                content="Today brings new opportunities in your career. Stay open to unexpected partnerships and trust your intuition in financial matters.",
                category="lifestyle",
                target_audience=[user_id],
                related_products=["crystal_collection", "meditation_app"]
            )
            content_items.append(horoscope)
        
        # Daily recipe (if user likes cooking)
        if "cooking" in user_profile.preferences.get("interests", []):
            recipe = LifestyleContent(
                id=str(uuid.uuid4()),
                content_type="recipe",
                title="Quick & Healthy: 15-Minute Salmon Bowl",
                content="A nutritious salmon bowl with quinoa, avocado, and fresh vegetables. Perfect for busy weekdays!",
                category="food",
                target_audience=[user_id],
                related_products=["salmon_fillet", "quinoa", "avocado"]
            )
            content_items.append(recipe)
        
        # Fitness tip (if user is into fitness)
        if "fitness" in user_profile.preferences.get("interests", []):
            workout = LifestyleContent(
                id=str(uuid.uuid4()),
                content_type="workout",
                title="5-Minute Morning Energizer",
                content="Start your day with these simple exercises: 20 jumping jacks, 15 push-ups, 30-second plank, 10 squats. Repeat 2x!",
                category="health",
                target_audience=[user_id],
                related_products=["yoga_mat", "resistance_bands", "protein_powder"]
            )
            content_items.append(workout)
        
        # Store content
        for item in content_items:
            self.lifestyle_content[item.id] = item
        
        return content_items

    # Analytics and Metrics
    async def get_super_app_metrics(self) -> SuperAppMetrics:
        """Get comprehensive super app analytics"""
        total_wallet_users = len(self.wallets)
        total_transactions = sum([t.amount for t in self.transactions.values()])
        
        # Service usage analytics
        service_usage = {}
        revenue_by_service = {}
        
        for transaction in self.transactions.values():
            service = "unknown"
            if transaction.payment_type == PaymentType.P2P:
                service = "aislepay_p2p"
            elif transaction.merchant_id:
                if transaction.merchant_id in [f.restaurant_id for f in self.food_orders.values()]:
                    service = "aisle_eats"
                elif transaction.merchant_id in [t.provider for t in self.travel_bookings.values()]:
                    service = "aisle_travel"
            
            service_usage[service] = service_usage.get(service, 0) + 1
            revenue_by_service[service] = revenue_by_service.get(service, 0) + transaction.amount
        
        popular_services = [
            {"service": k, "usage_count": v} 
            for k, v in sorted(service_usage.items(), key=lambda x: x[1], reverse=True)
        ]
        
        # Cross-service usage (users who use multiple services)
        user_services = {}
        for transaction in self.transactions.values():
            user_id = transaction.from_user
            if user_id != "system":
                if user_id not in user_services:
                    user_services[user_id] = set()
                user_services[user_id].add(transaction.payment_type.value)
        
        cross_service_usage = {
            f"{len(services)}_services": len([u for u, services in user_services.items() if len(services) == len(services)])
            for services in [set(), {1}, {1, 2}, {1, 2, 3}]
        }
        
        return SuperAppMetrics(
            total_wallet_users=total_wallet_users,
            total_transactions=total_transactions,
            popular_services=popular_services,
            revenue_by_service=revenue_by_service,
            user_engagement_by_service={s: usage/max(total_wallet_users, 1) for s, usage in service_usage.items()},
            cross_service_usage=cross_service_usage
        )

    # Bill Payment System
    async def pay_bill(self, user_id: str, request: BillPaymentRequest) -> Dict[str, Any]:
        """Pay utility bills"""
        wallet = await self.get_or_create_wallet(user_id)
        
        if wallet.balance < request.amount:
            return {"error": "Insufficient wallet balance"}
        
        # Create bill payment record
        payment_id = str(uuid.uuid4())
        bill_payment = BillPayment(
            id=payment_id,
            user_id=user_id,
            provider=request.provider,
            account_number=request.account_number,
            amount=request.amount,
            payment_date=datetime.now(),
            status="completed",
            auto_pay_enabled=request.save_for_autopay,
            cashback_earned=request.amount * 0.005  # 0.5% cashback on bills
        )
        
        # Create transaction
        transaction_id = str(uuid.uuid4())
        transaction = PaymentTransaction(
            id=transaction_id,
            from_user=user_id,
            merchant_id=request.provider,
            amount=request.amount,
            payment_type=PaymentType.BILL_PAYMENT,
            description=f"Bill payment - {request.provider}",
            status=TransactionStatus.COMPLETED,
            cashback_amount=bill_payment.cashback_earned
        )
        
        # Update wallet
        wallet.balance -= request.amount
        wallet.cashback_earned += bill_payment.cashback_earned
        
        self.bill_payments[payment_id] = bill_payment
        self.transactions[transaction_id] = transaction
        
        return {
            "success": True,
            "payment_id": payment_id,
            "cashback_earned": bill_payment.cashback_earned,
            "remaining_balance": wallet.balance
        }

    # Influencer & Social Commerce
    async def create_influencer_profile(self, user_id: str, profile_data: Dict[str, Any]) -> InfluencerProfile:
        """Create influencer profile"""
        profile = InfluencerProfile(
            user_id=user_id,
            **profile_data
        )
        
        self.influencers[user_id] = profile
        return profile

    async def create_live_shopping_event(self, host_id: str, event_data: Dict[str, Any]) -> LiveShoppingEvent:
        """Create live shopping event"""
        event_id = str(uuid.uuid4())
        event = LiveShoppingEvent(
            id=event_id,
            host_id=host_id,
            stream_url=f"https://live.aislemarts.com/stream/{event_id}",
            **event_data
        )
        
        self.live_events[event_id] = event
        return event

    # Service Management
    async def get_available_services(self) -> List[SuperAppService]:
        """Get all available super app services"""
        return [service for service in self.services.values() if service.is_active]

    async def get_user_service_history(self, user_id: str) -> Dict[str, List[Any]]:
        """Get user's history across all services"""
        user_transactions = [t for t in self.transactions.values() if t.from_user == user_id]
        user_food_orders = [o for o in self.food_orders.values() if o.user_id == user_id]
        user_travel_bookings = [b for b in self.travel_bookings.values() if b.user_id == user_id]
        user_entertainment = [e for e in self.entertainment_bookings.values() if e.user_id == user_id]
        user_bills = [b for b in self.bill_payments.values() if b.user_id == user_id]
        
        return {
            "transactions": user_transactions,
            "food_orders": user_food_orders,
            "travel_bookings": user_travel_bookings,
            "entertainment_bookings": user_entertainment,
            "bill_payments": user_bills
        }