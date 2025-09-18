# /app/backend/routers/payments_stripe.py
import os, stripe
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

STRIPE_SECRET = os.getenv("STRIPE_SECRET_KEY", "")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

stripe.api_key = STRIPE_SECRET
router = APIRouter(prefix="/api/payments", tags=["payments"])

class CreateIntentIn(BaseModel):
    amount: int   # in cents
    currency: str = "usd"
    metadata: dict | None = None

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