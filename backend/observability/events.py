"""
AisleMarts Event Analytics System - Production Observability
Batched event collection for RFQ funnels, affiliate analytics, and system monitoring
"""

import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
from collections import deque
import time
import logging
from fastapi import Request
import threading

logger = logging.getLogger(__name__)

@dataclass
class Event:
    """Core event structure for analytics"""
    id: str
    ts: datetime
    user_id: Optional[str]
    role: Optional[str] 
    name: str
    source: str
    request_id: Optional[str]
    props: Dict[str, Any]
    ip: Optional[str]
    user_agent: Optional[str]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database storage"""
        return {
            'id': self.id,
            'ts': self.ts.isoformat(),
            'user_id': self.user_id,
            'role': self.role,
            'name': self.name,
            'source': self.source,
            'request_id': self.request_id,
            'props': self.props,
            'ip': self.ip,
            'user_agent': self.user_agent
        }

class EventBuffer:
    """Thread-safe event buffer with batch flushing"""
    
    def __init__(self, max_size: int = 200, flush_interval: float = 2.0):
        self.max_size = max_size
        self.flush_interval = flush_interval
        self.buffer: deque = deque()
        self.lock = threading.Lock()
        self.last_flush = time.time()
        self._running = False
        self._flush_task = None
        
    def add_event(self, event: Event):
        """Add event to buffer, trigger flush if needed"""
        with self.lock:
            self.buffer.append(event)
            
        # Check if we need to flush
        should_flush = (
            len(self.buffer) >= self.max_size or 
            (time.time() - self.last_flush) >= self.flush_interval
        )
        
        if should_flush:
            asyncio.create_task(self._flush_events())
    
    async def _flush_events(self):
        """Flush events to database/storage"""
        events_to_flush = []
        
        with self.lock:
            if not self.buffer:
                return
                
            # Take all events from buffer
            events_to_flush = list(self.buffer)
            self.buffer.clear()
            self.last_flush = time.time()
        
        if not events_to_flush:
            return
            
        try:
            # In production, write to your database
            # For now, we'll log the events (replace with actual DB writes)
            await self._write_events_to_storage(events_to_flush)
            
            logger.info(f"✅ Flushed {len(events_to_flush)} events to storage")
            
        except Exception as e:
            logger.error(f"❌ Failed to flush events: {e}")
            
            # Re-add events to buffer for retry (with limit to prevent memory issues)
            with self.lock:
                retry_events = events_to_flush[-50:]  # Keep last 50 for retry
                for event in reversed(retry_events):
                    self.buffer.appendleft(event)
    
    async def _write_events_to_storage(self, events: List[Event]):
        """Write events to storage - implement your database logic here"""
        # Mock database write - replace with actual implementation
        event_dicts = [event.to_dict() for event in events]
        
        # Simulate database write
        await asyncio.sleep(0.01)  # Simulate I/O
        
        # In production, use your database:
        # async with db_pool.acquire() as conn:
        #     await conn.executemany(
        #         "INSERT INTO events (id, ts, user_id, role, name, source, request_id, props, ip, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
        #         [(e['id'], e['ts'], e['user_id'], e['role'], e['name'], e['source'], e['request_id'], json.dumps(e['props']), e['ip'], e['user_agent']) for e in event_dicts]
        #     )
        
        # For now, log structured events for debugging
        for event in event_dicts:
            logger.info(f"📊 EVENT_STORED: {json.dumps(event)}")

# Global event buffer instance
event_buffer = EventBuffer()

class EventTracker:
    """Main event tracking interface"""
    
    @staticmethod
    def track(
        name: str,
        props: Dict[str, Any],
        user_id: Optional[str] = None,
        role: Optional[str] = None,
        request: Optional[Request] = None,
        request_id: Optional[str] = None,
        source: str = "backend"
    ):
        """Track an event with automatic metadata extraction"""
        
        # Generate event ID
        event_id = str(uuid.uuid4())
        
        # Extract request metadata if provided
        ip = None
        user_agent = None
        if request:
            ip = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
            if not request_id:
                request_id = request.headers.get("x-request-id")
        
        # Create event
        event = Event(
            id=event_id,
            ts=datetime.now(timezone.utc),
            user_id=user_id,
            role=role,
            name=name,
            source=source,
            request_id=request_id,
            props=props,
            ip=ip,
            user_agent=user_agent
        )
        
        # Add to buffer
        event_buffer.add_event(event)
        
        return event_id

# Convenience functions for common events
class RFQEvents:
    """RFQ-specific event tracking"""
    
    @staticmethod
    def created(rfq_id: str, category: str, quantity: int, target_price: Optional[float], 
                user_id: str, request: Optional[Request] = None):
        return EventTracker.track(
            name="rfq_create",
            props={
                "rfq_id": rfq_id,
                "category": category,
                "quantity": quantity,
                "has_target_price": target_price is not None,
                "estimated_value_cents": int((target_price or 0) * quantity * 100) if target_price else None,
                "has_attachments": False  # Add based on actual attachments
            },
            user_id=user_id,
            role="buyer",
            request=request
        )
    
    @staticmethod
    def quote_submitted(rfq_id: str, quote_id: str, supplier_id: str, total_amount: float,
                       lead_time_days: int, request: Optional[Request] = None):
        return EventTracker.track(
            name="rfq_quote_submit", 
            props={
                "rfq_id": rfq_id,
                "quote_id": quote_id,
                "supplier_id": supplier_id,
                "amount_cents": int(total_amount * 100),
                "lead_time_days": lead_time_days
            },
            user_id=supplier_id,
            role="supplier",
            request=request
        )
    
    @staticmethod 
    def quote_accepted(rfq_id: str, quote_id: str, buyer_id: str, supplier_id: str,
                      total_amount: float, request: Optional[Request] = None):
        return EventTracker.track(
            name="rfq_accept",
            props={
                "rfq_id": rfq_id,
                "quote_id": quote_id,
                "supplier_id": supplier_id,
                "total_cents": int(total_amount * 100)
            },
            user_id=buyer_id,
            role="buyer", 
            request=request
        )

class AffiliateEvents:
    """Affiliate-specific event tracking"""
    
    @staticmethod
    def link_created(link_id: str, creator_id: str, campaign_id: Optional[str],
                    product_ids: List[str], commission_rate: float, 
                    request: Optional[Request] = None):
        return EventTracker.track(
            name="affiliate_link_create",
            props={
                "link_id": link_id,
                "campaign_id": campaign_id,
                "product_count": len(product_ids),
                "commission_rate": commission_rate,
                "has_campaign": campaign_id is not None
            },
            user_id=creator_id,
            role="affiliate",
            request=request
        )
    
    @staticmethod
    def link_clicked(link_id: str, product_id: Optional[str], campaign_id: Optional[str],
                    referrer: Optional[str], request: Optional[Request] = None):
        return EventTracker.track(
            name="affiliate_click",
            props={
                "link_id": link_id,
                "product_id": product_id,
                "campaign_id": campaign_id,
                "referrer": referrer,
                "has_referrer": referrer is not None
            },
            request=request
        )
    
    @staticmethod
    def purchase_completed(link_id: str, order_id: str, product_id: str,
                          campaign_id: Optional[str], amount: float, commission_amount: float,
                          user_id: Optional[str] = None, request: Optional[Request] = None):
        return EventTracker.track(
            name="affiliate_purchase",
            props={
                "link_id": link_id,
                "order_id": order_id,
                "product_id": product_id,
                "campaign_id": campaign_id,
                "amount_cents": int(amount * 100),
                "commission_cents": int(commission_amount * 100)
            },
            user_id=user_id,
            role="customer",
            request=request
        )
    
    @staticmethod
    def payout_requested(creator_id: str, amount: float, payout_method: str,
                        request: Optional[Request] = None):
        return EventTracker.track(
            name="payout_request",
            props={
                "amount_cents": int(amount * 100),
                "payout_method": payout_method
            },
            user_id=creator_id,
            role="affiliate",
            request=request
        )

class SystemEvents:
    """System and security event tracking"""
    
    @staticmethod
    def rate_limited(route: str, client_id: str, limit_type: str, 
                    request: Optional[Request] = None):
        return EventTracker.track(
            name="rate_limited",
            props={
                "route": route,
                "client_id": client_id,
                "limit_type": limit_type
            },
            request=request
        )
    
    @staticmethod
    def auth_failed(reason: str, user_id: Optional[str] = None,
                   request: Optional[Request] = None):
        return EventTracker.track(
            name="auth_failed", 
            props={
                "reason": reason,
                "has_user_id": user_id is not None
            },
            user_id=user_id,
            request=request
        )
    
    @staticmethod
    def error_5xx(route: str, status_code: int, error_type: str,
                 request: Optional[Request] = None):
        return EventTracker.track(
            name="error_5xx",
            props={
                "route": route,
                "status_code": status_code,
                "error_type": error_type
            },
            request=request
        )

# Initialize event flushing on startup
async def start_event_system():
    """Initialize the event system - call on app startup"""
    logger.info("🚀 Event analytics system started")
    # Additional initialization if needed

async def stop_event_system():
    """Gracefully shutdown event system - call on app shutdown"""
    # Flush remaining events
    if event_buffer.buffer:
        await event_buffer._flush_events()
    logger.info("🛑 Event analytics system stopped")