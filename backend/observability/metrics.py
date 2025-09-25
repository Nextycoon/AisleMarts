"""
AisleMarts Prometheus Metrics - Production Observability
HTTP metrics, domain KPIs, and SLI/SLO tracking for RFQ and Affiliate systems
"""

import time
from typing import Dict, Any, Optional
from prometheus_client import Counter, Histogram, Gauge, Info, generate_latest, CONTENT_TYPE_LATEST
from prometheus_client.core import CollectorRegistry
from fastapi import Request, Response
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Create custom registry for our metrics
registry = CollectorRegistry()

# ============================================================================
# HTTP & Infrastructure Metrics
# ============================================================================

# HTTP request metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'route', 'status_code'],
    registry=registry
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'route'],
    registry=registry,
    buckets=(0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0)
)

# Rate limiting metrics
rate_limit_hits_total = Counter(
    'rate_limit_hits_total',
    'Total rate limit violations',
    ['route', 'limit_type'],
    registry=registry
)

# Database metrics (mock - replace with actual DB metrics)
db_query_duration_seconds = Histogram(
    'db_query_duration_seconds',
    'Database query duration in seconds', 
    ['operation', 'table'],
    registry=registry,
    buckets=(0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0)
)

db_connections_active = Gauge(
    'db_connections_active',
    'Active database connections',
    registry=registry
)

# ============================================================================
# Domain-Specific Metrics (RFQ & Affiliate)
# ============================================================================

# RFQ Metrics
rfq_created_total = Counter(
    'rfq_created_total',
    'Total RFQs created',
    ['category', 'has_target_price'],
    registry=registry
)

rfq_quoted_total = Counter(
    'rfq_quoted_total', 
    'Total quotes submitted for RFQs',
    ['category', 'supplier_tier'],
    registry=registry
)

rfq_accepted_total = Counter(
    'rfq_accepted_total',
    'Total RFQ quotes accepted',
    ['category'],
    registry=registry
)

rfq_value_usd = Counter(
    'rfq_value_usd_total',
    'Total USD value of RFQs',
    ['category', 'status'],
    registry=registry
)

# RFQ pipeline metrics
rfq_active_count = Gauge(
    'rfq_active_count',
    'Currently active RFQs',
    ['category'],
    registry=registry
)

rfq_response_time_hours = Histogram(
    'rfq_response_time_hours',
    'Time from RFQ creation to first quote (hours)',
    ['category'],
    registry=registry,
    buckets=(1, 6, 12, 24, 48, 72, 168, 336)  # 1h to 14 days
)

# Affiliate Metrics
affiliate_links_created_total = Counter(
    'affiliate_links_created_total',
    'Total affiliate links created',
    ['campaign_type', 'has_campaign'],
    registry=registry
)

affiliate_clicks_total = Counter(
    'affiliate_clicks_total',
    'Total affiliate link clicks',
    ['campaign_id', 'product_category'],
    registry=registry
)

affiliate_purchases_total = Counter(
    'affiliate_purchases_total',
    'Total purchases through affiliate links',
    ['campaign_id', 'product_category'], 
    registry=registry
)

affiliate_gmv_usd_total = Counter(
    'affiliate_gmv_usd_total',
    'Total GMV (Gross Merchandise Value) from affiliates',
    ['campaign_id', 'product_category'],
    registry=registry
)

affiliate_commission_usd_total = Counter(
    'affiliate_commission_usd_total',
    'Total commission paid to affiliates',
    ['campaign_id', 'creator_tier'],
    registry=registry
)

affiliate_payouts_total = Counter(
    'affiliate_payouts_total',
    'Total affiliate payouts processed',
    ['payout_method', 'creator_tier'],
    registry=registry
)

# Affiliate performance metrics
affiliate_conversion_rate = Gauge(
    'affiliate_conversion_rate',
    'Current affiliate conversion rate (purchases/clicks)',
    ['campaign_id'],
    registry=registry
)

affiliate_active_links = Gauge(
    'affiliate_active_links_count',
    'Currently active affiliate links',
    ['campaign_id'],
    registry=registry
)

# ============================================================================
# System Health & Queue Metrics  
# ============================================================================

event_queue_depth = Gauge(
    'event_queue_depth',
    'Number of events pending in analytics queue',
    registry=registry
)

event_flush_duration_seconds = Histogram(
    'event_flush_duration_seconds',
    'Time taken to flush events to storage',
    registry=registry
)

event_flush_errors_total = Counter(
    'event_flush_errors_total',
    'Total event flush errors',
    ['error_type'],
    registry=registry
)

# Application info
app_info = Info(
    'aislemarts_app_info',
    'AisleMarts application information',
    registry=registry
)

app_info.info({
    'version': '1.0.0',
    'environment': 'production',
    'service': 'aislemarts-backend'
})

# ============================================================================
# Metric Collection Functions
# ============================================================================

