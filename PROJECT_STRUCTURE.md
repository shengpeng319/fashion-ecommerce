# 时尚女装电商小程序 - 项目结构

## 技术栈

### 前端
- **框架**：uni-app (Vue 3 + TypeScript)
- **UI组件**：Vant Weapp
- **状态管理**：Pinia
- **网络请求**：uni.request / Axios
- **目标平台**：微信小程序

### 后端
- **框架**：Express.js + TypeScript
- **ORM**：Prisma
- **数据库**：MySQL
- **认证**：JWT

## 项目目录结构

```
fashion-ecommerce/
├── frontend/                 # 前端 (uni-app)
│   ├── src/
│   │   ├── api/             # API 请求
│   │   ├── components/      # 公共组件
│   │   ├── pages/           # 页面
│   │   │   ├── index/       # 首页
│   │   │   ├── category/    # 分类
│   │   │   ├── cart/        # 购物车
│   │   │   ├── user/        # 个人中心
│   │   │   ├── goods/       # 商品详情
│   │   │   ├── order/       # 订单
│   │   │   └── wholesale/   # 批发商专用
│   │   ├── static/          # 静态资源
│   │   ├── store/           # Pinia 状态管理
│   │   ├── styles/          # 全局样式
│   │   ├── utils/           # 工具函数
│   │   ├── App.vue
│   │   ├── main.ts
│   │   ├── manifest.json
│   │   └── pages.json
│   ├── package.json
│   └── uni.scss
│
├── backend/                  # 后端 (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   ├── controllers/      # 控制器
│   │   ├── middlewares/      # 中间件
│   │   ├── models/          # Prisma 模型
│   │   ├── routes/          # 路由
│   │   ├── services/        # 业务逻辑
│   │   ├── utils/           # 工具函数
│   │   ├── prisma/          # Prisma schema
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                     # 文档
    ├── API.md
    ├── DATABASE.md
    └── PAGES.md
```

## 核心数据模型

### 用户体系
- User（用户）
- Address（收货地址）
- Member（会员）

### 商品体系
- Category（分类）
- Product（商品）
- SKU（规格）
- Brand（品牌）

### 订单体系
- Order（订单）
- OrderItem（订单商品）
- Cart（购物车）

### B端批发
- Dealer（经销商）
- WholesaleProduct（批发商品）
- WholesaleOrder（批发订单）

## 页面清单

### C端（零售）
| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | pages/index/index | 轮播、商品推荐 |
| 分类 | pages/category/index | 商品分类 |
| 购物车 | pages/cart/index | 购物车管理 |
| 商品详情 | pages/goods/detail | 商品展示、购买 |
| 提交订单 | pages/order/create | 确认订单 |
| 订单列表 | pages/order/list | 订单管理 |
| 订单详情 | pages/order/detail | 订单状态 |
| 用户中心 | pages/user/index | 会员信息 |
| 地址管理 | pages/address/list | 收货地址 |
| 会员权益 | pages/member/benefits | 会员等级 |

### B端（批发商）
| 页面 | 路径 | 功能 |
|------|------|------|
| 批发首页 | pages/wholesale/index | 批发商品 |
| 批量下单 | pages/wholesale/order | 批量采购 |
| 批发订单 | pages/wholesale/orders | 订单管理 |
| 经销商管理 | pages/wholesale/dealer | 账户管理 |

