import os, json, requests

def notify_slack(payload: dict, channel: str=None, username: str=None, webhook_url: str=None):
    webhook = webhook_url or os.getenv("SLACK_WEBHOOK")
    if not webhook:
        return {"ok": False, "error": "SLACK_WEBHOOK not set"}
    body = {
        "username": username or os.getenv("SLACK_USERNAME","AisleMarts Alerts"),
        "channel": channel or os.getenv("SLACK_CHANNEL","#ops-kenya"),
        "text": payload.get("title","AisleMarts Alert"),
        "attachments": [{
            "color": payload.get("color","#ff4d4f"),
            "fields": [{"title": k, "value": str(v), "short": True} for k,v in payload.get("fields",{}).items()]
        }]
    }
    try:
        r = requests.post(webhook, data=json.dumps(body), headers={"Content-Type":"application/json"}, timeout=10)
        return {"ok": r.ok, "status": r.status_code, "resp": r.text[:200]}
    except Exception as e:
        return {"ok": False, "error": str(e)}
