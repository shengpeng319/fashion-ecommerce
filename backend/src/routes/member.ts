import { Router } from 'express'
import { prisma } from '../index.js'
import { userAuth, UserRequest } from '../middleware/userAuth.js'

const router = Router()

// GET /api/fashions/member/levels — 获取所有会员等级
router.get('/levels', async (_req, res) => {
  try {
    const levels = await prisma.membershipLevel.findMany({
      orderBy: { sortOrder: 'asc' }
    })
    res.json(levels)
  } catch (e: any) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// GET /api/fashions/member/profile — 获取当前会员信息
router.get('/profile', userAuth, async (req: UserRequest, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { userId: req.userId },
      include: {
        user: { select: { id: true, phone: true, nickname: true, avatar: true, referrerId: true } }
      }
    })
    if (!member) {
      return res.json({ level: 'LIGHT', points: 0, totalSpent: 0, depositAmount: 0 })
    }
    res.json(member)
  } catch (e: any) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// GET /api/fashions/member/transactions — 积分流水
router.get('/transactions', userAuth, async (req: UserRequest, res) => {
  try {
    const member = await prisma.member.findUnique({ where: { userId: req.userId } })
    if (!member) {
      return res.json({ transactions: [], total: 0 })
    }
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const [transactions, total] = await Promise.all([
      prisma.pointsTransaction.findMany({
        where: { memberId: member.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.pointsTransaction.count({ where: { memberId: member.id } })
    ])
    res.json({ transactions, total, page, limit })
  } catch (e: any) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// POST /api/fashions/member/upgrade — 会员升级
router.post('/upgrade', userAuth, async (req: UserRequest, res) => {
  try {
    const { targetLevel } = req.body
    if (!targetLevel) {
      return res.status(400).json({ error: '请选择目标等级' })
    }

    const levelConfig = await prisma.membershipLevel.findUnique({
      where: { key: targetLevel }
    })
    if (!levelConfig) {
      return res.status(400).json({ error: '无效的会员等级' })
    }

    // 获取或创建member
    let member = await prisma.member.findUnique({ where: { userId: req.userId } })
    if (!member) {
      member = await prisma.member.create({
        data: {
          userId: req.userId!,
          level: 'LIGHT',
          points: 0
        }
      })
    }

    // 检查是否可以升级（等级不能降级）
    const currentLevel = await prisma.membershipLevel.findUnique({
      where: { key: member.level }
    })
    if (currentLevel && currentLevel.sortOrder >= levelConfig.sortOrder) {
      return res.status(400).json({ error: '只能升级到更高等级' })
    }

    // 升级会员等级
    const updatedMember = await prisma.member.update({
      where: { id: member.id },
      data: {
        level: targetLevel,
        depositAmount: { increment: levelConfig.minDeposit },
        points: { increment: levelConfig.bonusPoints }
      }
    })

    // 记录积分变动（赠送积分）
    if (levelConfig.bonusPoints > 0) {
      await prisma.pointsTransaction.create({
        data: {
          memberId: member.id,
          type: 'EARN',
          amount: levelConfig.bonusPoints,
          balance: updatedMember.points,
          description: `升级至${levelConfig.name}，获赠${levelConfig.bonusPoints}积分`
        }
      })
    }

    res.json({
      success: true,
      member: updatedMember,
      bonusPoints: levelConfig.bonusPoints
    })
  } catch (e: any) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// POST /api/fashions/member/referral — 提交推荐码
router.post('/referral', userAuth, async (req: UserRequest, res) => {
  try {
    const { referrerPhone } = req.body
    if (!referrerPhone) {
      return res.status(400).json({ error: '请输入推荐人手机号' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (user?.referrerId) {
      return res.status(400).json({ error: '已有推荐人，不能重复填写' })
    }

    const referrer = await prisma.user.findUnique({ where: { phone: referrerPhone } })
    if (!referrer) {
      return res.status(400).json({ error: '推荐人不存在' })
    }

    if (referrer.id === req.userId) {
      return res.status(400).json({ error: '不能推荐自己' })
    }

    // 检查推荐人是否为共创员或共创官
    const referrerMember = await prisma.member.findUnique({
      where: { userId: referrer.id }
    })
    if (!referrerMember || !['CREATOR', 'OFFICER'].includes(referrerMember.level)) {
      return res.status(400).json({ error: '推荐人必须是美学共创员或共创官' })
    }

    // 检查是否已有待处理的推荐关系
    const existing = await prisma.referral.findFirst({
      where: { referredUserId: req.userId }
    })
    if (existing) {
      return res.status(400).json({ error: '已有推荐关系' })
    }

    // 更新用户的推荐人
    await prisma.user.update({
      where: { id: req.userId },
      data: { referrerId: referrer.id }
    })

    // 创建推荐记录
    await prisma.referral.create({
      data: {
        referrerUserId: referrer.id,
        referredUserId: req.userId!,
        status: 'PENDING'
      }
    })

    res.json({ success: true, message: '推荐关系已绑定' })
  } catch (e: any) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

// GET /api/fashions/member/referrals — 我的推荐记录
router.get('/referrals', userAuth, async (req: UserRequest, res) => {
  try {
    const referrals = await prisma.referral.findMany({
      where: { referrerUserId: req.userId },
      orderBy: { createdAt: 'desc' }
    })
    res.json(referrals)
  } catch (e: any) {
    console.error(`[ERROR] ${req.method} ${req.url}:`, e)
    res.status(500).json({ error: e.message })
  }
})

export default router
