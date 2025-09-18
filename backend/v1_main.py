# v1_main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import cart, ai, products, health
import os

app = FastAPI(title="AisleMarts v1", version="v1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(products.router)
app.include_router(ai.router)
app.include_router(cart.router)

@app.get("/")
def root():
    return {"service": "AisleMarts v1 API", "status": "ready"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)