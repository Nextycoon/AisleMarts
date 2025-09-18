# /app/backend/routers/payments_stripe.py
import os, stripe
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from .deps import get_db
import json

STRIPE_SECRET = os.getenv("STRIPE_SECRET_KEY", "")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

stripe.api_key = STRIPE_SECRET
router = APIRouter(prefix="/api/payments/stripe", tags=["payments"])

class CreateIntentIn(BaseModel):
    amount: int   # in cents
    currency: str = "usd"
    metadata: dict | None = None

class CreateIntentBody(BaseModel):
    deviceId: str
    email: str | None = None
    items: list[dict]  # {productId, name, qty, price, currency, image}

@router.post("/create-payment-intent")
def create_payment_intent(body: CreateIntentIn):
    if not STRIPE_SECRET: raise HTTPException(500, "Stripe not configured")
    intent = stripe.PaymentIntent.create(
        amount=body.amount,
        currency=body.currency,
        automatic_payment_methods={"enabled": True},
        metadata=body.metadata or {}
    )
    return {"clientSecret": intent.client_secret}

@router.post("/create-intent")
async def create_intent(body: CreateIntentBody, db=Depends(get_db)):
    if not stripe.api_key:
        raise HTTPException(500, "Stripe key not configured")
    # compute amount from items
    amount = sum(int(i["qty"]) * int(i["price"]) for i in body.items)
    currency = (body.items[0]["currency"] if body.items else "usd").lower()
    pi = stripe.PaymentIntent.create(
        amount=amount,
        currency=currency,
        automatic_payment_methods={"enabled": True},
        metadata={
            "deviceId": body.deviceId,
            "email": body.email or "",
            "items_json": json.dumps(body.items),
        },
    )
    return {"clientSecret": pi.client_secret, "amount": amount, "currency": currency}

@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig, WEBHOOK_SECRET)
    except Exception as e:
        raise HTTPException(400, f"Webhook error: {e}")

    # minimal handler
    if event["type"] == "payment_intent.succeeded":
        pi = event["data"]["object"]
        # TODO: write order record in DB
    return {"ok": True}