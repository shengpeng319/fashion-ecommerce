#!/bin/bash
set -e

# ============================================================
#  在 ECS 上启动所有服务
#  用法: bash deploy/remote-start.sh
# ============================================================

DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"

# 加载 .env
if [ -f "$DIR/.env" ]; then
  set -a
  source "$DIR/.env"
  set +a
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
H5_PORT=${H5_PORT:-8080}
ADMIN_PORT=${ADMIN_PORT:-8081}
HOST=${HOST:-0.0.0.0}
BACKEND_HOST=${BACKEND_HOST:-localhost}

PID_DIR="$DIR/.pids"
mkdir -p "$PID_DIR"

# --- 启动后端 ---
echo "Starting backend on port $BACKEND_PORT..."
cd "$DIR/backend"
PORT=$BACKEND_PORT HOST=$HOST nohup npx tsx src/index.ts > "$DIR/logs/backend.log" 2>&1 &
echo $! > "$PID_DIR/backend.pid"
cd "$DIR"

# 等待后端启动
echo "Waiting for backend to be ready..."
for i in $(seq 1 30); do
  if curl -s "http://$BACKEND_HOST:$BACKEND_PORT/health" > /dev/null 2>&1; then
    echo "Backend is ready."
    break
  fi
  sleep 1
done

# --- 启动 H5 ---
echo "Starting H5 on port $H5_PORT..."
mkdir -p "$DIR/logs"
H5_PORT=$H5_PORT HOST=$HOST nohup node "$DIR/deploy/serve-h5.mjs" > "$DIR/logs/h5.log" 2>&1 &
echo $! > "$PID_DIR/h5.pid"

# --- 启动 Admin ---
echo "Starting admin on port $ADMIN_PORT..."
ADMIN_PORT=$ADMIN_PORT HOST=$HOST nohup node "$DIR/deploy/serve-admin.mjs" > "$DIR/logs/admin.log" 2>&1 &
echo $! > "$PID_DIR/admin.pid"

echo ""
echo "All services started."
echo "  Backend:  http://$HOST:$BACKEND_PORT  (PID $(cat "$PID_DIR/backend.pid"))"
echo "  H5:       http://$HOST:$H5_PORT       (PID $(cat "$PID_DIR/h5.pid"))"
echo "  Admin:    http://$HOST:$ADMIN_PORT     (PID $(cat "$PID_DIR/admin.pid"))"
echo ""
echo "Logs: $DIR/logs/"
echo "PIDs: $PID_DIR/"
