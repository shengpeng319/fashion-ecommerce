import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../index.js'
import uniqid from 'uniqid'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'fashion-secret-2024'

const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: '未登录' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.userId = decoded.userId
    next()
  } catch {
    res.status(401).json({ error: 'token无效' })
  }
}

// POST /api/fashions/orders
router.post('/', auth, async (req, res) => {
  try {
    const { addressId, items, remark, pointsUsed } = req.body
    if (!items || items.length === 0) {
      return res.status(400).json({ error: '订单商品不能为空' })
    }
    // Get address
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: req.userId }
    })
    if (!address) return res.status(400).json({ error: '收货地址无效' })
    
    // Calculate total
    let totalAmount = 0
    const orderItems = []
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product) return res.status(400).json({ error: `商品不存在: ${item.productId}` })
      const price = Number(product.price)
      totalAmount += price * item.quantity
      orderItems.push({
        productId: item.productId,
        skuId: item.skuId || null,
        productName: product.name,
        skuName: item.skuName || null,
        price: product.price,
        quantity: item.quantity,
        image: JSON.parse(product.images)[0] || null
      })
    }
    
    // 处理积分抵扣
    let finalPointsUsed = 0
    let payAmount = totalAmount
    
    if (pointsUsed && pointsUsed > 0) {
      const member = await prisma.member.findUnique({ where: { userId: req.userId } })
      if (!member || member.points < pointsUsed) {
        return res.status(400).json({ error: '积分不足' })
      }
      finalPointsUsed = Math.min(pointsUsed, Math.floor(totalAmount)) // 1积分=1元
      payAmount = totalAmount - finalPointsUsed
      if (payAmount < 0) payAmount = 0
    }
    
    const order = await prisma.order.create({
      data: {
        orderNo: 'ORD' + uniqid(),
        userId: req.userId,
        status: 'pending',
        totalAmount,
        payAmount,
        pointsUsed: finalPointsUsed,
        addressId,
        remark,
        items: { create: orderItems }
      },
      include: { items: true, address: true }
    })

    // 如果使用了积分，先预扣
    if (finalPointsUsed > 0) {
      const member = await prisma.member.findUnique({ where: { userId: req.userId } })
      if (member) {
        await prisma.member.update({
          where: { id: member.id },
          data: { points: { decrement: finalPointsUsed } }
        })
        await prisma.pointsTransaction.create({
          data: {
            memberId: member.id,
            type: 'REDEEM',
            amount: -finalPointsUsed,
            balance: member.points - finalPointsUsed,
            description: `订单${order.orderNo}抵扣积分`,
            orderId: order.id
          }
        })
      }
    }

    res.json(order)
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// GET /api/fashions/orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: { items: true, address: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(orders)
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// GET /api/fashions/orders/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { items: true, address: true }
    })
    if (!order) return res.status(404).json({ error: '订单不存在' })
    res.json(order)
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

export default router

// POST /api/fashions/orders/:id/pay
router.post('/:id/pay', auth, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.userId }
    })
    if (!order) return res.status(404).json({ error: '订单不存在' })
    if (order.status !== 'pending') {
      return res.status(400).json({ error: '订单状态不允许支付' })
    }
    
    // Simulate payment success
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'paid', payTime: new Date() }
    })

    // 支付成功后发放积分 (消费1元=1积分)
    const member = await prisma.member.findUnique({ where: { userId: req.userId } })
    if (member) {
      const earnedPoints = Math.floor(Number(order.payAmount))
      if (earnedPoints > 0) {
        const newBalance = member.points + earnedPoints
        await prisma.member.update({
          where: { id: member.id },
          data: {
            points: { increment: earnedPoints },
            totalSpent: { increment: Number(order.payAmount) }
          }
        })
        await prisma.pointsTransaction.create({
          data: {
            memberId: member.id,
            type: 'EARN',
            amount: earnedPoints,
            balance: newBalance,
            description: `订单${order.orderNo}消费赠送积分`,
            orderId: order.id
          }
        })
      }

      // 处理推荐返利
      const user = await prisma.user.findUnique({ where: { id: req.userId } })
      if (user?.referrerId) {
        const referral = await prisma.referral.findFirst({
          where: {
            referrerUserId: user.referrerId,
            referredUserId: req.userId,
            status: 'PENDING'
          }
        })
        if (referral) {
          const referrerMember = await prisma.member.findUnique({
            where: { userId: user.referrerId }
          })
          if (referrerMember) {
            let referralBonus = 0
            if (referrerMember.level === 'CREATOR') referralBonus = 15000
            else if (referrerMember.level === 'OFFICER') referralBonus = 50000

            if (referralBonus > 0) {
              const newRefBalance = referrerMember.points + referralBonus
              await prisma.member.update({
                where: { id: referrerMember.id },
                data: { points: { increment: referralBonus } }
              })
              await prisma.pointsTransaction.create({
                data: {
                  memberId: referrerMember.id,
                  type: 'REFERRAL',
                  amount: referralBonus,
                  balance: newRefBalance,
                  description: `推荐会员完成首单消费，返利${referralBonus}积分`
                }
              })

              await prisma.referral.update({
                where: { id: referral.id },
                data: {
                  status: 'COMPLETED',
                  pointsAwarded: referralBonus,
                  completedAt: new Date()
                }
              })
            }
          }
        }
      }
    }

    res.json({ success: true, order: updated })
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})
