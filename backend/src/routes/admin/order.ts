import { Router } from 'express'
import { prisma } from '../../index.js'
import { adminAuth, AdminRequest } from '../../middleware/auth'

const router = Router()

// 订单列表
router.get('/orders', adminAuth, async (req: AdminRequest, res) => {
  try {
    const { page = 1, pageSize = 10, status, keyword } = req.query
    const where: any = {}
    
    if (status) where.status = status
    if (keyword) {
      where.OR = [
        { orderNo: { contains: keyword as string } }
      ]
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { 
          user: { select: { id: true, phone: true, nickname: true } },
          items: { include: { product: true } },
          address: true
        },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ])

    res.json({ success: true, orders, total, page: Number(page), pageSize: Number(pageSize) })
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// 订单详情
router.get('/orders/:id', adminAuth, async (req: AdminRequest, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { 
        user: { select: { id: true, phone: true, nickname: true } },
        items: { include: { product: true } },
        address: true
      }
    })
    if (!order) {
      return res.status(404).json({ error: '订单不存在' })
    }
    res.json({ success: true, order })
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// 更新订单状态
router.put('/orders/:id/status', adminAuth, async (req: AdminRequest, res) => {
  try {
    const { status } = req.body
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    })
    res.json({ success: true, order })
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

export default router
