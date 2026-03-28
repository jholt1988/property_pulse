#!/usr/bin/env bash
set -euo pipefail

PMS_DIR="${PMS_DIR:-/data/.openclaw/workspace/pms-master}"

if [ ! -d "$PMS_DIR" ]; then
  echo "❌ pms-master directory not found: $PMS_DIR"
  echo "Set PMS_DIR env var and retry."
  exit 1
fi

echo "🛑 Stopping pms-master stack..."
cd "$PMS_DIR"
docker compose stop postgres redis mil backend frontend workflow-engine ml-service || true

echo "✅ Done."
