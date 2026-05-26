import { Router } from 'express'
import { prisma } from '../index.js'

const router = Router()

// GET /api/fashions/products
router.get('/', async (req, res) => {
  try {
    const { categoryId, keyword, limit = 50, offset = 0 } = req.query
    const where: any = { isActive: true }
    if (categoryId) where.categoryId = categoryId as string
    if (keyword) where.name = { contains: keyword as string } as any
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, brand: true },
        skip: Number(offset),
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ])
    res.json({ data: products, total, limit: Number(limit), offset: Number(offset) })
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// GET /api/fashions/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true, brand: true, skus: true }
    })
    if (!product) return res.status(404).json({ error: '商品不存在' })
    res.json(product)
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

export default router
