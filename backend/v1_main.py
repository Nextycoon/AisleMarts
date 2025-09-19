# /app/backend/v1_main.py
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

# ── Metrics (already added previously; safe to keep) ───────────────────────────
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

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

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="AisleMarts v1 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(MetricsMiddleware)

# ── Routers: import the filenames YOU used ────────────────────────────────────
from routers import (
    health,                 # /app/backend/routers/health.py
    cart_persistence,       # /app/backend/routers/cart_persistence.py
    voice_commands,         # /app/backend/routers/voice_commands.py
    recommendations_v2,     # /app/backend/routers/recommendations_v2.py
    payments_stripe,        # /app/backend/routers/payments_stripe.py
    orders,                 # /app/backend/routers/orders.py
    vendor_management,      # /app/backend/routers/vendor_management.py
    analytics_api,          # /app/backend/routers/analytics_api.py
    multilang_voice_ai,     # /app/backend/routers/multilang_voice_ai.py
)

app.include_router(health.router)
app.include_router(cart_persistence.router)
app.include_router(voice_commands.router)
app.include_router(recommendations_v2.router)
app.include_router(payments_stripe.router)
app.include_router(orders.router)
app.include_router(vendor_management.router)
app.include_router(analytics_api.router)
app.include_router(multilang_voice_ai.router)

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/__routes__")
def __routes__():
    return sorted({getattr(r, "path", "") for r in app.router.routes})

# Optional: debug route list on startup
@app.on_event("startup")
async def _log_routes():
    paths = sorted({getattr(r, "path", "") for r in app.router.routes})
    print("[ROUTES]", *paths, sep="\n")

@app.get("/")
def root():
    return {"service": "AisleMarts v1 API", "status": "ready", "features": ["cart_persistence", "voice_commands", "recommendations_v2", "payments", "metrics"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)