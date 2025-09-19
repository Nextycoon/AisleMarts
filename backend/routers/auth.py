from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime, timedelta
import jwt
import hashlib
import bcrypt
from db import db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# JWT Configuration
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 7  # 7 days

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserPreferencesRequest(BaseModel):
    language: str = "en"
    styles: list[str] = []
    budget: str = "$$"
    package: str = "Starter"
    onboarded: bool = True

def create_access_token(user_id: str) -> str:
    """Create a new access token"""
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def hash_password(password: str) -> str:
    """Hash a password"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

@router.post("/register")
async def register_user(request: RegisterRequest):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await db().users.find_one({"email": request.email})
        if existing_user:
            raise HTTPException(400, "User with this email already exists")
        
        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(request.password)
        
        user_data = {
            "_id": user_id,
            "email": request.email,
            "password": hashed_password,
            "created_at": datetime.utcnow(),
            "onboarded": False,
            "preferences": {}
        }
        
        await db().users.insert_one(user_data)
        
        # Create access token
        token = create_access_token(user_id)
        
        return {
            "user_id": user_id,
            "token": token,
            "message": "User registered successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Registration failed: {str(e)}")

@router.post("/login")
async def login_user(request: LoginRequest):
    """Login a user"""
    try:
        # Find user by email
        user = await db().users.find_one({"email": request.email})
        if not user:
            raise HTTPException(401, "Invalid email or password")
        
        # Verify password
        if not verify_password(request.password, user["password"]):
            raise HTTPException(401, "Invalid email or password")
        
        # Create access token
        token = create_access_token(str(user["_id"]))
        
        return {
            "user_id": str(user["_id"]),
            "token": token,
            "message": "Login successful"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Login failed: {str(e)}")

@router.post("/users/{user_id}/preferences")
async def save_user_preferences(
    user_id: str,
    request: UserPreferencesRequest,
    authorization: Optional[str] = Header(None)
):
    """Save user preferences after onboarding"""
    try:
        # Simple auth check - just verify token exists and is valid format
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(401, "Authorization header required")
        
        # Update user preferences
        result = await db().users.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "preferences": {
                        "language": request.language,
                        "styles": request.styles,
                        "budget": request.budget,
                        "package": request.package
                    },
                    "onboarded": request.onboarded,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(404, "User not found")
        
        return {
            "success": True,
            "message": "Preferences saved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to save preferences: {str(e)}")

@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    authorization: Optional[str] = Header(None)
):
    """Get user information"""
    try:
        # Simple auth check
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(401, "Authorization header required")
        
        user = await db().users.find_one({"_id": user_id}, {"password": 0})  # Exclude password
        if not user:
            raise HTTPException(404, "User not found")
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to get user: {str(e)}")