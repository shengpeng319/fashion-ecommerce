# 数据库设计文档

## ER 图

```
User (用户)
  ├── 1:N Address (收货地址)
  ├── 1:1 Member (会员)
  ├── 1:N CartItem (购物车)
  └── 1:N Order (订单)

Category (分类)
  └── 1:N Product (商品)

Brand (品牌)
  └── 1:N Product (商品)

Product (商品)
  ├── N:1 Category (分类)
  ├── N:1 Brand (品牌)
  ├── 1:N SKU (规格)
  ├── 1:N CartItem (购物车)
  └── 1:N OrderItem (订单商品)

SKU (规格)
  └── N:1 Product (商品)

Order (订单)
  ├── N:1 User (用户)
  ├── N:1 Address (收货地址)
  └── 1:N OrderItem (订单商品)

Dealer (经销商)
  └── 1:N WholesaleOrder (批发订单)
```

## 表结构

### User 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| phone | VARCHAR | 手机号(唯一) |
| password | VARCHAR | 密码 |
| nickname | VARCHAR | 昵称 |
| avatar | VARCHAR | 头像 |
| gender | ENUM | 性别 |
| createdAt | DATETIME | 创建时间 |
| updatedAt | DATETIME | 更新时间 |

### Address 收货地址表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户ID |
| name | VARCHAR | 收货人 |
| phone | VARCHAR | 手机号 |
| province | VARCHAR | 省份 |
| city | VARCHAR | 城市 |
| district | VARCHAR | 区县 |
| detail | VARCHAR | 详细地址 |
| isDefault | BOOLEAN | 是否默认 |

### Member 会员表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户ID(唯一) |
| level | INT | 会员等级 |
| points | INT | 积分 |
| totalSpent | DECIMAL | 累计消费 |
| discountRate | DECIMAL | 折扣率 |

### Category 分类表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR | 分类名 |
| icon | VARCHAR | 图标 |
| sort | INT | 排序 |
| parentId | UUID | 父分类ID |

### Product 商品表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR | 商品名 |
| subtitle | VARCHAR | 副标题 |
| price | DECIMAL | 售价 |
| originalPrice | DECIMAL | 原价 |
| images | JSON | 图片列表 |
| description | TEXT | 简述 |
| detail | LONGTEXT | 详情 |
| categoryId | UUID | 分类ID |
| brandId | UUID | 品牌ID |
| sales | INT | 销量 |
| stock | INT | 库存 |

### SKU 规格表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| productId | UUID | 商品ID |
| name | VARCHAR | 规格名 |
| price | DECIMAL | 规格价格 |
| stock | INT | 库存 |
| attributes | JSON | 属性 |

### Order 订单表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| orderNo | VARCHAR | 订单号(唯一) |
| userId | UUID | 用户ID |
| status | ENUM | 状态 |
| totalAmount | DECIMAL | 商品总价 |
| discountAmount | DECIMAL | 优惠金额 |
| payAmount | DECIMAL | 实付金额 |
| payType | ENUM | 支付方式 |
| addressId | UUID | 地址ID |

### OrderItem 订单商品表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| orderId | UUID | 订单ID |
| productId | UUID | 商品ID |
| skuId | UUID | 规格ID |
| price | DECIMAL | 单价 |
| quantity | INT | 数量 |

### Dealer 经销商表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| userId | UUID | 用户ID(唯一) |
| companyName | VARCHAR | 公司名 |
| licenseNo | VARCHAR | 营业执照号 |
| level | ENUM | 等级 |
| creditLine | DECIMAL | 信用额度 |
| usedCredit | DECIMAL | 已用额度 |
| status | ENUM | 状态 |