class MetricsCollector:
    """Main metrics collection interface"""
    
    @staticmethod
    def record_http_request(method: str, route: str, status_code: int, duration: float):
        """Record HTTP request metrics"""
        http_requests_total.labels(
            method=method,
            route=route,
            status_code=str(status_code)
        ).inc()
        
        http_request_duration_seconds.labels(
            method=method,
            route=route
        ).observe(duration)
    
    @staticmethod
    def record_rate_limit(route: str, limit_type: str):
        """Record rate limit hit"""
        rate_limit_hits_total.labels(
            route=route,
            limit_type=limit_type
        ).inc()
    
    @staticmethod
    def record_db_query(operation: str, table: str, duration: float):
        """Record database query metrics"""
        db_query_duration_seconds.labels(
            operation=operation,
            table=table
        ).observe(duration)
    
    # RFQ Metrics
    @staticmethod
    def record_rfq_created(category: str, has_target_price: bool, estimated_value: Optional[float] = None):
        """Record RFQ creation"""
        rfq_created_total.labels(
            category=category,
            has_target_price=str(has_target_price)
        ).inc()
        
        if estimated_value:
            rfq_value_usd.labels(
                category=category,
                status='created'
            ).inc(estimated_value)
    
    @staticmethod
    def record_rfq_quote(category: str, supplier_tier: str):
        """Record quote submission"""
        rfq_quoted_total.labels(
            category=category,
            supplier_tier=supplier_tier
        ).inc()
    
    @staticmethod
    def record_rfq_accepted(category: str, value_usd: float):
        """Record RFQ acceptance"""
        rfq_accepted_total.labels(category=category).inc()
        rfq_value_usd.labels(
            category=category,
            status='accepted'
        ).inc(value_usd)
    
    @staticmethod
    def record_rfq_response_time(category: str, hours: float):
        """Record time to first response"""
        rfq_response_time_hours.labels(category=category).observe(hours)
    
    # Affiliate Metrics
    @staticmethod
    def record_affiliate_link_created(campaign_type: str, has_campaign: bool):
        """Record affiliate link creation"""
        affiliate_links_created_total.labels(
            campaign_type=campaign_type,
            has_campaign=str(has_campaign)
        ).inc()
    
    @staticmethod
    def record_affiliate_click(campaign_id: str, product_category: str):
        """Record affiliate click"""
        affiliate_clicks_total.labels(
            campaign_id=campaign_id or 'direct',
            product_category=product_category
        ).inc()
    
    @staticmethod 
    def record_affiliate_purchase(campaign_id: str, product_category: str, 
                                gmv: float, commission: float):
        """Record affiliate purchase"""
        affiliate_purchases_total.labels(
            campaign_id=campaign_id or 'direct',
            product_category=product_category
        ).inc()
        
        affiliate_gmv_usd_total.labels(
            campaign_id=campaign_id or 'direct', 
            product_category=product_category
        ).inc(gmv)
        
        affiliate_commission_usd_total.labels(
            campaign_id=campaign_id or 'direct',
            creator_tier='basic'  # Would get from user data
        ).inc(commission)
    
    @staticmethod
    def record_affiliate_payout(payout_method: str, creator_tier: str, amount: float):
        """Record affiliate payout"""
        affiliate_payouts_total.labels(
            payout_method=payout_method,
            creator_tier=creator_tier
        ).inc()
    
    # System Metrics
    @staticmethod
    def set_event_queue_depth(depth: int):
        """Set current event queue depth"""
        event_queue_depth.set(depth)
    
    @staticmethod
    def record_event_flush(duration: float, error_type: Optional[str] = None):
        """Record event flush metrics"""
        event_flush_duration_seconds.observe(duration)
        if error_type:
            event_flush_errors_total.labels(error_type=error_type).inc()

# ============================================================================
# FastAPI Middleware Integration
# ============================================================================

async def metrics_middleware(request: Request, call_next):
    """Middleware to automatically collect HTTP metrics"""
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration = time.time() - start_time
    
    # Extract route pattern (remove path parameters)
    route = request.url.path
    method = request.method
    status_code = response.status_code
    
    # Record metrics
    MetricsCollector.record_http_request(method, route, status_code, duration)
    
    return response

def get_metrics():
    """Generate Prometheus metrics output"""
    return Response(
        generate_latest(registry),
        media_type=CONTENT_TYPE_LATEST
    )

# ============================================================================
# Health Check & SLI Calculations  
# ============================================================================

def calculate_sli_metrics() -> Dict[str, Any]:
    """Calculate SLI metrics for monitoring"""
    # In production, these would query actual metrics
    # For now, return mock data showing the structure
    
    return {
        "api_availability_24h": 99.95,
        "api_p95_latency_ms": 245,
        "error_rate_5xx_24h": 0.02,
        "rfq_create_success_rate_24h": 99.8,
        "affiliate_event_loss_rate_24h": 0.0,
        "last_updated": datetime.utcnow().isoformat()
    }