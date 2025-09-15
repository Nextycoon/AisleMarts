from fastapi import APIRouter

router = APIRouter()

@router.get("/summary")
def summary():
    gross = 12450.0
    commission = round(gross * 0.01, 2)
    return {"gross": gross, "commission": commission, "net": gross - commission}

@router.get("/history")
def history():
    return [
        {"id":"C-2025-08", "amount":98.2, "period":"Aug 2025", "status":"paid"},
        {"id":"C-2025-09", "amount":26.3, "period":"Sep 2025 (to date)", "status":"scheduled"}
    ]
