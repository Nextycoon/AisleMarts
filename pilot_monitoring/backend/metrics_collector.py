from datetime import datetime, timedelta
from typing import Any, Dict
from .mongo_connection import db, COLLECTIONS

def _dt_ago(days:int)->datetime:
    return datetime.utcnow() - timedelta(days=days)

async def orders_overview(days:int=30) -> Dict[str, Any]:
    col = db[COLLECTIONS["orders"]]
    since = _dt_ago(days)
    pipeline = [
        {"$match": {"createdAt": {"$gte": since}}},
        {"$facet": {
            "status_counts":[{"$group":{"_id":"$status","count":{"$sum":1}}}],
            "totals":[{"$group":{"_id":None,"orders":{"$sum":1},"gross":{"$sum":"$total"}}}],
            "trend":[
                {"$group": {"_id": {"$dateToString":{"format":"%Y-%m-%d","date":"$createdAt"}},"orders":{"$sum":1},"gross":{"$sum":"$total"}}},
                {"$sort":{"_id":1}}]
        }}
    ]
    result = await col.aggregate(pipeline).to_list(1)
    out = {"status":{}, "orders":0, "gross":0, "aov":0, "trend":[]}
    if result:
        r = result[0]
        for s in r.get("status_counts", []):
            out["status"][str(s["_id"]).upper()] = s["count"]
        tot = (r.get("totals") or [{}])[0] if r.get("totals") else {}
        orders = int(tot.get("orders",0))
        gross = float(tot.get("gross",0))
        out["orders"] = orders
        out["gross"] = gross
        out["aov"] = (gross / orders) if orders else 0
        out["trend"] = [{"t":x["_id"], "orders":x["orders"], "gross":x["gross"]} for x in r.get("trend",[])]
    return out

async def mpesa_success(days:int=30) -> Dict[str, Any]:
    col = db[COLLECTIONS["payments"]]
    since = _dt_ago(days)
    pipeline = [
        {"$match":{"createdAt":{"$gte": since}}},
        {"$facet":{
            "summary":[
                {"$group":{"_id":None,
                           "total":{"$sum":1},
                           "success":{"$sum":{"$cond":[{"$eq":["$resultCode",0]},1,0]}},
                           "fail":{"$sum":{"$cond":[{"$ne":["$resultCode",0]},1,0]}},
                           "amount":{"$sum":"$amount"},
                           "avgLatencyMs":{"$avg":"$latencyMs"}}}
            ],
            "trend":[
                {"$group":{"_id":{"$dateToString":{"format":"%Y-%m-%d","date":"$createdAt"}},
                           "success":{"$sum":{"$cond":[{"$eq":["$resultCode",0]},1,0]}},
                           "fail":{"$sum":{"$cond":[{"$ne":["$resultCode",0]},1,0]}},
                           "amount":{"$sum":"$amount"}}},
                {"$sort":{"_id":1}}
            ]
        }}
    ]
    result = await col.aggregate(pipeline).to_list(1)
    out = {"successRate":0.0, "total":0, "success":0, "fail":0, "amount":0, "avgLatencyMs":0, "trend":[]}
    if result:
        r = result[0]
        s = (r.get("summary") or [{}])[0]
        total = int(s.get("total",0))
        success = int(s.get("success",0))
        fail = int(s.get("fail",0))
        amount = float(s.get("amount",0))
        out.update({"total":total,"success":success,"fail":fail,"amount":amount,
                    "successRate": (success/total*100 if total else 0),
                    "avgLatencyMs": float(s.get("avgLatencyMs") or 0)})
        out["trend"] = [{"t":x["_id"], "success":x["success"], "fail":x["fail"], "amount":x["amount"]} for x in r.get("trend",[])]
    return out

async def commission_tracker(days:int=30) -> Dict[str, Any]:
    o = await orders_overview(days=days)
    gross = float(o.get("gross",0))
    commission = round(gross * 0.01, 2)
    net = gross - commission
    return {"gross":gross, "commission":commission, "net":net, "aov": o.get("aov",0), "orders": o.get("orders",0)}
