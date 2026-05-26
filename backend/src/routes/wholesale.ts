import { Router } from 'express'
import { prisma } from '../index.js'
const router = Router()

// 批发商品列表
router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })
    // 批发价 = 零售价 * 0.7
    const wholesale = products.map(p => ({
      ...p,
      wholesalePrice: Math.round(Number(p.price) * 0.7 * 100) / 100
    }))
    res.json({ data: wholesale, total: wholesale.length })
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// 经销商注册
router.post('/register', async (req, res) => {
  try {
    const { userId, companyName, licenseNo } = req.body
    const dealer = await prisma.dealer.create({
      data: { userId, companyName, licenseNo, level: 'bronze', status: 'pending' }
    })
    res.json({ data: dealer })
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(400).json({ error: e.message })
  }
})

// 批发订单
router.post('/orders', async (req, res) => {
  try {
    const { dealerId, items, remark } = req.body
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const order = await prisma.wholesaleOrder.create({
      data: {
        orderNo: 'W' + Date.now(),
        dealerId,
        status: 'pending',
        totalAmount,
        payAmount: totalAmount,
        remark
      }
    })
    res.json({ data: order })
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// 批发订单列表
router.get('/orders', async (req, res) => {
  try {
    const { dealerId } = req.query
    const orders = await prisma.wholesaleOrder.findMany({
      where: dealerId ? { dealerId: dealerId as string } : {},
      orderBy: { createdAt: 'desc' }
    })
    res.json({ data: orders })
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

export default router
