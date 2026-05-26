import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../index.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'fashion-secret-2024'

// Auth middleware
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

// GET /api/fashions/cart
router.get('/', auth, async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.userId },
      include: { product: { include: { category: true } }, sku: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(items)
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// POST /api/fashions/cart
router.post('/', auth, async (req, res) => {
  try {
    const { productId, skuId, quantity = 1 } = req.body
    const exist = await prisma.cartItem.findFirst({
      where: { userId: req.userId, productId, skuId: skuId || null }
    })
    if (exist) {
      const updated = await prisma.cartItem.update({
        where: { id: exist.id },
        data: { quantity: exist.quantity + quantity }
      })
      return res.json(updated)
    }
    const item = await prisma.cartItem.create({
      data: { userId: req.userId, productId, skuId, quantity },
      include: { product: true, sku: true }
    })
    res.json(item)
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/fashions/cart/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { quantity } = req.body
    const item = await prisma.cartItem.findFirst({
      where: { id: req.params.id, userId: req.userId }
    })
    if (!item) return res.status(404).json({ error: '购物车商品不存在' })
    const updated = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { quantity }
    })
    res.json(updated)
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/fashions/cart/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { id: req.params.id, userId: req.userId }
    })
    res.json({ success: true })
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

export default router
