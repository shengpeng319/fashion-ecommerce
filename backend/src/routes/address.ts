import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../index.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'fashion-secret-2024'

// Auth middleware
const auth = (req: any, res: any, next: any) => {
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

// GET /api/fashions/addresses
router.get('/', auth, async (req: any, res: any) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    })
    res.json(addresses)
  } catch (e: any) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// POST /api/fashions/addresses
router.post('/', auth, async (req: any, res: any) => {
  try {
    const { name, phone, province, city, district, detail, isDefault } = req.body
    if (!name || !phone || !province || !city || !district || !detail) {
      return res.status(400).json({ error: '请填写完整地址信息' })
    }
    
    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.userId, isDefault: true },
        data: { isDefault: false }
      })
    }
    
    const address = await prisma.address.create({
      data: { userId: req.userId, name, phone, province, city, district, detail, isDefault: isDefault || false }
    })
    res.json(address)
  } catch (e: any) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/fashions/addresses/:id
router.put('/:id', auth, async (req: any, res: any) => {
  try {
    const { name, phone, province, city, district, detail, isDefault } = req.body
    
    // Verify ownership
    const existing = await prisma.address.findFirst({
      where: { id: req.params.id, userId: req.userId }
    })
    if (!existing) return res.status(404).json({ error: '地址不存在' })
    
    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.userId, isDefault: true, id: { not: req.params.id } },
        data: { isDefault: false }
      })
    }
    
    const address = await prisma.address.update({
      where: { id: req.params.id },
      data: { name, phone, province, city, district, detail, isDefault }
    })
    res.json(address)
  } catch (e: any) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/fashions/addresses/:id
router.delete('/:id', auth, async (req: any, res: any) => {
  try {
    await prisma.address.deleteMany({
      where: { id: req.params.id, userId: req.userId }
    })
    res.json({ success: true })
  } catch (e: any) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/fashions/addresses/:id/default
router.put('/:id/default', auth, async (req: any, res: any) => {
  try {
    await prisma.address.updateMany({
      where: { userId: req.userId, isDefault: true },
      data: { isDefault: false }
    })
    await prisma.address.update({
      where: { id: req.params.id, userId: req.userId },
      data: { isDefault: true }
    })
    res.json({ success: true })
  } catch (e: any) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

export default router
