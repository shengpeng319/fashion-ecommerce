#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_DIR="$DIR/.pids"

if [ -f "$DIR/.env" ]; then
  set -a; source "$DIR/.env"; set +a
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
H5_PORT=${H5_PORT:-8080}
ADMIN_PORT=${ADMIN_PORT:-8081}

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
    echo "  $svc: no PID file."
  fi
done

# Fallback: kill any remaining processes on service ports
echo "Checking for orphaned processes on ports..."
for port in $BACKEND_PORT $H5_PORT $ADMIN_PORT; do
  ORPHANS=$(lsof -ti:$port 2>/dev/null || true)
  if [ -n "$ORPHANS" ]; then
    echo "  Killing orphaned process(es) on port $port: $ORPHANS"
    echo "$ORPHANS" | xargs kill 2>/dev/null || true
  fi
done

echo "Done."
