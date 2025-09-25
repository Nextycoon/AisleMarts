"""
Rate Limiting Middleware for AisleMarts
Production-ready rate limiting to prevent abuse and bot attacks
"""

import time
import json
from typing import Dict, Optional
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import asyncio
from collections import defaultdict, deque
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self):
        # In-memory store - use Redis in production
        self.requests: Dict[str, deque] = defaultdict(deque)
        self.blocked_ips: Dict[str, datetime] = {}
        
    def _get_client_id(self, request: Request) -> str:
        """Get client identifier (IP + user agent hash for basic fingerprinting)"""
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "")
        
        # Use IP as primary identifier (in production, consider more sophisticated fingerprinting)
        return f"{client_ip}:{hash(user_agent) % 10000}"
    
    def _cleanup_old_requests(self, client_id: str, window_seconds: int):
        """Remove requests older than the time window"""
        cutoff_time = time.time() - window_seconds
        client_requests = self.requests[client_id]
        
        while client_requests and client_requests[0] < cutoff_time:
            client_requests.popleft()
    
    def _is_blocked(self, client_id: str) -> bool:
        """Check if client is temporarily blocked"""
        if client_id in self.blocked_ips:
            if datetime.now() < self.blocked_ips[client_id]:
                return True
            else:
                # Block period expired
                del self.blocked_ips[client_id]
        return False
    
    def _block_client(self, client_id: str, block_duration_minutes: int = 15):
        """Temporarily block a client"""
        self.blocked_ips[client_id] = datetime.now() + timedelta(minutes=block_duration_minutes)
    
    async def check_rate_limit(self, request: Request, max_requests: int, window_seconds: int, 
                              block_on_exceed: bool = True) -> bool:
        """
        Check if request should be rate limited
        
        Args:
            request: FastAPI request object
            max_requests: Maximum requests allowed in the window
            window_seconds: Time window in seconds
            block_on_exceed: Whether to temporarily block client on exceed
            
        Returns:
            True if request is allowed, raises HTTPException if rate limited
        """
        client_id = self._get_client_id(request)
        
        # Check if client is blocked
        if self._is_blocked(client_id):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Rate limit exceeded - temporarily blocked",
                    "retry_after": 900,  # 15 minutes
                    "message": "You have been temporarily blocked due to excessive requests. Please try again later."
                }
            )
        
        # Clean up old requests
        self._cleanup_old_requests(client_id, window_seconds)
        
        # Check current request count
        current_requests = len(self.requests[client_id])
        
        if current_requests >= max_requests:
            if block_on_exceed and current_requests >= max_requests * 1.5:  # Block at 1.5x the limit
                self._block_client(client_id)
            
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Rate limit exceeded",
                    "limit": max_requests,
                    "window_seconds": window_seconds,
                    "retry_after": window_seconds,
                    "current_requests": current_requests,
                    "message": f"Too many requests. Limit: {max_requests} per {window_seconds} seconds."
                }
            )
        
        # Record this request
        self.requests[client_id].append(time.time())
        return True

# Global rate limiter instance
rate_limiter = RateLimiter()

# Rate limiting configurations for different endpoint types
class RateLimit:
    # General API limits
    GENERAL_API = (100, 60)  # 100 requests per minute
    
    # Authentication limits
    AUTH_LOGIN = (10, 300)    # 10 login attempts per 5 minutes
    AUTH_SIGNUP = (5, 300)    # 5 signups per 5 minutes
    
    # RFQ limits (prevent spam)
    RFQ_CREATE = (5, 3600)    # 5 RFQ creations per hour
    RFQ_QUOTE = (20, 3600)    # 20 quote submissions per hour
    RFQ_UPDATE = (10, 300)    # 10 updates per 5 minutes
    
    # Affiliate limits
    AFFILIATE_LINK_CREATE = (10, 3600)  # 10 link creations per hour
    AFFILIATE_CLICK = (1000, 3600)      # 1000 clicks per hour (high for legitimate traffic)
    
    # Admin operations
    ADMIN_OPERATIONS = (50, 300)  # 50 admin operations per 5 minutes
    
    # File uploads
    FILE_UPLOAD = (20, 3600)  # 20 file uploads per hour

async def apply_rate_limit(request: Request, limit_config: tuple, block_on_exceed: bool = True):
    """Apply rate limiting with specified configuration"""
    max_requests, window_seconds = limit_config
    return await rate_limiter.check_rate_limit(request, max_requests, window_seconds, block_on_exceed)

# Convenience functions for common rate limits
async def rate_limit_general(request: Request):
    """General API rate limiting"""
    return await apply_rate_limit(request, RateLimit.GENERAL_API, block_on_exceed=False)

async def rate_limit_auth(request: Request):
    """Authentication rate limiting"""
    return await apply_rate_limit(request, RateLimit.AUTH_LOGIN)

async def rate_limit_rfq_create(request: Request):
    """RFQ creation rate limiting"""
    return await apply_rate_limit(request, RateLimit.RFQ_CREATE)

async def rate_limit_rfq_quote(request: Request):
    """RFQ quote submission rate limiting"""
    return await apply_rate_limit(request, RateLimit.RFQ_QUOTE)

async def rate_limit_affiliate_create(request: Request):
    """Affiliate link creation rate limiting"""
    return await apply_rate_limit(request, RateLimit.AFFILIATE_LINK_CREATE)

async def rate_limit_file_upload(request: Request):
    """File upload rate limiting"""
    return await apply_rate_limit(request, RateLimit.FILE_UPLOAD)

# Rate limiting middleware for FastAPI
async def rate_limiting_middleware(request: Request, call_next):
    """Middleware to apply general rate limiting to all requests"""
    try:
        # Apply general rate limiting
        await rate_limit_general(request)
        
        # Process the request
        response = await call_next(request)
        return response
        
    except HTTPException as e:
        # Return rate limit error response
        return JSONResponse(
            status_code=e.status_code,
            content=e.detail
        )

# Helper function to get rate limit info for responses
def get_rate_limit_headers(client_id: str, max_requests: int, window_seconds: int) -> Dict[str, str]:
    """Get rate limit headers for response"""
    current_time = time.time()
    cutoff_time = current_time - window_seconds
    
    # Count current requests in window
    client_requests = rate_limiter.requests.get(client_id, deque())
    current_count = sum(1 for req_time in client_requests if req_time > cutoff_time)
    
    remaining = max(0, max_requests - current_count)
    reset_time = int(current_time + window_seconds)
    
    return {
        "X-RateLimit-Limit": str(max_requests),
        "X-RateLimit-Remaining": str(remaining),
        "X-RateLimit-Reset": str(reset_time),
        "X-RateLimit-Window": str(window_seconds)
    }

# Example usage in FastAPI routes:
"""
from middleware.rate_limiting import rate_limit_rfq_create

@app.post("/api/b2b/rfq")
async def create_rfq(
    request: Request,
    rfq_data: RFQCreate,
    current_user: AuthToken = Depends(get_current_user),
    _: bool = Depends(rate_limit_rfq_create)
):
    # Route implementation
    pass
"""