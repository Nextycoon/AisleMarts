from typing import Dict, List
from datetime import datetime, timedelta
import uuid
from seller_models import CommissionDoc, SellerPayoutDoc
from models import OrderDoc, UserDoc
from localization_service import localization_service
from db import db
from dotenv import load_dotenv

load_dotenv()

class CommissionService:
    def __init__(self):
        self.default_commission_rate = 0.01  # 1%
    
    async def calculate_commission(self, order_dict: dict) -> dict:
        """Calculate commission for a completed order"""
        
        # Get seller's commission rate (default 1%)
        commission_rate = self.default_commission_rate
        
        # Calculate amounts
        gross_amount = order_dict.get('total_amount', 0.0)
        commission_amount = gross_amount * commission_rate
        seller_payout = gross_amount - commission_amount
        
        # Create commission record
        commission: CommissionDoc = {
            '_id': str(uuid.uuid4()),
            'order_id': order_dict['order_id'] if isinstance(order_dict['order_id'], str) else str(order_dict['order_id']),
            'seller_id': order_dict['seller_id'] if isinstance(order_dict['seller_id'], str) else str(order_dict['seller_id']),
            'buyer_id': order_dict['buyer_id'] if isinstance(order_dict['buyer_id'], str) else str(order_dict['buyer_id']),
            'gross_amount': gross_amount,
            'commission_rate': commission_rate,
            'commission_amount': round(commission_amount, 2),
            'seller_payout': round(seller_payout, 2),
            'currency': order_dict.get('currency', 'KES'),
            'payment_method': order_dict.get('payment_method', 'm_pesa'),
            'status': "pending",
            'processed_at': None,
            'paid_at': None,
            'payment_reference': None,
            'created_at': datetime.utcnow()
        }
        
        # Insert into database
        await db().commissions.insert_one(commission)
        return commission
    
    async def process_commission(self, commission_id: str) -> bool:
        """Mark commission as processed (order completed)"""
        result = await db().commissions.update_one(
            {"_id": commission_id},
            {
                "$set": {
                    "status": "processed",
                    "processed_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    async def get_seller_earnings(self, seller_id: str, period: str = "current_month") -> Dict:
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
        cursor = db().commissions.find({
            "seller_id": seller_id,
            "created_at": {"$gte": start_date, "$lte": end_date},
            "status": {"$in": ["processed", "paid"]}
        })
        commissions = await cursor.to_list(length=None)
        
        # Calculate totals
        total_sales = sum(c.get('gross_amount', 0) for c in commissions)
        total_commission = sum(c.get('commission_amount', 0) for c in commissions)
        net_earnings = sum(c.get('seller_payout', 0) for c in commissions)
        
        return {
            "period": period,
            "total_sales": total_sales,
            "total_commission": total_commission,
            "net_earnings": net_earnings,
            "transaction_count": len(commissions),
            "currency": commissions[0].get('currency', 'KES') if commissions else "KES",
            "commission_rate": self.default_commission_rate * 100  # 1%
        }
    
    async def get_seller_commissions(self, seller_id: str, limit: int = 50, offset: int = 0) -> List[dict]:
        """Get seller's commission history"""
        cursor = db().commissions.find({
            "seller_id": seller_id
        }).skip(offset).limit(limit)
        commissions = await cursor.to_list(length=limit)
        
        return commissions
    
    async def generate_monthly_payout(self, seller_id: str, year: int, month: int) -> dict:
        """Generate monthly payout for seller"""
        
        # Calculate period dates
        period_start = datetime(year, month, 1)
        if month == 12:
            period_end = datetime(year + 1, 1, 1) - timedelta(seconds=1)
        else:
            period_end = datetime(year, month + 1, 1) - timedelta(seconds=1)
        
        period_str = f"{year}-{month:02d}"
        
        # Get all processed commissions for the period
        cursor = db().commissions.find({
            "seller_id": seller_id,
            "created_at": {"$gte": period_start, "$lte": period_end},
            "status": "processed"
        })
        commissions = await cursor.to_list(length=None)
        
        if not commissions:
            return None
        
        # Calculate payout totals
        total_sales = sum(c.get('gross_amount', 0) for c in commissions)
        total_commission = sum(c.get('commission_amount', 0) for c in commissions)
        net_payout = sum(c.get('seller_payout', 0) for c in commissions)
        
        # Create payout record
        payout: SellerPayoutDoc = {
            '_id': str(uuid.uuid4()),
            'seller_id': seller_id,
            'payout_period': period_str,
            'total_sales': total_sales,
            'total_commission': total_commission,
            'net_payout': net_payout,
            'currency': commissions[0].get('currency', 'KES'),
            'commission_ids': [c['_id'] for c in commissions],
            'payout_method': "m_pesa",  # Default for Kenya
            'payout_reference': None,
            'payout_status': "pending",
            'period_start': period_start,
            'period_end': period_end,
            'payout_date': None,
            'created_at': datetime.utcnow()
        }
        
        # Insert payout record
        await db().seller_payouts.insert_one(payout)
        
        # Mark commissions as paid
        commission_ids = [c['_id'] for c in commissions]
        await db().commissions.update_many(
            {"_id": {"$in": commission_ids}},
            {
                "$set": {
                    "status": "paid",
                    "paid_at": datetime.utcnow()
                }
            }
        )
        
        return payout
    
    async def simulate_order_completion(self, seller_id: str, amount: float, currency: str = "KES") -> Dict:
        """Simulate an order completion for testing purposes"""
        # Create a simulated order for commission calculation
        simulated_order = {
            "order_id": str(uuid.uuid4()),
            "seller_id": seller_id,
            "buyer_id": str(uuid.uuid4()),  # Fake buyer ID
            "total_amount": amount,
            "currency": currency,
            "payment_method": "m_pesa"
        }
        
        # Calculate commission
        commission = await self.calculate_commission(simulated_order)
        
        # Process it immediately for demo
        await self.process_commission(commission['_id'])
        
        return {
            "order_id": simulated_order["order_id"],
            "commission_id": commission['_id'],
            "gross_amount": commission['gross_amount'],
            "commission_amount": commission['commission_amount'],
            "seller_payout": commission['seller_payout'],
            "commission_rate": f"{commission['commission_rate'] * 100}%",
            "status": "processed"
        }

# Initialize service
commission_service = CommissionService()