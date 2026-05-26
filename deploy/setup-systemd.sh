#!/bin/bash
set -e

# ============================================================
#  在 ECS 上安装 systemd 服务（开机自启 + 自动重启）
#  用法: sudo bash deploy/setup-systemd.sh
# ============================================================

DIR="$(cd "$(dirname "$0")/.." && pwd)"
SERVICES="fashion-backend fashion-h5 fashion-admin"

echo ">>> 安装 systemd 服务文件..."
for svc in $SERVICES; do
  cp "$DIR/deploy/systemd/$svc.service" /etc/systemd/system/
  echo "  已安装 $svc.service"
done

echo ">>> 停止旧进程..."
bash "$DIR/deploy/remote-stop.sh" 2>/dev/null || true

echo ">>> 启用并启动服务..."
systemctl daemon-reload
for svc in $SERVICES; do
  systemctl enable "$svc"
  systemctl start "$svc"
  echo "  $svc: $(systemctl is-active $svc)"
done

echo ""
echo "============================================"
echo "  systemd 服务已安装"
echo "============================================"
echo "  查看状态:  systemctl status fashion-backend"
echo "  查看日志:  journalctl -u fashion-backend -f"
echo "  重启服务:  systemctl restart fashion-backend"
echo "  停止服务:  systemctl stop fashion-backend fashion-h5 fashion-admin"
echo "============================================"
