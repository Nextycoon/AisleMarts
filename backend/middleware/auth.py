"""
Authentication and Authorization Middleware for AisleMarts
Production-ready JWT enforcement with role-based access control
"""

import jwt
from datetime import datetime, timedelta
from functools import wraps
from typing import Optional, List, Callable
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-this-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Security scheme
security = HTTPBearer()

class UserRole:
    BUYER = "buyer"
    SUPPLIER = "supplier" 
    AFFILIATE = "affiliate"
    ADMIN = "admin"
    CREATOR = "creator"

class AuthToken:
    def __init__(self, user_id: str, role: str, email: str = "", business_id: str = ""):
        self.user_id = user_id
        self.role = role
        self.email = email
        self.business_id = business_id
        
def generate_token(user_id: str, role: str, email: str = "", business_id: str = "") -> str:
    """Generate JWT token for authenticated user"""
    payload = {
        "user_id": user_id,
        "role": role,
        "email": email,
        "business_id": business_id,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> AuthToken:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return AuthToken(
            user_id=payload.get("user_id"),
            role=payload.get("role"),
            email=payload.get("email", ""),
            business_id=payload.get("business_id", "")
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> AuthToken:
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    return verify_token(token)

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[AuthToken]:
    """Optional authentication - returns None if no token provided"""
    if not credentials:
        return None
    try:
        return verify_token(credentials.credentials)
    except HTTPException:
        return None

def require_roles(allowed_roles: List[str]) -> Callable:
    """Decorator to require specific roles for endpoint access"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract current_user from kwargs (assuming it's injected)
            current_user = kwargs.get('current_user')
            if not current_user or current_user.role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required roles: {allowed_roles}. Your role: {current_user.role if current_user else 'none'}"
                )
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_buyer_or_supplier():
    """Require buyer or supplier role"""
    return require_roles([UserRole.BUYER, UserRole.SUPPLIER])

def require_affiliate():
    """Require affiliate/creator role"""
    return require_roles([UserRole.AFFILIATE, UserRole.CREATOR])

def require_admin():
    """Require admin role"""
    return require_roles([UserRole.ADMIN])

async def get_buyer_user(current_user: AuthToken = Depends(get_current_user)) -> AuthToken:
    """Dependency that ensures user is a buyer"""
    if current_user.role not in [UserRole.BUYER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Buyer access required"
        )
    return current_user

async def get_supplier_user(current_user: AuthToken = Depends(get_current_user)) -> AuthToken:
    """Dependency that ensures user is a supplier"""
    if current_user.role not in [UserRole.SUPPLIER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Supplier access required"
        )
    return current_user

async def get_affiliate_user(current_user: AuthToken = Depends(get_current_user)) -> AuthToken:
    """Dependency that ensures user is an affiliate/creator"""
    if current_user.role not in [UserRole.AFFILIATE, UserRole.CREATOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Affiliate/Creator access required"
        )
    return current_user

def verify_resource_ownership(resource_user_id: str, current_user: AuthToken) -> bool:
    """Verify that user owns the resource or is admin"""
    return current_user.role == UserRole.ADMIN or current_user.user_id == resource_user_id

def require_resource_ownership(resource_user_id: str, current_user: AuthToken) -> None:
    """Raise HTTP 403 if user doesn't own resource and isn't admin"""
    if not verify_resource_ownership(resource_user_id, current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only access your own resources."
        )

# Mock authentication for development (remove in production)
def create_mock_tokens():
    """Create mock tokens for testing - REMOVE IN PRODUCTION"""
    tokens = {
        "buyer_token": generate_token("buyer_001", UserRole.BUYER, "buyer@test.com", "business_001"),
        "supplier_token": generate_token("supplier_001", UserRole.SUPPLIER, "supplier@test.com", "supplier_biz_001"),
        "affiliate_token": generate_token("affiliate_001", UserRole.AFFILIATE, "creator@test.com"),
        "admin_token": generate_token("admin_001", UserRole.ADMIN, "admin@aislemarts.com")
    }
    return tokens

# Example usage endpoints for testing
async def get_auth_status(current_user: AuthToken = Depends(get_current_user)):
    """Get current authentication status"""
    return {
        "authenticated": True,
        "user_id": current_user.user_id,
        "role": current_user.role,
        "email": current_user.email,
        "business_id": current_user.business_id
    }