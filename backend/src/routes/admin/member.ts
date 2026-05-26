import { Router } from 'express'
import { prisma } from '../../index.js'
import { adminAuth, AdminRequest } from '../../middleware/auth.js'

const router = Router()

// GET /api/admin/members — 会员列表
router.get('/members', adminAuth, async (req: AdminRequest, res) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const level = req.query.level as string | undefined
    const search = req.query.search as string | undefined

    const where: any = {}
    if (level) where.level = level
    if (search) {
      where.user = {
        OR: [
          { phone: { contains: search } },
          { nickname: { contains: search } }
        ]
      }
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        include: {
          user: { select: { id: true, phone: true, nickname: true, avatar: true, referrerId: true } }
        },
        orderBy: { points: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.member.count({ where })
    ])

    res.json({ members, total, page, limit })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/admin/members/:id — 会员详情
router.get('/members/:id', adminAuth, async (req: AdminRequest, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, phone: true, nickname: true, avatar: true, referrerId: true } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 50 }
      }
    })
    if (!member) {
      return res.status(404).json({ error: '会员不存在' })
    }

    // 获取推荐记录
    const referrals = await prisma.referral.findMany({
      where: { referrerUserId: member.userId },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ ...member, referrals })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/admin/members/:id — 调整会员信息（积分/等级）
router.put('/members/:id', adminAuth, async (req: AdminRequest, res) => {
  try {
    const { points, level, pointsDelta, pointsReason } = req.body
    const member = await prisma.member.findUnique({ where: { id: req.params.id } })
    if (!member) {
      return res.status(404).json({ error: '会员不存在' })
    }

    const data: any = {}
    if (level) data.level = level

    let newPoints = member.points
    if (pointsDelta && pointsDelta !== 0) {
      newPoints = member.points + pointsDelta
      if (newPoints < 0) {
        return res.status(400).json({ error: '积分不能为负数' })
      }
      data.points = newPoints

      // 记录积分变动
      const type = pointsDelta > 0 ? 'GIFT' : 'REDEEM'
      await prisma.pointsTransaction.create({
        data: {
          memberId: member.id,
          type,
          amount: pointsDelta,
          balance: newPoints,
          description: pointsReason || (pointsDelta > 0 ? '管理员赠送积分' : '管理员扣减积分')
        }
      })
    } else if (points !== undefined) {
      const delta = points - member.points
      data.points = points
      if (delta !== 0) {
        await prisma.pointsTransaction.create({
          data: {
            memberId: member.id,
            type: delta > 0 ? 'GIFT' : 'REDEEM',
            amount: delta,
            balance: points,
            description: pointsReason || '管理员调整积分'
          }
        })
      }
    }

    const updated = await prisma.member.update({
      where: { id: req.params.id },
      data
    })

    res.json({ success: true, member: updated })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/admin/referrals — 推荐记录列表
router.get('/referrals', adminAuth, async (req: AdminRequest, res) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const status = req.query.status as string | undefined

    const where: any = {}
    if (status) where.status = status

    const [referrals, total] = await Promise.all([
      prisma.referral.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.referral.count({ where })
    ])

    res.json({ referrals, total, page, limit })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/admin/membership-levels/:key — 修改等级配置
router.put('/membership-levels/:key', adminAuth, async (req: AdminRequest, res) => {
  try {
    const { name, minDeposit, bonusPoints, isRefundable, sortOrder, benefits } = req.body
    const data: any = {}
    if (name !== undefined) data.name = name
    if (minDeposit !== undefined) data.minDeposit = minDeposit
    if (bonusPoints !== undefined) data.bonusPoints = bonusPoints
    if (isRefundable !== undefined) data.isRefundable = isRefundable
    if (sortOrder !== undefined) data.sortOrder = sortOrder
    if (benefits !== undefined) data.benefits = benefits

    const level = await prisma.membershipLevel.update({
      where: { key: req.params.key },
      data
    })

    res.json({ success: true, level })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/admin/membership-levels — 获取所有等级配置
router.get('/membership-levels', adminAuth, async (_req, res) => {
  try {
    const levels = await prisma.membershipLevel.findMany({
      orderBy: { sortOrder: 'asc' }
    })
    res.json(levels)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default router
