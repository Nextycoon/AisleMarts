import os, time, json, yaml, requests, pytz
from datetime import datetime, timedelta
from dotenv import load_dotenv
from handlers.slack_handler import notify_slack
from handlers.email_handler import notify_email
from handlers.sms_handler import notify_sms

STATE_FILE = "alerts_state.json"

def load_yaml(path):
    with open(path, "r") as f:
        return yaml.safe_load(f)

def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    return {"open_alerts": {}}

def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def in_business_hours(tz_name, start_hour, end_hour):
    tz = pytz.timezone(tz_name)
    now = datetime.now(tz)
    return start_hour <= now.hour < end_hour

def fetch_metrics(api_base):
    # Uses Monitoring Kit endpoints
    r1 = requests.get(f"{api_base}/admin/metrics/mpesa", timeout=10).json()
    r2 = requests.get(f"{api_base}/admin/metrics/orders", timeout=10).json()
    r3 = requests.get(f"{api_base}/admin/metrics/commissions", timeout=10).json()
    return {"mpesa": r1, "orders": r2, "comm": r3}

def evaluate(thresholds, metrics):
    breaches = []

    # M-Pesa success rate
    ms = metrics["mpesa"].get("successRate", 0)/100.0 if metrics["mpesa"].get("successRate") is not None else 0
    limit = thresholds["thresholds"]["mpesa_success_rate"]["trigger_below"]
    if isinstance(limit, str):
        raise ValueError("Replace placeholder thresholds with numeric values")
    if ms < limit:
        breaches.append(("MPESA", "L2", {
            "title": "M-Pesa success rate dropped",
            "fields": {
                "Current": f"{ms*100:.1f}%",
                "Threshold": f"{limit*100:.1f}%",
                "Success": metrics["mpesa"].get("success",0),
                "Fail": metrics["mpesa"].get("fail",0)
            },
            "color": "#ff4d4f"
        }))

    # Orders pending >4h (approx via status + optional events — using status count heuristic here)
    pending_over_4h = metrics["orders"].get("status",{}).get("PENDING_OVER_4H", 0)  # if you pipe this from backend later
    # If not available, treat PENDING as proxy (set to 0 to avoid false alerts)
    if pending_over_4h is None:
        pending_over_4h = 0
    limit_p = thresholds["thresholds"]["orders_pending_over_4h"]["trigger_above"]
    if not isinstance(limit_p, (int, float)):
        raise ValueError("Replace placeholder thresholds with numeric values")
    if pending_over_4h > limit_p:
        breaches.append(("ORDERS", "L1", {
            "title": "Orders pending >4h above threshold",
            "fields": {
                "Current": pending_over_4h,
                "Threshold": limit_p
            },
            "color": "#ffa500"
        }))

    # Daily revenue drop (compare today's cumulative gross vs threshold)
    # We approximate from 30d trend last point; better implementation: add a /admin/metrics/today endpoint.
    trend = metrics["orders"].get("trend", [])
    today_gross = trend[-1]["gross"] if trend else 0
    rev_limit = thresholds["thresholds"]["daily_revenue_kes"]["trigger_below"]
    if not isinstance(rev_limit, (int, float)):
        raise ValueError("Replace placeholder thresholds with numeric values")
    if today_gross < rev_limit:
        breaches.append(("REVENUE", "L2", {
            "title": "Daily revenue (KES) below threshold",
            "fields": {
                "Current": round(today_gross),
                "Threshold": round(rev_limit)
            },
            "color": "#ff4d4f"
        }))

    # Commission accuracy (expected 1%)
    expected = thresholds["thresholds"]["commission_accuracy"]["expected_rate"]
    tol = thresholds["thresholds"]["commission_accuracy"]["tolerance"]
    observed_rate = 0.0
    gross = metrics["comm"].get("gross", 0) or 0
    commission = metrics["comm"].get("commission", 0) or 0
    if gross > 0:
        observed_rate = commission / gross
        if abs(observed_rate - expected) > tol:
            breaches.append(("COMMISSION", "L2", {
                "title": "Commission accuracy outside tolerance",
                "fields": {
                    "Observed Rate": f"{observed_rate*100:.3f}%",
                    "Expected": f"{expected*100:.2f}%",
                    "Tolerance": f"{tol*100:.2f}%"
                },
                "color": "#ffd166"
            }))

    return breaches

