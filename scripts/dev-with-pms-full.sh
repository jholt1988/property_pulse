#!/usr/bin/env bash
set -euo pipefail

PULSE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PMS_DIR="${PMS_DIR:-../pms-master}"

if [ ! -d "$PMS_DIR" ]; then
  echo "❌ pms-master directory not found: $PMS_DIR"
  echo "Set PMS_DIR env var and retry."
  exit 1
fi

echo "🚀 Starting full pms-master stack (core + property-os + ml)..."
(
  cd "$PMS_DIR"
  docker compose --profile property-os --profile ml up -d postgres redis mil backend workflow-engine ml-service --build
)

echo "✅ Full backend stack is up."
echo "🌐 Backend expected at: http://127.0.0.1:3001/api"

echo "🚀 Starting property-pulse dev server..."
cd "$PULSE_DIR"
exec npm run dev
