from fastapi import APIRouter
from typing import Literal, List

router = APIRouter()

@router.get("/summary")
def summary():
    return {"revenue30":12450,"orders30":312,"aov":39.9,"ctr":3.4,"aiShare":0.62}

@router.get("/timeseries")
def timeseries(metric: Literal["revenue","orders","views","ctr","ai_share"]="revenue"):
    # toy series
    data = [{"t":f"2025-09-{d:02d}","v":d*10} for d in range(1,15)]
    return {"metric": metric, "series": data}
