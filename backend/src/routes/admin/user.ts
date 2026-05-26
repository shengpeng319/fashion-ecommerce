import { Router } from 'express'
import { prisma } from '../../index.js'
import { adminAuth, AdminRequest } from '../../middleware/auth'

const router = Router()

// 用户列表
router.get('/users', adminAuth, async (req: AdminRequest, res) => {
  try {
    const { page = 1, pageSize = 10, keyword } = req.query
    const where: any = {}
    
    if (keyword) {
      where.OR = [
        { phone: { contains: keyword as string } },
        { nickname: { contains: keyword as string } }
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { 
          id: true, 
          phone: true, 
          nickname: true, 
          avatar: true,
          gender: true,
          createdAt: true,
          _count: { select: { orders: true } }
        },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    res.json({ success: true, users, total, page: Number(page), pageSize: Number(pageSize) })
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// 用户详情
router.get('/users/:id', adminAuth, async (req: AdminRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { 
        id: true, 
        phone: true, 
        nickname: true, 
        avatar: true,
        gender: true,
        createdAt: true,
        addresses: true,
        orders: { take: 10, orderBy: { createdAt: 'desc' } },
        member: true
      }
    })
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }
    res.json({ success: true, user })
  } catch (e) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

export default router
