import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create categories
  const tops = await prisma.category.create({ data: { name: '上衣', sort: 1 } })
  const pants = await prisma.category.create({ data: { name: '裤装', sort: 2 } })
  const skirts = await prisma.category.create({ data: { name: '裙装', sort: 3 } })
  console.log('Categories created')

  // Create products
  const products = [
    {
      name: '法式优雅雪纺衬衫',
      subtitle: '春季新款 气质通勤',
      price: 189.00,
      originalPrice: 299.00,
      images: JSON.stringify(['https://img.yzcdn.cn/vant/cat.jpeg']),
      description: '轻盈雪纺面料，法式复古设计',
      detail: '<p>商品详情：轻盈雪纺面料，法式复古设计，适合职场通勤。</p>',
      categoryId: tops.id,
      stock: 100,
      sales: 58
    },
    {
      name: '高腰直筒牛仔裤',
      subtitle: '百搭修身 显瘦神器',
      price: 229.00,
      originalPrice: 369.00,
      images: JSON.stringify(['https://img.yzcdn.cn/vant/cat.jpeg']),
      description: '高腰设计，拉长腿部线条',
      detail: '<p>高腰直筒牛仔裤，百搭修身。</p>',
      categoryId: pants.id,
      stock: 80,
      sales: 42
    },
    {
      name: '碎花雪纺连衣裙',
      subtitle: '小清新碎花 仙气飘飘',
      price: 268.00,
      originalPrice: 428.00,
      images: JSON.stringify(['https://img.yzcdn.cn/vant/cat.jpeg']),
      description: '碎花雪纺，飘逸仙气',
      detail: '<p>碎花雪纺连衣裙，小清新风格。</p>',
      categoryId: skirts.id,
      stock: 60,
      sales: 35
    },
    {
      name: '简约纯棉T恤',
      subtitle: '基础百搭 舒适透气',
      price: 89.00,
      originalPrice: 129.00,
      images: JSON.stringify(['https://img.yzcdn.cn/vant/cat.jpeg']),
      description: '100%纯棉，基础百搭款',
      detail: '<p>简约纯棉T恤，舒适透气。</p>',
      categoryId: tops.id,
      stock: 200,
      sales: 120
    },
    {
      name: '阔腿休闲裤',
      subtitle: '垂感十足 显高显瘦',
      price: 199.00,
      originalPrice: 299.00,
      images: JSON.stringify(['https://img.yzcdn.cn/vant/cat.jpeg']),
      description: '垂感面料，阔腿设计',
      detail: '<p>阔腿休闲裤，垂感十足。</p>',
      categoryId: pants.id,
      stock: 90,
      sales: 28
    },
    {
      name: '蕾丝边半身裙',
      subtitle: '精致蕾丝 优雅女人味',
      price: 178.00,
      originalPrice: 268.00,
      images: JSON.stringify(['https://img.yzcdn.cn/vant/cat.jpeg']),
      description: '精致蕾丝边，优雅大方',
      detail: '<p>蕾丝边半身裙，优雅女人味。</p>',
      categoryId: skirts.id,
      stock: 70,
      sales: 33
    }
  ]

  for (const p of products) {
    await prisma.product.create({ data: p })
  }
  console.log('Products created')

  // Create test user
  const hashed = await bcrypt.hash('123456', 10)
  const user = await prisma.user.create({
    data: {
      phone: '13800138000',
      password: hashed,
      nickname: '测试用户'
    }
  })
  console.log('Test user created:', user.phone)

  // Create test address
  await prisma.address.create({
    data: {
      userId: user.id,
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '福田区',
      detail: '深业上城A座1234',
      isDefault: true
    }
  })
  console.log('Test address created')

  console.log('Seeding done!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
