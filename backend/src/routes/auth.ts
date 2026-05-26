import { Router } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../index.js'
import jwt from 'jsonwebtoken'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'fashion-secret-2024'

router.post('/register', async (req, res) => {
  try {
    const { phone, password, nickname } = req.body
    if (!phone || !password) {
      console.log(`[AUTH] 注册失败: 手机号或密码为空`)
      return res.status(400).json({ error: '手机号和密码必填' })
    }
    const exist = await prisma.user.findUnique({ where: { phone } })
    if (exist) {
      console.log(`[AUTH] 注册失败: 手机号 ${phone} 已注册`)
      return res.status(400).json({ error: '手机号已注册' })
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { phone, password: hashed, nickname: nickname || phone.slice(-4) }
    })
    await prisma.member.create({
      data: { userId: user.id, level: 'LIGHT', points: 0, depositAmount: 0 }
    })
    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' })
    console.log(`[AUTH] 注册成功: phone=${phone} userId=${user.id}`)
    res.json({
      success: true,
      userId: user.id,
      phone: user.phone,
      token,
      user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar },
      member: { level: 'LIGHT', points: 0 }
    })
  } catch (e) {
    console.error(`[AUTH] 注册异常:`, e)
    res.status(500).json({ error: e.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body
    console.log(`[AUTH] 登录尝试: phone=${phone}`)
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { member: true }
    })
    if (!user) {
      console.log(`[AUTH] 登录失败: 手机号 ${phone} 未找到`)
      return res.status(401).json({ error: '手机号或密码错误' })
    }
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      console.log(`[AUTH] 登录失败: 手机号 ${phone} 密码错误`)
      return res.status(401).json({ error: '手机号或密码错误' })
    }
    if (!user.member) {
      await prisma.member.create({
        data: { userId: user.id, level: 'LIGHT', points: 0, depositAmount: 0 }
      })
    }
    const token = jwt.sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' })
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { member: true }
    })
    console.log(`[AUTH] 登录成功: phone=${phone} userId=${user.id}`)
    res.json({
      success: true,
      token,
      user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar },
      member: freshUser?.member || { level: 'LIGHT', points: 0 }
    })
  } catch (e) {
    console.error(`[AUTH] 登录异常:`, e)
    res.status(500).json({ error: e.message })
  }
})

export default router
