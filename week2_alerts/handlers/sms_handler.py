import os

def notify_sms(message: str):
    # Placeholder implementation — integrate your provider (e.g., Twilio) here.
    # Recommended: use environment variables TWILIO_* and the official client.
    # Return a dict with ok: bool and optional error message.
    # This stub simply returns success to allow dry-run tests.
    return {"ok": True, "note": "SMS stub sent (implement provider call)"}
