import { PrismaClient } from '@prisma/client'
import uniqid from 'uniqid'

const prisma = new PrismaClient()

async function main() {
  console.log('开始创建测试订单...')

  // 获取测试用户
  const users = await prisma.user.findMany({ take: 3 })
  if (users.length === 0) {
    console.log('没有找到测试用户，先创建用户')
    // 创建测试用户
    for (let i = 0; i < 3; i++) {
      await prisma.user.create({
        data: {
          phone: `1380000000${i}`,
          password: 'test123',
          nickname: `测试用户${i}`
        }
      })
    }
  }

  // 获取产品
  const products = await prisma.product.findMany({ take: 5 })
  if (products.length === 0) {
    console.log('没有找到产品')
    return
  }

  // 获取用户
  const testUsers = await prisma.user.findMany({ take: 3 })
  
  // 获取或创建收货地址
  for (const user of testUsers) {
    const existingAddress = await prisma.address.findFirst({ where: { userId: user.id } })
    if (!existingAddress) {
      await prisma.address.create({
        data: {
          userId: user.id,
          name: `${user.nickname || '用户'}的地址`,
          phone: user.phone,
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: '某街道某小区1号楼101',
          isDefault: true
        }
      })
    }
  }

  // 获取地址
  const addresses = await prisma.address.findMany({ take: 3 })
  if (addresses.length === 0) {
    console.log('没有找到收货地址')
    return
  }

  // 创建不同状态的订单
  const statuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled']
  const statusNames = { pending: '待支付', paid: '已支付', shipped: '已发货', completed: '已完成', cancelled: '已取消' }
  
  let orderCount = 0
  for (let i = 0; i < 15; i++) {
    const user = testUsers[i % testUsers.length]
    const address = addresses.find(a => a.userId === user.id) || addresses[0]
    const product = products[i % products.length]
    const status = statuses[i % statuses.length]
    
    // 随机选择1-3个商品
    const orderItems = []
    let totalAmount = 0
    for (let j = 0; j <= i % 3; j++) {
      const p = products[(i + j) % products.length]
      const qty = (j % 3) + 1
      const price = Number(p.price)
      totalAmount += price * qty
      orderItems.push({
        productId: p.id,
        productName: p.name,
        price: p.price,
        quantity: qty,
        image: JSON.parse(p.images || '[]')[0] || null
      })
    }

    try {
      await prisma.order.create({
        data: {
          orderNo: 'ORD' + uniqid().toUpperCase(),
          userId: user.id,
          status,
          totalAmount,
          payAmount: status === 'cancelled' ? 0 : totalAmount,
          addressId: address.id,
          items: {
            create: orderItems
          }
        }
      })
      orderCount++
      console.log(`创建订单: ${statusNames[status]} - 用户: ${user.phone}`)
    } catch (e) {
      console.log(`创建订单失败: ${e.message}`)
    }
  }

  console.log(`\n✅ 成功创建 ${orderCount} 个测试订单`)
  
  // 显示统计
  const stats = await prisma.order.groupBy({
    by: ['status'],
    _count: true
  })
  console.log('\n订单统计:')
  for (const s of stats) {
    console.log(`  ${statusNames[s.status] || s.status}: ${s._count}个`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
