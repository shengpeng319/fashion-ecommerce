#!/bin/bash
set -e

# ============================================================
#  FashionEcommerce 一键部署到阿里云 ECS
#
#  用法:
#    ./deploy/deploy-remote.sh                     # 交互式输入 ECS IP
#    ECS_HOST=47.xxx.xxx.xxx ./deploy/deploy-remote.sh
#    ECS_HOST=47.xxx.xxx.xxx ECS_USER=root ./deploy/deploy-remote.sh
#
#  前提:
#    - 本机已安装 Node.js 18+ 和 rsync
#    - ECS 已安装 Node.js 18+、build-essential、python3
#      （脚本会自动尝试安装，但建议提前装好）
#    - 本机可通过 SSH 密钥登录 ECS（推荐）或密码登录
#    - ECS 安全组已开放对应端口
#
#  首次部署 vs 更新部署:
#    - 首次部署会自动创建 backend/.env、初始化数据库、seed 数据
#    - 更新部署只重启服务，不覆盖已有数据库
# ============================================================

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_DIR="/opt/fashion-ecommerce"
ECS_HOST="${ECS_HOST:-}"
ECS_USER="${ECS_USER:-root}"

if [ -f "$ROOT/.env" ]; then
  set -a
  source "$ROOT/.env"
  set +a
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
H5_PORT=${H5_PORT:-8080}
ADMIN_PORT=${ADMIN_PORT:-8081}

if [ -z "$ECS_HOST" ]; then
  echo "请输入阿里云 ECS 公网 IP 地址:"
  read -r ECS_HOST
  if [ -z "$ECS_HOST" ]; then
    echo "错误: 未输入 IP 地址"
    exit 1
  fi
fi

SSH_TARGET="$ECS_USER@$ECS_HOST"
echo ""
echo "============================================"
echo "  FashionEcommerce 远程部署"
echo "============================================"
echo "  ECS:       $SSH_TARGET"
echo "  远程目录:  $REMOTE_DIR"
echo "  后端端口:  $BACKEND_PORT"
echo "  H5 端口:   $H5_PORT"
echo "  管理后台:  $ADMIN_PORT"
echo "============================================"
echo ""

# --- Step 1: 本地构建 ---
echo ">>> [1/5] 构建 Frontend H5..."
cd "$ROOT/frontend" && npm run build:h5

echo ">>> [1/5] 构建 Admin..."
cd "$ROOT/admin" && npm run build

echo ""

# --- Step 2: 上传文件 ---
echo ">>> [2/5] 上传文件到 ECS..."

ssh "$SSH_TARGET" "mkdir -p $REMOTE_DIR/{backend,frontend/dist/build/h5,admin/dist,deploy,uploads,logs,.pids}"

# 后端：排除 node_modules、数据库文件、已有的 .env
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude 'dev.db' \
  --exclude 'dev.db-journal' \
  --exclude '.env' \
  "$ROOT/backend/" "$SSH_TARGET:$REMOTE_DIR/backend/"

rsync -avz --delete \
  "$ROOT/frontend/dist/build/h5/" "$SSH_TARGET:$REMOTE_DIR/frontend/dist/build/h5/"

rsync -avz --delete \
  "$ROOT/admin/dist/" "$SSH_TARGET:$REMOTE_DIR/admin/dist/"

rsync -avz \
  "$ROOT/deploy/" "$SSH_TARGET:$REMOTE_DIR/deploy/"

rsync -avz \
  "$ROOT/.env" "$SSH_TARGET:$REMOTE_DIR/.env"

echo ""

# --- Step 3: 远程环境准备 ---
echo ">>> [3/5] 在 ECS 上安装依赖 + 配置环境..."
ssh "$SSH_TARGET" << REMOTE_SETUP
set -e

# 安装编译工具（bcrypt/sharp 等原生模块需要）
apt-get update -qq 2>/dev/null && apt-get install -y -qq build-essential python3 lsof 2>/dev/null || true

cd $REMOTE_DIR

# 创建 backend/.env（如果不存在）
if [ ! -f backend/.env ]; then
  echo "Creating backend/.env..."
  JWT_SECRET=\$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  cat > backend/.env << ENVFILE
DATABASE_URL="file:./dev.db"
JWT_SECRET="\$JWT_SECRET"
PORT=$BACKEND_PORT
ENVFILE
  echo "  backend/.env created with random JWT_SECRET"
else
  echo "  backend/.env already exists, keeping it"
fi

# 安装后端依赖
cd backend
npm install
npx prisma generate

# 初始化数据库（仅首次）
if [ ! -f prisma/dev.db ]; then
  echo "Initializing database..."
  npx prisma db push
  npm run db:seed
  echo "Database initialized and seeded"
else
  echo "Database already exists, skipping seed"
  npx prisma db push 2>/dev/null || true
fi
REMOTE_SETUP

echo ""

# --- Step 4: 停止旧服务 + 启动新服务 ---
echo ">>> [4/5] 重启服务..."
ssh "$SSH_TARGET" << REMOTE_START
cd $REMOTE_DIR
chmod +x deploy/*.sh deploy/*.mjs

bash deploy/remote-stop.sh 2>/dev/null || true
sleep 1

bash deploy/remote-start.sh
REMOTE_START

echo ""

# --- Step 5: 健康检查 ---
echo ">>> [5/5] 健康检查..."
sleep 2

ssh "$SSH_TARGET" bash -s << REMOTE_CHECK
  HEALTH=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/health 2>/dev/null || echo "000")
  H5_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$H5_PORT/ 2>/dev/null || echo "000")
  ADMIN_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$ADMIN_PORT/ 2>/dev/null || echo "000")
  echo "  Backend API: \$HEALTH"
  echo "  H5 商城:    \$H5_STATUS"
  echo "  Admin 后台: \$ADMIN_STATUS"
REMOTE_CHECK

echo ""
echo "============================================"
echo "  部署完成！"
echo "============================================"
echo "  H5 商城:    http://$ECS_HOST:$H5_PORT"
echo "  管理后台:   http://$ECS_HOST:$ADMIN_PORT"
echo "  后端 API:   http://$ECS_HOST:$BACKEND_PORT"
echo ""
echo "  管理员账号: 13800138001 / admin123"
echo "  测试用户:   13800138000 / 123456"
echo ""
echo "  查看日志: ssh $SSH_TARGET 'tail -f $REMOTE_DIR/logs/backend.log'"
echo "============================================"
