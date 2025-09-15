from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from seller_products_models import SellerProduct, SellerProductCreate, SellerProductUpdate, SellerOrder, SellerAnalytics
import logging

logger = logging.getLogger(__name__)

class SellerProductsService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.products = db.seller_products
        self.orders = db.seller_orders
        self.analytics = db.seller_analytics

    async def create_product(self, seller_id: str, product_data: SellerProductCreate) -> Dict[str, Any]:
        """Create a new product for seller"""
        try:
            product = SellerProduct(
                seller_id=seller_id,
                **product_data.dict()
            )
            
            # Convert to dict and insert
            product_dict = product.dict()
            product_dict['_id'] = ObjectId()
            product_dict['product_id'] = str(product_dict['_id'])
            
            result = await self.products.insert_one(product_dict)
            
            # Return created product
            created_product = await self.products.find_one({"_id": result.inserted_id})
            if created_product:
                # Convert ObjectId to string for JSON serialization
                created_product['id'] = str(created_product['_id'])
                created_product['_id'] = str(created_product['_id'])
                
                logger.info(f"Created product {created_product['id']} for seller {seller_id}")
                return created_product
            else:
                raise Exception("Failed to retrieve created product")
            
        except Exception as e:
            logger.error(f"Error creating product: {e}")
            raise

    async def get_seller_products(self, seller_id: str, active_only: bool = False) -> List[Dict[str, Any]]:
        """Get all products for a seller"""
        try:
            query = {"seller_id": seller_id}
            if active_only:
                query["active"] = True
                
            cursor = self.products.find(query).sort("created_at", -1)
            products = []
            
            async for product in cursor:
                # Convert ObjectId to string for JSON serialization
                product['id'] = str(product['_id'])
                product['_id'] = str(product['_id'])
                products.append(product)
                
            logger.info(f"Retrieved {len(products)} products for seller {seller_id}")
            return products
            
        except Exception as e:
            logger.error(f"Error getting seller products: {e}")
            raise

    async def get_product(self, seller_id: str, product_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific product"""
        try:
            product = await self.products.find_one({
                "_id": ObjectId(product_id),
                "seller_id": seller_id
            })
            
            if product:
                product['id'] = str(product['_id'])
                
            return product
            
        except Exception as e:
            logger.error(f"Error getting product {product_id}: {e}")
            return None

    async def update_product(self, seller_id: str, product_id: str, update_data: SellerProductUpdate) -> Optional[Dict[str, Any]]:
        """Update a product"""
        try:
            # Prepare update data
            update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
            update_dict['updated_at'] = datetime.utcnow()
            
            result = await self.products.update_one(
                {"_id": ObjectId(product_id), "seller_id": seller_id},
                {"$set": update_dict}
            )
            
            if result.modified_count > 0:
                updated_product = await self.get_product(seller_id, product_id)
                logger.info(f"Updated product {product_id} for seller {seller_id}")
                return updated_product
                
            return None
            
        except Exception as e:
            logger.error(f"Error updating product {product_id}: {e}")
            return None

    async def delete_product(self, seller_id: str, product_id: str) -> bool:
        """Delete a product"""
        try:
            result = await self.products.delete_one({
                "_id": ObjectId(product_id),
                "seller_id": seller_id
            })
            
            if result.deleted_count > 0:
                logger.info(f"Deleted product {product_id} for seller {seller_id}")
                return True
                
            return False
            
        except Exception as e:
            logger.error(f"Error deleting product {product_id}: {e}")
            return False

    async def toggle_product_status(self, seller_id: str, product_id: str) -> Optional[Dict[str, Any]]:
        """Toggle product active status"""
        try:
            # Get current status
            product = await self.get_product(seller_id, product_id)
            if not product:
                return None
                
            new_status = not product.get('active', True)
            
            # Update status
            result = await self.products.update_one(
                {"_id": ObjectId(product_id), "seller_id": seller_id},
                {"$set": {"active": new_status, "updated_at": datetime.utcnow()}}
            )
            
            if result.modified_count > 0:
                updated_product = await self.get_product(seller_id, product_id)
                logger.info(f"Toggled product {product_id} status to {new_status}")
                return updated_product
                
            return None
            
        except Exception as e:
            logger.error(f"Error toggling product {product_id}: {e}")
            return None

    async def get_seller_orders(self, seller_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get orders for seller"""
        try:
            query = {"seller_id": seller_id}
            if status:
                query["status"] = status
                
            cursor = self.orders.find(query).sort("created_at", -1)
            orders = []
            
            async for order in cursor:
                order['id'] = str(order['_id'])
                orders.append(order)
                
            logger.info(f"Retrieved {len(orders)} orders for seller {seller_id}")
            return orders
            
        except Exception as e:
            logger.error(f"Error getting seller orders: {e}")
            raise

    async def update_order_status(self, seller_id: str, order_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        """Update order status"""
        try:
            result = await self.orders.update_one(
                {"order_id": order_id, "seller_id": seller_id},
                {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
            )
            
            if result.modified_count > 0:
                updated_order = await self.orders.find_one({"order_id": order_id, "seller_id": seller_id})
                if updated_order:
                    updated_order['id'] = str(updated_order['_id'])
                    logger.info(f"Updated order {order_id} status to {new_status}")
                    return updated_order
                    
            return None
            
        except Exception as e:
            logger.error(f"Error updating order {order_id}: {e}")
            return None

    async def get_seller_analytics_summary(self, seller_id: str) -> Dict[str, Any]:
        """Get seller analytics summary for dashboard"""
        try:
            # Calculate date range (last 30 days)
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)
            
            # Get orders from last 30 days
            orders_cursor = self.orders.find({
                "seller_id": seller_id,
                "created_at": {"$gte": start_date, "$lte": end_date}
            })
            
            total_revenue = 0.0
            total_commission = 0.0
            order_count = 0
            
            async for order in orders_cursor:
                if order.get('status') in ['paid', 'shipped', 'delivered']:
                    total_revenue += order.get('seller_payout', 0.0)
                    total_commission += order.get('commission', 0.0)
                    order_count += 1
            
            # Get product views (mock data for now)
            total_views = order_count * 15  # Rough estimate
            
            # Calculate metrics
            avg_order_value = total_revenue / order_count if order_count > 0 else 0.0
            conversion_rate = (order_count / max(total_views, 1)) * 100
            
            analytics = {
                "seller_id": seller_id,
                "revenue_30d": total_revenue,
                "orders_30d": order_count,
                "views_30d": total_views,
                "commission_30d": total_commission,
                "average_order_value": avg_order_value,
                "conversion_rate": conversion_rate,
                "ai_share": 0.65,  # Mock: 65% of sales from AI recommendations
                "period": "30 days",
                "currency": "KES"
            }
            
            logger.info(f"Generated analytics summary for seller {seller_id}")
            return analytics
            
        except Exception as e:
            logger.error(f"Error getting seller analytics: {e}")
            return {
                "seller_id": seller_id,
                "revenue_30d": 0.0,
                "orders_30d": 0,
                "views_30d": 0,
                "commission_30d": 0.0,
                "average_order_value": 0.0,
                "conversion_rate": 0.0,
                "ai_share": 0.0,
                "period": "30 days",
                "currency": "KES"
            }

    async def create_demo_order(self, seller_id: str, amount: float) -> Dict[str, Any]:
        """Create a demo order for testing (used by commission service)"""
        try:
            commission = amount * 0.01  # 1% commission
            seller_payout = amount - commission
            
            order = SellerOrder(
                order_id=f"O-{ObjectId()}",
                seller_id=seller_id,
                customer_name="Demo Customer",
                customer_email="demo@aislemarts.com",
                items=[{"title": "Demo Product", "price": amount, "quantity": 1}],
                subtotal=amount,
                commission=commission,
                seller_payout=seller_payout,
                status="paid"
            )
            
            order_dict = order.dict()
            order_dict['_id'] = ObjectId()
            
            result = await self.orders.insert_one(order_dict)
            
            created_order = await self.orders.find_one({"_id": result.inserted_id})
            created_order['id'] = str(created_order['_id'])
            
            logger.info(f"Created demo order {order.order_id} for seller {seller_id}")
            return created_order
            
        except Exception as e:
            logger.error(f"Error creating demo order: {e}")
            raise