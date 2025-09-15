from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from order_management_models import Order, OrderItem, OrderCustomer, OrderEvent, OrderStatusUpdate
import logging

logger = logging.getLogger(__name__)

def clean_mongo_document(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Clean MongoDB document by converting ObjectIds to strings and removing _id"""
    if doc is None:
        return None
    
    # Convert _id to id string
    if '_id' in doc:
        doc['id'] = str(doc['_id'])
        del doc['_id']
    
    # Recursively clean nested documents
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, list):
            doc[key] = [clean_mongo_document(item) if isinstance(item, dict) else str(item) if isinstance(item, ObjectId) else item for item in value]
        elif isinstance(value, dict):
            doc[key] = clean_mongo_document(value)
    
    return doc

class OrderManagementService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.orders = db.orders
        self.order_events = db.order_events

    async def get_seller_orders(self, seller_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get orders for a specific seller"""
        try:
            query = {"seller_id": seller_id}
            if status:
                query["status"] = status
                
            cursor = self.orders.find(query).sort("created_at", -1)
            orders = []
            
            async for order in cursor:
                clean_order = clean_mongo_document(order)
                orders.append(clean_order)
                
            logger.info(f"Retrieved {len(orders)} orders for seller {seller_id}")
            return orders
            
        except Exception as e:
            logger.error(f"Error getting seller orders: {e}")
            raise

    async def get_order_detail(self, seller_id: str, order_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed order information"""
        try:
            order = await self.orders.find_one({
                "order_id": order_id,
                "seller_id": seller_id
            })
            
            if order:
                return clean_mongo_document(order)
                
            return None
            
        except Exception as e:
            logger.error(f"Error getting order {order_id}: {e}")
            return None

    async def update_order_status(self, seller_id: str, order_id: str, status_update: OrderStatusUpdate) -> Optional[Dict[str, Any]]:
        """Update order status and add timeline event"""
        try:
            # Create timeline event
            event = OrderEvent(
                event=f"Order {status_update.status}",
                description=status_update.notes or f"Order marked as {status_update.status}"
            )
            
            # Update order
            update_data = {
                "status": status_update.status,
                "updated_at": datetime.utcnow(),
                "$push": {"events": event.dict()}
            }
            
            result = await self.orders.update_one(
                {"order_id": order_id, "seller_id": seller_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                updated_order = await self.get_order_detail(seller_id, order_id)
                logger.info(f"Updated order {order_id} status to {status_update.status}")
                return updated_order
                
            return None
            
        except Exception as e:
            logger.error(f"Error updating order {order_id}: {e}")
            return None

    async def process_mpesa_callback(self, checkout_request_id: str, result_code: int, transaction_data: dict) -> bool:
        """Process M-Pesa STK callback and update order status"""
        try:
            if result_code == 0:  # Success
                # Find order by checkout request ID
                order = await self.orders.find_one({
                    "mpesa_checkout_request_id": checkout_request_id
                })
                
                if order:
                    # Extract transaction details
                    mpesa_receipt = transaction_data.get("MpesaReceiptNumber")
                    amount = transaction_data.get("Amount")
                    phone = transaction_data.get("PhoneNumber")
                    
                    # Create payment event
                    event = OrderEvent(
                        event="Payment received",
                        description=f"M-Pesa payment confirmed - Receipt: {mpesa_receipt}"
                    )
                    
                    # Update order to paid status
                    update_data = {
                        "status": "paid",
                        "mpesa_transaction_id": mpesa_receipt,
                        "updated_at": datetime.utcnow(),
                        "$push": {"events": event.dict()}
                    }
                    
                    result = await self.orders.update_one(
                        {"_id": order["_id"]},
                        {"$set": update_data}
                    )
                    
                    if result.modified_count > 0:
                        logger.info(f"Order {order['order_id']} marked as paid via M-Pesa")
                        return True
                        
            else:
                logger.warning(f"M-Pesa payment failed for CheckoutRequestID {checkout_request_id}")
                
            return False
            
        except Exception as e:
            logger.error(f"Error processing M-Pesa callback: {e}")
            return False

    async def create_demo_order(self, seller_id: str) -> Dict[str, Any]:
        """Create a demo order for testing"""
        try:
            order_id = f"O-{ObjectId()}"
            
            # Demo order data
            demo_order = Order(
                order_id=order_id,
                seller_id=seller_id,
                customer=OrderCustomer(
                    name="Alice Njeri",
                    email="alice@example.com",
                    phone="+254712345678",
                    address="Nairobi CBD, Kenya"
                ),
                items=[
                    OrderItem(
                        product_id="demo_product_1",
                        title="Wireless Earbuds X",
                        sku="WX-100",
                        quantity=1,
                        price=2999.0,
                        subtotal=2999.0
                    ),
                    OrderItem(
                        product_id="demo_product_2", 
                        title="Travel Charger 65W",
                        sku="TC-65",
                        quantity=1,
                        price=1999.0,
                        subtotal=1999.0
                    )
                ],
                subtotal=4998.0,
                shipping=200.0,
                commission=49.98,  # 1% of subtotal
                seller_payout=4948.02,
                total=5198.0,
                status='paid',
                mpesa_transaction_id="MPS12345",
                events=[
                    OrderEvent(event="Order placed", description="Customer placed order").dict(),
                    OrderEvent(event="Payment received", description="M-Pesa payment confirmed").dict()
                ]
            )
            
            order_dict = demo_order.dict()
            order_dict['_id'] = ObjectId()
            
            result = await self.orders.insert_one(order_dict)
            
            created_order = await self.orders.find_one({"_id": result.inserted_id})
            if created_order:
                created_order = clean_mongo_document(created_order)
            
            logger.info(f"Created demo order {order_id} for seller {seller_id}")
            return created_order
            
        except Exception as e:
            logger.error(f"Error creating demo order: {e}")
            raise