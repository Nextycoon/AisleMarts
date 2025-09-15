from typing import Dict, List
from datetime import datetime, timedelta
from bson import ObjectId
from seller_models import Commission, SellerPayout
from models import Order, User
from localization_service import localization_service
from dotenv import load_dotenv

load_dotenv()

class CommissionService:
    def __init__(self):
        self.default_commission_rate = 0.01  # 1%
    
    async def calculate_commission(self, order_dict: dict) -> Commission:
        """Calculate commission for a completed order"""
        
        # Get seller's commission rate (default 1%)
        commission_rate = self.default_commission_rate
        
        # Calculate amounts
        gross_amount = order_dict.get('total_amount', 0.0)
        commission_amount = gross_amount * commission_rate
        seller_payout = gross_amount - commission_amount
        
        # Create commission record
        commission = Commission(
            order_id=ObjectId(order_dict['order_id']) if isinstance(order_dict['order_id'], str) else order_dict['order_id'],
            seller_id=ObjectId(order_dict['seller_id']) if isinstance(order_dict['seller_id'], str) else order_dict['seller_id'],
            buyer_id=ObjectId(order_dict['buyer_id']) if isinstance(order_dict['buyer_id'], str) else order_dict['buyer_id'],
            gross_amount=gross_amount,
            commission_rate=commission_rate,
            commission_amount=round(commission_amount, 2),
            seller_payout=round(seller_payout, 2),
            currency=order_dict.get('currency', 'KES'),
            payment_method=order_dict.get('payment_method', 'm_pesa'),
            status="pending"
        )
        
        await commission.insert()
        return commission
    
    async def process_commission(self, commission_id: ObjectId) -> bool:
        """Mark commission as processed (order completed)"""
        commission = await Commission.get(commission_id)
        if commission:
            commission.status = "processed"
            commission.processed_at = datetime.utcnow()
            await commission.save()
            return True
        return False
    
    async def get_seller_earnings(self, seller_id: ObjectId, period: str = "current_month") -> Dict:
        """Get seller's earnings summary"""
        
        # Calculate date range
        now = datetime.utcnow()
        if period == "current_month":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = now
        elif period == "last_month":
            last_month = now.replace(day=1) - timedelta(days=1)
            start_date = last_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_date = last_month.replace(day=last_month.day, hour=23, minute=59, second=59)
        else:
            # Default to last 30 days
            start_date = now - timedelta(days=30)
            end_date = now
        
        # Query commissions for period
        commissions = await Commission.find({
            "seller_id": seller_id,
            "created_at": {"$gte": start_date, "$lte": end_date},
            "status": {"$in": ["processed", "paid"]}
        }).to_list()
        
        # Calculate totals
        total_sales = sum(c.gross_amount for c in commissions)
        total_commission = sum(c.commission_amount for c in commissions)
        net_earnings = sum(c.seller_payout for c in commissions)
        
        return {
            "period": period,
            "total_sales": total_sales,
            "total_commission": total_commission,
            "net_earnings": net_earnings,
            "transaction_count": len(commissions),
            "currency": commissions[0].currency if commissions else "KES",
            "commission_rate": self.default_commission_rate * 100  # 1%
        }
    
    async def get_seller_commissions(self, seller_id: ObjectId, limit: int = 50, offset: int = 0) -> List[Commission]:
        """Get seller's commission history"""
        commissions = await Commission.find({
            "seller_id": seller_id
        }).skip(offset).limit(limit).to_list()
        
        return commissions
    
    async def generate_monthly_payout(self, seller_id: ObjectId, year: int, month: int) -> SellerPayout:
        """Generate monthly payout for seller"""
        
        # Calculate period dates
        period_start = datetime(year, month, 1)
        if month == 12:
            period_end = datetime(year + 1, 1, 1) - timedelta(seconds=1)
        else:
            period_end = datetime(year, month + 1, 1) - timedelta(seconds=1)
        
        period_str = f"{year}-{month:02d}"
        
        # Get all processed commissions for the period
        commissions = await Commission.find({
            "seller_id": seller_id,
            "created_at": {"$gte": period_start, "$lte": period_end},
            "status": "processed"
        }).to_list()
        
        if not commissions:
            return None
        
        # Calculate payout totals
        total_sales = sum(c.gross_amount for c in commissions)
        total_commission = sum(c.commission_amount for c in commissions)
        net_payout = sum(c.seller_payout for c in commissions)
        
        # Create payout record
        payout = SellerPayout(
            seller_id=seller_id,
            payout_period=period_str,
            total_sales=total_sales,
            total_commission=total_commission,
            net_payout=net_payout,
            currency=commissions[0].currency,
            commission_ids=[c.id for c in commissions],
            payout_method="m_pesa",  # Default for Kenya
            period_start=period_start,
            period_end=period_end
        )
        
        await payout.insert()
        
        # Mark commissions as paid
        for commission in commissions:
            commission.status = "paid"
            commission.paid_at = datetime.utcnow()
            await commission.save()
        
        return payout
    
    async def simulate_order_completion(self, seller_id: ObjectId, amount: float, currency: str = "KES") -> Dict:
        """Simulate an order completion for testing purposes"""
        # Create a simulated order for commission calculation
        simulated_order = {
            "order_id": ObjectId(),
            "seller_id": seller_id,
            "buyer_id": ObjectId(),  # Fake buyer ID
            "total_amount": amount,
            "currency": currency,
            "payment_method": "m_pesa"
        }
        
        # Calculate commission
        commission = await self.calculate_commission(simulated_order)
        
        # Process it immediately for demo
        await self.process_commission(commission.id)
        
        return {
            "order_id": str(simulated_order["order_id"]),
            "commission_id": str(commission.id),
            "gross_amount": commission.gross_amount,
            "commission_amount": commission.commission_amount,
            "seller_payout": commission.seller_payout,
            "commission_rate": f"{commission.commission_rate * 100}%",
            "status": "processed"
        }

# Initialize service
commission_service = CommissionService()