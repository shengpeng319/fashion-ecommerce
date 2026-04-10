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
    const { addressId, items, remark } = req.body
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
    
    const order = await prisma.order.create({
      data: {
        orderNo: 'ORD' + uniqid(),
        userId: req.userId,
        status: 'pending',
        totalAmount,
        payAmount: totalAmount,
        addressId,
        remark,
        items: { create: orderItems }
      },
      include: { items: true, address: true }
    })
    res.json(order)
  } catch (e) {
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
    res.status(500).json({ error: e.message })
  }
})

export default router
