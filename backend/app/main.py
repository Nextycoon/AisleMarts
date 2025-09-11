from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import uvicorn
from app.config.settings import settings
from app.routes import auth, vendors, products, cart, orders, ai_concierge

app = FastAPI(
    title="AisleMarts API",
    description="Mobile-first AI-powered marketplace backend",
    version="1.0.0"
)

# CORS middleware for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(vendors.router, prefix="/api/vendors", tags=["Vendors"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(cart.router, prefix="/api/cart", tags=["Shopping Cart"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(ai_concierge.router, prefix="/api/ai", tags=["AI Concierge"])

@app.get("/")
async def root():
    return {"message": "AisleMarts API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )