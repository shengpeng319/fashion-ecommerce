# FashionEcommerce 视觉改进计划 — 简约 Ins 风

## 现状诊断

### 🔴 核心问题
1. **双系统冲突** — `uni.scss`（意大利酒红色 + Playfair Display 衬线体）vs `common.scss`（极简白 + 红色 #C8102E），两套 design token 并存，实际页面用 common.scss 的 CSS 变量
2. **Ins 风格不统一** — 首页 StorySwiper 是沉浸式全屏 Ins Stories 风格（✅ 好），但商城/购物车/个人中心等页面风格断裂，回到传统电商
3. **字体无层次** — 纯系统字体，没有品牌识别度，无标题/正文区分
4. **配色过冲** — accent #C8102E 太刺眼，和暖色调不搭
5. **Admin vs Frontend 割裂** — Admin 用酒红 #6B1D2F，Frontend 用红 #C8102E，毫无联系

---

## 改进方案

### 一、统一色彩系统

**目标**: 暖中性 Ins 风 — 米白底 + 炭黑字 + 陶土色 accent

```
旧 → 新
--bg-primary:    #FFFFFF  → #FAFAF8  (暖白，不是冷白)
--bg-secondary:  #F5F5F5  → #F5F2EE  (暖灰米)
--bg-tertiary:   #EFEFEF  → #EDE8E2  (温暖深灰米)
--bg-card:       #FFFFFF  → #FFFFFF  (卡片保持纯白对比)

--text-primary:    #1A1A1A → #1C1B1A  (暖炭黑)
--text-secondary:  #333333 → #4A4744  (暖深灰)
--text-tertiary:   #666666 → #7A7370  (暖中灰)
--text-quaternary: #999999 → #A8A29E  (暖浅灰)

--accent:       #C8102E → #B85C38  (陶土棕 Terracotta)
--accent-hover: #A50D24 → #A04E2E
--accent-light: #FFF1F3 → #F9EDE8  (陶土浅色背景)

--border:       #EEEEEE → #E8E2DC  (暖边框)
--divider:      #F0F0F0 → #F0EBE5
```

**影响文件**:
- `frontend/src/styles/common.scss` — 替换 `:root` 变量
- `frontend/src/uni.scss` — 废弃旧 token，改为 import common.scss 的变量
- `admin/src/style.css` — 同步主色 `--fashion-primary: #B85C38`
- `shareholder-portal/src/style.css` — 同步

### 二、字体系统

**目标**: 现代无衬线 + 中文优化，Ins 风格的轻盈感

```scss
// 新字体栈
--font-display: 'Inter', 'PingFang SC', 'Hiragino Sans GB', sans-serif;  // 标题/数字
--font-body:    'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;    // 正文
--font-mono:    'SF Mono', 'JetBrains Mono', monospace;                   // 代码/数字标签

// 字号层级（rpx = uni-app 单位）
--text-xs:   20rpx;   // 标签/辅助
--text-sm:   24rpx;   // 次要信息
--text-base: 28rpx;   // 正文
--text-md:   32rpx;   // 强调正文
--text-lg:   36rpx;   // 卡片标题
--text-xl:   44rpx;   // 页面标题
--text-2xl:  56rpx;   // Hero 大标题

// 字重
--fw-light:    300;   // Ins 风格细体标题
--fw-regular:  400;
--fw-medium:   500;
--fw-semibold: 600;
--fw-bold:     700;
```

**Ins 风关键**:
- 标题用 `font-weight: 300-400`（轻细），不是粗体
- 大量使用 `letter-spacing: 1-2rpx` 增加呼吸感
- 数字（价格）用 `font-weight: 600` 突出
- 废弃 Playfair Display 衬线体（Admin 中也要移除）

**加载方式**:
- H5: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');`
- 小程序: 系统字体兜底（PingFang SC 已足够好看）

### 三、布局改进

#### 3.1 ProductCard 重新设计

**当前**: 白底卡片，小圆角 8rpx，微阴影，信息密集
**改进**:
```
- 圆角加大: 8rpx → 20rpx
- 阴影: 改为更柔和的多层阴影
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04), 0 1rpx 2rpx rgba(0,0,0,0.02);
- 图片区比例: 1:1 → 4:5（Ins 经典竖版比例）
- 商品名: font-weight 500 → 400, 增加 line-clamp 2 行
- 价格: 用陶土色 accent，增大到 40rpx
- "已售" 文字: 改为更小更淡，或用 emoji 替代
- 折扣标签: 从方角改为胶囊型 (border-radius: 999rpx)
```

#### 3.2 分类页 (Category)

