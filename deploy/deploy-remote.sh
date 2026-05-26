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
#    - ECS 已安装 Node.js 18+
#    - 本机可通过 SSH 密钥登录 ECS（推荐）或密码登录
#    - ECS 安全组已开放 3001, 8080, 8081 端口
# ============================================================

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE_DIR="/opt/fashion-ecommerce"
ECS_HOST="${ECS_HOST:-}"
ECS_USER="${ECS_USER:-root}"

# --- 加载 .env ---
if [ -f "$ROOT/.env" ]; then
  set -a
  source "$ROOT/.env"
  set +a
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
H5_PORT=${H5_PORT:-8080}
ADMIN_PORT=${ADMIN_PORT:-8081}

# --- 交互式输入 ---
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
echo ">>> [1/4] 构建 Frontend H5..."
cd "$ROOT/frontend" && npm run build:h5

echo ">>> [1/4] 构建 Admin..."
cd "$ROOT/admin" && npm run build

echo ""

# --- Step 2: 上传文件 ---
echo ">>> [2/4] 上传文件到 ECS..."

ssh "$SSH_TARGET" "mkdir -p $REMOTE_DIR/backend $REMOTE_DIR/frontend/dist/build/h5 $REMOTE_DIR/admin/dist $REMOTE_DIR/deploy $REMOTE_DIR/uploads"

rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude 'dev.db' \
  --exclude 'dev.db-journal' \
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

# --- Step 3: 远程安装依赖 ---
echo ">>> [3/4] 在 ECS 上安装后端依赖..."
ssh "$SSH_TARGET" << 'REMOTE_INSTALL'
cd /opt/fashion-ecommerce/backend
npm install --production
npm exec prisma generate
REMOTE_INSTALL

echo ""

# --- Step 4: 启动服务 ---
echo ">>> [4/4] 启动服务..."
ssh "$SSH_TARGET" << REMOTE_START
cd /opt/fashion-ecommerce
chmod +x deploy/*.sh deploy/*.mjs

# 停止旧服务
bash deploy/remote-stop.sh 2>/dev/null || true

# 启动新服务
bash deploy/remote-start.sh
REMOTE_START

echo ""
echo "============================================"
echo "  部署完成！"
echo "============================================"
echo "  后端 API:   http://$ECS_HOST:$BACKEND_PORT"
echo "  H5 商城:    http://$ECS_HOST:$H5_PORT"
echo "  管理后台:   http://$ECS_HOST:$ADMIN_PORT"
echo ""
echo "  管理员账号: 13800138001 / admin123"
echo "  测试用户:   13800138000 / 123456"
echo "============================================"
