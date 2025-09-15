#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
cp -n .env.example .env || true
echo "Starting AisleMarts Pilot Monitoring (API + Web)..."
docker compose up
