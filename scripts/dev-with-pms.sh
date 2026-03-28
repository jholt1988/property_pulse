#!/usr/bin/env bash
set -euo pipefail

PULSE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PMS_DIR="${PMS_DIR:-/data/.openclaw/workspace/pms-master}"

if [ ! -d "$PMS_DIR" ]; then
  echo "❌ pms-master directory not found: $PMS_DIR"
  echo "Set PMS_DIR env var and retry."
  exit 1
fi

echo "🚀 Starting pms-master backend dependencies..."
(
  cd "$PMS_DIR"
  docker compose up -d postgres redis mil backend
)

echo "✅ Backend stack is up (postgres/redis/mil/backend)."
echo "🌐 Backend expected at: http://127.0.0.1:3001/api"

echo "🚀 Starting property-pulse dev server..."
cd "$PULSE_DIR"
exec npm run dev