**当前**: 传统列表
**改进**:
```
- 顶部搜索栏: 加毛玻璃背景 (backdrop-filter: blur(20px))
- 分类标签: 改为 Ins Stories 风格圆形头像 + 文字
- 商品网格: 2 列 → 瀑布流（Pinterest 风格）
- 每个商品卡片: 图片区高度随机化（增加视觉层次）
```

#### 3.3 首页 (Index)

**当前**: 全屏 StorySwiper
**改进**:
```
- 保留 StorySwiper（已很好）
- 底部增加: "精选好物" 卡片流（横向滑动）
- 增加: 品牌故事卡片（半屏高度，图片+文字叠加）
- 底部 tab bar: 改用毛玻璃 + 圆角浮起式设计
```

#### 3.4 个人中心 (User)

**当前**: 未知（需检查）
**改进**:
```
- 头像区域: 大圆形头像 + Ins 风网格统计数据（关注/粉丝/订单）
- 订单状态: 改为横向滑动卡片
- 菜单: 改为 Ins 设置页风格（无图标，极简文字列表）
```

### 四、组件级 Design Token

```scss
// === Spacing ===
--space-1:  8rpx;
--space-2:  16rpx;
--space-3:  24rpx;
--space-4:  32rpx;
--space-5:  40rpx;
--space-6:  48rpx;
--space-8:  64rpx;
--space-10: 80rpx;
--space-12: 96rpx;

// === Radius ===
--radius-xs:   8rpx;
--radius-sm:   12rpx;
--radius-md:   20rpx;   // ← 主卡片圆角加大
--radius-lg:   32rpx;   // ← 弹窗/大卡片
--radius-xl:   48rpx;   // ← 模态框
--radius-full: 9999rpx; // ← 胶囊按钮/标签

// === Shadow ===
--shadow-xs: 0 1rpx 2rpx rgba(28, 27, 26, 0.04);
--shadow-sm: 0 2rpx 8rpx rgba(28, 27, 26, 0.04), 0 1rpx 2rpx rgba(28, 27, 26, 0.02);
--shadow-md: 0 8rpx 24rpx rgba(28, 27, 26, 0.06), 0 2rpx 8rpx rgba(28, 27, 26, 0.04);
--shadow-lg: 0 16rpx 48rpx rgba(28, 27, 26, 0.08), 0 4rpx 16rpx rgba(28, 27, 26, 0.04);

// === Transitions ===
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);  // ← Ins 风弹性
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--transition-fast: 200ms var(--ease-out);
--transition-base: 350ms var(--ease-out);
--transition-slow: 500ms var(--ease-out);
```

### 五、微交互

```scss
// ProductCard 点击效果
.product-card {
  transition: transform var(--transition-fast);
  &:active {
    transform: scale(0.97);  // ← 弹性按压
  }
}

// 按钮悬停
.btn-primary {
  transition: all var(--transition-fast);
  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}

// 页面切换动画
.page-enter {
  animation: fadeInUp var(--transition-base);
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20rpx); }
  to   { opacity: 1; transform: translateY(0); }
}

// 骨架屏 — 已有 SkeletonGrid，需调色
.skeleton {
  background: linear-gradient(90deg, #F0EBE5 25%, #E8E2DC 50%, #F0EBE5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 六、Admin & Shareholder Portal 同步

| 变更 | 旧 | 新 |
|------|-----|-----|
| 主色 | `#6B1D2F` 酒红 | `#B85C38` 陶土棕 |
| 字体 | Playfair Display 衬线 | Inter 无衬线 |
| 背景 | `#F5F0EB` 米色 | `#FAFAF8` 暖白 |
| 侧边栏 | `#1A1514` 深棕黑 | `#1C1B1A` 暖炭黑 |
| 圆角 | `4px` | `12px` |
| 阴影 | 无系统 | 多层柔和阴影 |

---

## 实施顺序（优先级）

| # | 任务 | 文件 | 工时估 |
|---|------|------|--------|
| 1 | 统一 design tokens | `common.scss`, `uni.scss`, `admin/style.css` | 1h |
| 2 | ProductCard 重设计 | `ProductCard.vue` | 30min |
| 3 | 字体系统引入 | `common.scss`, `App.vue`, `admin/style.css` | 30min |
| 4 | 分类页改版 | `pages/category/index.vue` | 2h |
| 5 | 个人中心改版 | `pages/user/index.vue` | 1.5h |
| 6 | 首页增加内容流 | `pages/index/index.vue` | 1h |
| 7 | 微交互 + 动画 | `common.scss` + 各组件 | 1h |
| 8 | Admin 同步 | `admin/src/style.css` | 1h |
| 9 | Shareholder Portal 同步 | `shareholder-portal/src/style.css` | 30min |

**总计**: ~9h
