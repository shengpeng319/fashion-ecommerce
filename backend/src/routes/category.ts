import { Router } from 'express'
import { prisma } from '../index.js'

const router = Router()

// GET /api/fashions/categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sort: 'asc' }
    })
    res.json(categories)
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

export default router
