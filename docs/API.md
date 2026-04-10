# API 接口规划文档

## 认证模块 `/api/auth`
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/logout | 退出登录 |
| GET | /api/auth/profile | 获取用户信息 |

## 用户模块 `/api/user`
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/user/profile | 获取个人资料 |
| PUT | /api/user/profile | 更新个人资料 |
| GET | /api/user/addresses | 获取收货地址列表 |
| POST | /api/user/addresses | 添加收货地址 |
| PUT | /api/user/addresses/:id | 更新收货地址 |
| DELETE | /api/user/addresses/:id | 删除收货地址 |
| GET | /api/user/member | 获取会员信息 |

## 商品模块 `/api/products`
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/products | 商品列表 |
| GET | /api/products/:id | 商品详情 |
| GET | /api/categories | 分类列表 |
| GET | /api/categories/:id/products | 分类商品列表 |
| GET | /api/brands | 品牌列表 |

## 购物车模块 `/api/cart`
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/cart | 获取购物车列表 |
| POST | /api/cart | 添加商品到购物车 |
| PUT | /api/cart/:id | 更新购物车商品数量 |
| DELETE | /api/cart/:id | 删除购物车商品 |
| DELETE | /api/cart | 清空购物车 |

## 订单模块 `/api/orders`
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/orders | 订单列表 |
| POST | /api/orders | 创建订单 |
| GET | /api/orders/:id | 订单详情 |
| PUT | /api/orders/:id/cancel | 取消订单 |
| PUT | /api/orders/:id/confirm | 确认收货 |

## 批发模块 `/api/wholesale`
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/wholesale/products | 批发商品列表 |
| GET | /api/wholesale/dealer | 获取经销商信息 |
| GET | /api/wholesale/orders | 批发订单列表 |
| POST | /api/wholesale/orders | 创建批发订单 |
| GET | /api/wholesale/orders/:id | 批发订单详情 |