def escalate_and_notify(breaches, state, channels_cfg, esc_rules):
    tz = esc_rules["business_hours"]["timezone"]
    start_h = esc_rules["business_hours"]["start_hour"]
    end_h = esc_rules["business_hours"]["end_hour"]
    bh = in_business_hours(tz, start_h, end_h)

    for code, default_level, payload in breaches:
        key = code
        now = datetime.utcnow().isoformat()+"Z"
        level = default_level

        entry = state["open_alerts"].get(key)
        if entry:
            # escalate if age exceeded
            created = datetime.fromisoformat(entry["created"].replace("Z",""))
            minutes_open = (datetime.utcnow() - created).total_seconds()/60.0
            if entry["level"] == "L1" and minutes_open >= esc_rules["levels"]["L1"]["escalate_after_minutes"]:
                level = "L2"
            if entry["level"] in ("L2","L1") and minutes_open >= esc_rules["levels"]["L2"]["escalate_after_minutes"]:
                level = "L3"
        else:
            state["open_alerts"][key] = {"created": now, "level": level}

        state["open_alerts"][key]["level"] = level
        payload_lvl = level

        # channel routing
        title_prefix = {"L1":"[L1]","L2":"[L2]","L3":"[L3]"}[payload_lvl]
        payload["title"] = f"{title_prefix} {payload['title']}"

        # Slack always
        notify_slack(payload,
                     channel=channels_cfg.get("slack",{}).get("channel"),
                     username=channels_cfg.get("slack",{}).get("username"),
                     webhook_url=(os.getenv("SLACK_WEBHOOK") or channels_cfg.get("slack",{}).get("webhook_url")))

        # Email on L2+ or outside business hours
        if payload_lvl in ("L2","L3") or not bh:
            subj = payload["title"]
            fields = "".join([f"<li><b>{k}:</b> {v}</li>" for k,v in payload.get("fields",{}).items()])
            html = f"<h3>{subj}</h3><ul>{fields}</ul><p>Timestamp (UTC): {now}</p>"
            notify_email(subj, html)

        # SMS on L3
        if payload_lvl == "L3":
            notify_sms(payload["title"])

    # Auto-resolve logic: if a previous alert is not in breaches anymore, close it
    active_keys = {b[0] for b in breaches}
    for key in list(state["open_alerts"].keys()):
        if key not in active_keys:
            # send resolve notice
            notify_slack({"title": f"[RESOLVED] {key}", "fields": {}, "color":"#16a34a"})
            del state["open_alerts"][key]

    return state

def main_loop():
    load_dotenv()
    api_base = os.getenv("API_BASE","http://localhost:8000")
    thresholds = load_yaml("config/alert_thresholds.yaml")
    channels = load_yaml("config/notification_channels.yaml")
    esc = load_yaml("config/escalation_rules.yaml")
    state = load_state()

    api_failures = 0
    while True:
        try:
            metrics = fetch_metrics(api_base)
            api_failures = 0
            breaches = evaluate(thresholds, metrics)
            state = escalate_and_notify(breaches, state, channels, esc)
            save_state(state)
        except Exception as e:
            api_failures += 1
            # Burst detection
            limit = thresholds["thresholds"]["api_error_burst"]["trigger_over"]
            if api_failures > limit:
                notify_slack({"title":"[L1] API error burst detected",
                              "fields":{"Consecutive failures": api_failures, "Error": str(e)}})
        time.sleep(60)  # run every 60 seconds

if __name__ == "__main__":
    main_loop()
