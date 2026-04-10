# 参考开源项目借鉴清单

## 推荐开源项目

### 1. TinyShop-UniApp
- **地址**: https://gitee.com/tomcat2008/TinyShop-UniApp
- **优点**: 
  - 完整电商功能
  - uni-app 多端支持
  - 代码结构清晰
- **借鉴**:
  - 商品详情页布局
  - 订单流程
  - 会员积分系统

### 2. uniapp-shop-vue3-ts
- **地址**: https://github.com/Plan-At/uniapp-shop-vue3-ts
- **优点**:
  - Vue 3 + TypeScript
  - Pinia 状态管理
  - Vant Weapp UI
- **借鉴**:
  - 项目结构组织
  - TypeScript 类型定义
  - API 请求封装

### 3. dcloudio/uni-app
- **地址**: https://github.com/dcloudio/uni-app
- **优点**:
  - 官方框架
  - 生态完善
  - 文档详尽
- **借鉴**:
  - 组件规范
  - 页面配置
  - 跨平台兼容

## 借鉴清单

### 直接可用
| 模块 | 来源 | 说明 |
|------|------|------|
| 商品卡片组件 | TinyShop | 样式和布局 |
| 分类侧边栏 | TinyShop | 交互逻辑 |
| 购物车勾选 | TinyShop | 全选/单选逻辑 |
| 订单状态流转 | TinyShop | 状态机设计 |

### 参考思路
| 模块 | 来源 | 说明 |
|------|------|------|
| 会员等级设计 | uniapp-shop | 折扣/积分规则 |
| 批发商额度 | 自研 | 信用额度控制 |
| 多规格 SKU | Vant Weapp | picker 组件 |

## 不适用部分
- 支付流程（需对接微信支付）
- 物流查询（需第三方服务）
- 直播带货（Phase 2）
- 股东合伙（Phase 2）
