#!/bin/bash
set -e

# ============================================================
#  在 ECS 上停止所有服务
#  用法: bash deploy/remote-stop.sh
# ============================================================

DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_DIR="$DIR/.pids"

echo "Stopping services..."

for svc in backend h5 admin; do
  PID_FILE="$PID_DIR/$svc.pid"
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
      kill "$PID"
      echo "  $svc (PID $PID) stopped."
    else
      echo "  $svc (PID $PID) already stopped."
    fi
    rm -f "$PID_FILE"
  else
    echo "  $svc: no PID file found."
  fi
done

echo "Done."
