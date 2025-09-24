from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.config.database import get_database
from app.config.settings import settings
from app.models import User, UserCreate, UserLogin, Token, UserRole
from app.services.auth import (
    authenticate_user, 
    create_access_token, 
    get_password_hash, 
    get_user_by_email,
    get_current_active_user
)
from bson import ObjectId

router = APIRouter()

@router.post("/register", response_model=dict)
async def register(user: UserCreate, db = Depends(get_database)):
    # Check if user already exists
    existing_user = await get_user_by_email(user.email, db)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict["password_hash"] = hashed_password
    del user_dict["password"]
    user_dict["_id"] = ObjectId()
    
    # Insert user into database
    result = await db.users.insert_one(user_dict)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(result.inserted_id)}, expires_delta=access_token_expires
    )
    
    return {
        "message": "User created successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(result.inserted_id)
    }

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db = Depends(get_database)):
    user = await authenticate_user(user_credentials.email, user_credentials.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_database)
):
    user = await authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}