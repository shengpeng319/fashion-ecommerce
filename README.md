# FashionEcommerce — 时尚电商平台

全栈时尚电商系统：面向 C 端用户的 H5 商城 + 微信小程序，面向 B 端的批发订货，面向内部的运营管理后台，以及股东投资门户。

## 目录

- [技术架构](#技术架构)
- [环境要求](#环境要求)
- [快速开始（本地开发）](#快速开始本地开发)
- [配置说明](#配置说明)
- [构建产物](#构建产物)
- [部署到服务器](#部署到服务器)
- [一键部署到阿里云 ECS](#一键部署到阿里云-ecs)
- [systemd 开机自启](#systemd-开机自启)
- [测试账号](#测试账号)
- [项目结构](#项目结构)
- [常见问题](#常见问题)

---

## 技术架构

| 组件 | 目录 | 技术栈 | 开发端口 | 生产端口 |
|------|------|--------|---------|---------|
| 后端 API | `backend/` | Express + TypeScript + Prisma + SQLite | 3001 | 3001 |
| H5 商城 | `frontend/` | uni-app (Vue 3) | 8080 | 8080 |
| 管理后台 | `admin/` | Vue 3 + Vite + Element Plus | 5173 | 8081 |
| 股东门户 | `shareholder-portal/` | Vue 3 + Vite + Element Plus | 8082 | 8082 |

**后端 API** 是所有前端应用的数据中心，使用 SQLite 数据库（文件 `backend/prisma/dev.db`），通过 Prisma ORM 管理数据模型。

生产环境下，H5 和管理后台使用自定义 Node.js 静态服务器（`deploy/serve-h5.mjs`、`deploy/serve-admin.mjs`）提供 SPA 服务并反向代理 API 请求到后端。

---

## 环境要求

- **Node.js** >= 18（推荐 LTS 版本）
- **npm** >= 9
- **rsync**（仅远程部署需要，macOS 自带，Ubuntu: `sudo apt install rsync`）
- **SSH 访问**（仅远程部署需要）

---

## 快速开始（本地开发）

### 1. 克隆仓库

```bash
git clone <仓库地址>
cd fashion-ecommerce
```

### 2. 创建环境配置

```bash
cp .env.example .env
```

默认配置即可用于本地开发，无需修改。

### 3. 安装依赖

```bash
# 后端
cd backend && npm install && cd ..

# H5 前端
cd frontend && npm install && cd ..

# 管理后台
cd admin && npm install && cd ..

# 股东门户（可选）
cd shareholder-portal && npm install && cd ..
```

### 4. 初始化数据库

```bash
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
cd ..
```

这会创建 SQLite 数据库文件并填充测试数据。

### 5. 启动开发服务

打开 3 个终端窗口分别运行：

```bash
# 终端 1 — 后端 API
cd backend && npm run dev

# 终端 2 — H5 商城
cd frontend && npm run dev:h5

# 终端 3 — 管理后台
cd admin && npm run dev
```

启动后访问：
- H5 商城：http://localhost:8080
- 管理后台：http://localhost:5173
- 后端 API：http://localhost:3001

---

## 配置说明

### 根目录 `.env`（全局配置）

所有端口和服务地址在此统一管理：

```env
# 服务器绑定地址
# 0.0.0.0 = 允许外部访问（服务器部署必须）
# 127.0.0.1 = 仅本机访问（本地开发）
HOST=0.0.0.0

# 后端 API
BACKEND_HOST=localhost
BACKEND_PORT=3001

# H5 商城端口
H5_PORT=8080

# 管理后台端口
ADMIN_PORT=8081
ADMIN_DEV_PORT=5173

# 股东门户端口
SHAREHOLDER_PORT=8082
SHAREHOLDER_BACKEND_PORT=8083

# E2E 测试端口
PLAYWRIGHT_PORT=3002
```

### 后端配置 `backend/.env`

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
```

> 生产环境请务必修改 `JWT_SECRET`。

### 配置加载机制

| 组件 | 加载方式 |
|------|---------|
| 后端 | 先加载根目录 `.env`，再加载 `backend/.env`（后者覆盖前者） |
| Admin Vite | `loadEnv(mode, resolve(__dirname, '..'), '')` 读取根 `.env` |
| Frontend Vite | 同上，读取根 `.env` |
| 生产静态服务器 | 内置 `.env` 解析器，读取根 `.env` |

---

## 构建产物

```bash
# 构建 H5 商城
cd frontend && npm run build:h5
# 产物: frontend/dist/build/h5/

# 构建管理后台
cd admin && npm run build
# 产物: admin/dist/

# 构建微信小程序（可选）
cd frontend && npm run build:mp-weixin
# 产物: frontend/dist/build/mp-weixin/
```

---

## 部署到服务器

适用于 Ubuntu、CentOS、Debian 等任意 Linux 发行版，也适用于 macOS 服务器。

### 1. 服务器准备

```bash
# 安装 Node.js 18+（Ubuntu 示例，使用 NodeSource）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证版本
node -v   # >= v18.0.0
npm -v    # >= 9.0.0
```

### 2. 上传项目

将项目上传到服务器 `/opt/fashion-ecommerce`：

```bash
# 方式 A: 使用部署脚本（推荐，见下一节）
./deploy/deploy-remote.sh

# 方式 B: 手动 rsync
rsync -avz --exclude 'node_modules' --exclude '.env' \
  ./ user@your-server:/opt/fashion-ecommerce/

# 方式 C: scp / ftp / 其他工具
```

### 3. 服务器上安装

```bash
ssh user@your-server

cd /opt/fashion-ecommerce

# 创建环境配置
cp .env.example .env
# 编辑 .env，确保 HOST=0.0.0.0

# 编辑后端配置
nano backend/.env
# 确认 DATABASE_URL 和 JWT_SECRET

# 安装后端依赖
cd backend
npm install --production
npx prisma generate
npx prisma db push
npm run db:seed    # 首次部署时初始化数据
cd ..

# 创建必要目录
mkdir -p uploads logs .pids
```

### 4. 启动服务

```bash
# 方式 A: 使用启动脚本
bash deploy/remote-start.sh

# 方式 B: 手动逐个启动
# 后端
cd backend && PORT=3001 HOST=0.0.0.0 nohup npx tsx src/index.ts > ../logs/backend.log 2>&1 &
# H5
nohup node deploy/serve-h5.mjs > logs/h5.log 2>&1 &
# 管理后台
nohup node deploy/serve-admin.mjs > logs/admin.log 2>&1 &
```

### 5. 停止服务

```bash
bash deploy/remote-stop.sh
```

### 6. 防火墙放行

确保服务器防火墙/安全组开放以下端口：

| 端口 | 用途 |
|------|------|
| 3001 | 后端 API |
| 8080 | H5 商城 |
| 8081 | 管理后台 |

**阿里云/腾讯云：** 在控制台 → 安全组 → 入方向规则中添加。

**Ubuntu UFW：**
```bash
sudo ufw allow 3001/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 8081/tcp
```

**CentOS firewalld：**
```bash
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --reload
```

---

## 一键部署到阿里云 ECS

适合从本地开发机直接部署到阿里云 ECS（Ubuntu）。

### 前提

- 本机已安装 Node.js 18+ 和 rsync
- ECS 已安装 Node.js 18+
- 本机可通过 SSH 登录 ECS（推荐密钥登录）
- ECS 安全组已开放 3001、8080、8081 端口

### 执行

```bash
# 交互式（会提示输入 ECS IP）
./deploy/deploy-remote.sh

# 或直接指定
ECS_HOST=47.xxx.xxx.xxx ./deploy/deploy-remote.sh

# 指定用户
ECS_HOST=47.xxx.xxx.xxx ECS_USER=root ./deploy/deploy-remote.sh
```

脚本自动执行：本地构建 → rsync 上传 → 远程安装依赖 → 启动服务。

### 更新部署

代码修改后，再次运行同一命令即可：

```bash
ECS_HOST=47.xxx.xxx.xxx ./deploy/deploy-remote.sh
```

---

## systemd 开机自启

在服务器上执行一次，实现服务开机自启 + 崩溃自动重启：

```bash
sudo bash /opt/fashion-ecommerce/deploy/setup-systemd.sh
```

安装后的日常运维命令：

```bash
# 查看所有服务状态
systemctl status fashion-backend fashion-h5 fashion-admin

# 查看后端实时日志
journalctl -u fashion-backend -f

# 重启单个服务
sudo systemctl restart fashion-backend

# 停止所有服务
sudo systemctl stop fashion-backend fashion-h5 fashion-admin

# 启动所有服务
sudo systemctl start fashion-backend fashion-h5 fashion-admin
```

---

## 测试账号

| 角色 | 手机号 | 密码 |
|------|--------|------|
| 管理员 | 13800138001 | admin123 |
| 普通用户 | 13800138000 | 123456 |

---

## 项目结构

```
fashion-ecommerce/
├── .env                        # 全局环境配置（端口、主机）
├── .env.example                # 配置模板
├── backend/                    # 后端 API 服务
│   ├── prisma/
│   │   ├── schema.prisma       # 数据库模型定义（20+ 表）
│   │   ├── dev.db              # SQLite 数据库文件
│   │   └── seed.ts             # 数据填充脚本
│   ├── src/
│   │   ├── index.ts            # 入口文件
│   │   ├── routes/             # API 路由
│   │   ├── controllers/        # 业务逻辑
│   │   ├── middleware/         # 认证、上传等中间件
│   │   └── services/           # 服务层
│   ├── uploads/                # 上传文件目录
│   └── .env                    # 后端专属配置（数据库、JWT）
├── frontend/                   # H5 商城 + 微信小程序
│   └── src/
│       ├── pages/              # 页面（首页、商品、购物车、订单...）
│       ├── components/         # 公共组件
│       ├── store/              # Pinia 状态管理
│       └── utils/              # 工具函数
├── admin/                      # 管理后台
│   └── src/
│       ├── views/              # 页面视图
│       ├── api/                # API 调用层
│       ├── router/             # 路由配置
│       └── stores/             # Pinia 状态管理
├── shareholder-portal/         # 股东投资门户
│   └── src/
│       ├── views/
│       ├── api/
│       └── router/
├── deploy/                     # 部署工具
│   ├── deploy.sh               # 本地一键启动
│   ├── deploy-remote.sh        # 远程部署脚本
│   ├── remote-start.sh         # 远程启动服务
│   ├── remote-stop.sh          # 远程停止服务
│   ├── serve-h5.mjs            # H5 生产静态服务器
│   ├── serve-admin.mjs         # 管理后台生产静态服务器
│   ├── setup-systemd.sh        # 安装 systemd 服务
│   └── systemd/                # systemd 配置文件
│       ├── fashion-backend.service
│       ├── fashion-h5.service
│       └── fashion-admin.service
└── docs/                       # 设计文档
    ├── API.md
    ├── DATABASE.md
    └── PAGES.md
```

---

## 常见问题

### Q: 访问服务器 IP 无法打开页面？

1. 确认 `.env` 中 `HOST=0.0.0.0`（不能是 `127.0.0.1`）
2. 确认防火墙/安全组已放行对应端口
3. 确认服务已启动：`curl http://localhost:3001/health`

### Q: 后端启动失败，报 Prisma 错误？

```bash
cd backend
npx prisma generate
npx prisma db push
```

### Q: 如何修改端口？

编辑根目录 `.env`，修改对应端口后重启所有服务。

### Q: 数据库文件在哪？

`backend/prisma/dev.db`（SQLite 文件数据库）。备份时复制此文件即可。

### Q: 如何重置数据库？

```bash
cd backend
rm prisma/dev.db
npx prisma db push
npm run db:seed
```

### Q: 如何查看服务日志？

```bash
# 使用 nohup 启动时
cat /opt/fashion-ecommerce/logs/backend.log

# 使用 systemd 时
journalctl -u fashion-backend -f
```

### Q: 上传的图片存储在哪？

`backend/uploads/` 目录，通过后端 API `/uploads/` 路径访问。

### Q: 股东门户如何部署？

股东门户目前仅支持开发模式。生产部署可参照 `serve-admin.mjs` 创建类似的静态服务器，或将端口配置加入 `remote-start.sh`。
