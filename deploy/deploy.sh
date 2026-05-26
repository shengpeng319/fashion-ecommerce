#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# 加载根目录 .env 配置
if [ -f "$ROOT/.env" ]; then
  set -a
  source "$ROOT/.env"
  set +a
fi

# 使用环境变量（带默认值）
BACKEND_PORT=${BACKEND_PORT:-3001}
BACKEND_HOST=${BACKEND_HOST:-localhost}
H5_PORT=${H5_PORT:-8080}
ADMIN_PORT=${ADMIN_PORT:-8081}
HOST=${HOST:-0.0.0.0}

echo "=== Building all services ==="

# Build frontend H5
echo "[1/2] Building frontend H5..."
cd "$ROOT/frontend" && npm run build:h5

# Build admin
echo "[2/2] Building admin..."
cd "$ROOT/admin" && npm run build

echo ""
echo "=== Starting services ==="
echo "Config: HOST=$HOST BACKEND_PORT=$BACKEND_PORT H5_PORT=$H5_PORT ADMIN_PORT=$ADMIN_PORT"

# Start backend
cd "$ROOT/backend"
PORT=$BACKEND_PORT HOST=$HOST npx tsx src/index.ts &
BACKEND_PID=$!
echo "Backend: http://$BACKEND_HOST:$BACKEND_PORT (PID $BACKEND_PID)"

# Start admin preview
cd "$ROOT/admin"
npx vite preview --port "$ADMIN_PORT" --strictPort --host "$HOST" &
ADMIN_PID=$!
echo "Admin:    http://$BACKEND_HOST:$ADMIN_PORT (PID $ADMIN_PID)"

# Start H5 frontend
cd "$ROOT"
node "$ROOT/deploy/serve-h5.mjs" &
H5_PID=$!

echo ""
echo "=== All services running ==="
echo "Backend:   http://$BACKEND_HOST:$BACKEND_PORT"
echo "Website:   http://$BACKEND_HOST:$H5_PORT"
echo "Admin:     http://$BACKEND_HOST:$ADMIN_PORT"
echo ""
echo "Press Ctrl+C to stop all services"

cleanup() {
  echo ""
  echo "Stopping services..."
  kill $BACKEND_PID 2>/dev/null
  kill $ADMIN_PID 2>/dev/null
  kill $H5_PID 2>/dev/null
  wait 2>/dev/null
  echo "Done."
}
trap cleanup INT TERM

wait
