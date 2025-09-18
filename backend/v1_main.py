# v1_main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import cart, ai, products, health, cart_persistence, voice_commands, recommendations_v2, payments_stripe
import os

# Prometheus metrics
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

app = FastAPI(title="AisleMarts v1", version="v1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Metrics setup
REQUEST_COUNT = Counter("http_requests_total", "Total HTTP requests", ["method", "path", "status"])
REQUEST_LATENCY = Histogram("http_request_duration_seconds", "Latency", ["method", "path"])

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        method = request.method
        path = request.url.path
        with REQUEST_LATENCY.labels(method, path).time():
            resp = await call_next(request)
        REQUEST_COUNT.labels(method, path, str(resp.status_code)).inc()
        return resp

app.add_middleware(MetricsMiddleware)

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Include routers
app.include_router(health.router)
app.include_router(products.router)
app.include_router(ai.router)
app.include_router(cart.router)

# NEW: All 5 track routers
app.include_router(cart_persistence.router)
app.include_router(voice_commands.router) 
app.include_router(recommendations_v2.router)
app.include_router(payments_stripe.router)

@app.get("/")
def root():
    return {"service": "AisleMarts v1 API", "status": "ready", "features": ["cart_persistence", "voice_commands", "recommendations_v2", "payments", "metrics"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)