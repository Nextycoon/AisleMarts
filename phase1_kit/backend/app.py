from fastapi import FastAPI
from routers import products, profile, commissions, analytics, orders

app = FastAPI(title="AisleMarts Phase 1 APIs")

app.include_router(products.router, prefix="/seller/products", tags=["products"])
app.include_router(profile.router, prefix="/seller/profile", tags=["profile"])
app.include_router(commissions.router, prefix="/seller/commissions", tags=["commissions"])
app.include_router(analytics.router, prefix="/seller/analytics", tags=["analytics"])
app.include_router(orders.router, prefix="/seller/orders", tags=["orders"])

@app.get("/health")
def health():
    return {"status": "ok"}
