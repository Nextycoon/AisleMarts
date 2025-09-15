# Week-2 Smart Alert Kit — Kenya Pilot (Plug-and-Play)
**Generated:** 2025-09-15T16:50:31.459147Z

This kit turns your Week‑1 baselines into **actionable Week‑2 smart alerts** across Slack, Email, and SMS — calibrated for **M‑Pesa payments**, **orders**, **revenue**, and **commission accuracy**.

## What’s Included
- `config/alert_thresholds.yaml` — **Replace placeholders** with Week‑1 numbers (decimals for %)
- `config/notification_channels.yaml` — Slack/Email/SMS targets (ENV overrides supported)
- `config/escalation_rules.yaml` — L1→L2→L3 timing + Nairobi business hours
- `handlers/*.py` — Slack, Email, SMS notifiers
- `alert_engine.py` — Polls your Monitoring API, evaluates thresholds, escalates & notifies
- `requirements.txt` — Minimal Python deps
- `deploy.sh` — Quick bootstrap script
- `.env.example` — API base + channel creds

## Day‑8 Setup (after Week‑1 baselines)
1. Open `config/alert_thresholds.yaml` and fill:
   - `mpesa_success_rate.trigger_below` — e.g., `0.912` for 91.2%
   - `orders_pending_over_4h.trigger_above` — e.g., `3`
   - `daily_revenue_kes.trigger_below` — e.g., `19950`
2. Update `config/notification_channels.yaml` or set ENV in `.env` (Slack webhook, SMTP, SMS).

## Day‑9 Run
```bash
./deploy.sh
# then:
source .venv/bin/activate
python alert_engine.py
```
The engine polls your Monitoring API every 60s:
- `GET $API_BASE/admin/metrics/mpesa`
- `GET $API_BASE/admin/metrics/orders`
- `GET $API_BASE/admin/metrics/commissions`

## Notes
- Percent values are **decimals** (e.g., 0.962 for 96.2%).
- Commission tolerance defaults to ±0.01% around 1.00%.
- Auto‑resolve posts `[RESOLVED]` when metrics return to baseline.
- Escalation: L1→L2 after 120 min, L2→L3 after 60 min (edit in `escalation_rules.yaml`).

## Best Practices
- Start with Slack only, enable Email/SMS after dry‑run.
- Tune thresholds after the first few days of Week‑2.
- Consider adding a backend metric for `PENDING_OVER_4H` to replace the proxy in `alert_engine.py`.

**Smarter. Faster. Everywhere.** 🇰🇪
