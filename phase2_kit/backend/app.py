from fastapi import FastAPI
from routers import orders, mpesa_webhook

app = FastAPI(title="AisleMarts Phase 2 — Orders")

app.include_router(orders.router, prefix="/seller/orders", tags=["seller-orders"])
app.include_router(mpesa_webhook.router, prefix="/mpesa", tags=["mpesa"])

@app.get("/health")
def health():
    return {"status":"ok"}
