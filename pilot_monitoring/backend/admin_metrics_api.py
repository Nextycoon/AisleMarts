from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .metrics_collector import orders_overview, mpesa_success, commission_tracker

app = FastAPI(title="AisleMarts Pilot Monitoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status":"ok"}

@app.get("/admin/metrics/orders")
async def orders(days:int=30):
    return await orders_overview(days=days)

@app.get("/admin/metrics/mpesa")
async def mpesa(days:int=30):
    return await mpesa_success(days=days)

@app.get("/admin/metrics/commissions")
async def commissions(days:int=30):
    return await commission_tracker(days=days)
