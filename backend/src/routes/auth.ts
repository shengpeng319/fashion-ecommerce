import { Router } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../index.js'
import jwt from 'jsonwebtoken'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'fashion-secret-2024'

// POST /api/fashions/auth/register
router.post('/register', async (req, res) => {
  try {
    const { phone, password, nickname } = req.body
    if (!phone || !password) {
      return res.status(400).json({ error: '手机号和密码必填' })
    }
    const exist = await prisma.user.findUnique({ where: { phone } })
    if (exist) {
      return res.status(400).json({ error: '手机号已注册' })
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { phone, password: hashed, nickname: nickname || phone.slice(-4) }
    })

    // 自动创建轻会员记录
    await prisma.member.create({
      data: {
        userId: user.id,
        level: 'LIGHT',
        points: 0,
        depositAmount: 0
      }
    })

    // 生成 token
    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' })

    res.json({
      success: true,
      userId: user.id,
      phone: user.phone,
      token,
      user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar },
      member: { level: 'LIGHT', points: 0 }
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/fashions/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { member: true }
    })
    if (!user) {
      return res.status(401).json({ error: '手机号或密码错误' })
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: '手机号或密码错误' })
    }

    // 如果没有member记录，创建一个轻会员
    if (!user.member) {
      await prisma.member.create({
        data: {
          userId: user.id,
          level: 'LIGHT',
          points: 0,
          depositAmount: 0
        }
      })
    }

    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' })
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { member: true }
    })

    res.json({
      success: true,
      token,
      user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar },
      member: freshUser?.member || { level: 'LIGHT', points: 0 }
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
