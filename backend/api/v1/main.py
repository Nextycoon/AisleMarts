"""
Main v1 API router - consolidates all v1 routes
"""
from fastapi import APIRouter
from .routes import auth, shopper, search, cart, aisle_agent, media

# Create the main v1 router
v1_router = APIRouter()

# Include all v1 route modules
v1_router.include_router(auth.router)
v1_router.include_router(shopper.router)
v1_router.include_router(search.router)
v1_router.include_router(cart.router)
v1_router.include_router(aisle_agent.router)
v1_router.include_router(media.router)