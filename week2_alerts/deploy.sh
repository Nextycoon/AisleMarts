#!/usr/bin/env bash
set -e
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp -n .env.example .env || true
echo "Edit .env with your API base and channel creds, then run:"
echo "source .venv/bin/activate && python alert_engine.py"
