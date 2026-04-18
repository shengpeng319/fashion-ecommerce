import { Router } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../../index.js'
import jwt from 'jsonwebtoken'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-2024'
const ADMIN_EXPIRES = '24h'

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body
    if (!phone || !password) {
      return res.status(400).json({ error: '手机号和密码必填' })
    }
    const admin = await prisma.adminUser.findUnique({ where: { phone } })
    if (!admin) {
      return res.status(401).json({ error: '账号或密码错误' })
    }
    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) {
      return res.status(401).json({ error: '账号或密码错误' })
    }
    const token = jwt.sign({ adminId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: ADMIN_EXPIRES })
    res.json({ 
      success: true, 
      token, 
      admin: { id: admin.id, phone: admin.phone, nickname: admin.nickname, role: admin.role }
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 获取当前管理员信息
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: '未登录' })
    }
    const decoded = jwt.verify(token, JWT_SECRET)
    const admin = await prisma.adminUser.findUnique({ where: { id: decoded.adminId } })
    if (!admin) {
      return res.status(401).json({ error: '管理员不存在' })
    }
    res.json({ 
      success: true, 
      admin: { id: admin.id, phone: admin.phone, nickname: admin.nickname, role: admin.role }
    })
  } catch (e) {
    res.status(401).json({ error: 'token无效' })
  }
})

// 修改密码
router.put('/password', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: '未登录' })
    }
    const decoded = jwt.verify(token, JWT_SECRET)
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '旧密码和新密码必填' })
    }
    const admin = await prisma.adminUser.findUnique({ where: { id: decoded.adminId } })
    if (!admin) {
      return res.status(401).json({ error: '管理员不存在' })
    }
    const valid = await bcrypt.compare(oldPassword, admin.password)
    if (!valid) {
      return res.status(401).json({ error: '旧密码错误' })
    }
    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.adminUser.update({
      where: { id: decoded.adminId },
      data: { password: hashed }
    })
    res.json({ success: true, message: '密码修改成功' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router

// 管理员注册
router.post('/register', async (req, res) => {
  try {
    const { phone, password, nickname } = req.body
    if (!phone || !password) {
      return res.status(400).json({ error: '手机号和密码必填' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6位' })
    }
    const exist = await prisma.adminUser.findUnique({ where: { phone } })
    if (exist) {
      return res.status(400).json({ error: '账号已存在' })
    }
    const hashed = await bcrypt.hash(password, 10)
    const admin = await prisma.adminUser.create({
      data: { phone, password: hashed, nickname: nickname || '管理员' }
    })
    // 注册成功后自动登录，签发 token
    const token = jwt.sign({ adminId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: ADMIN_EXPIRES })
    res.json({
      success: true,
      token,
      admin: { id: admin.id, phone: admin.phone, nickname: admin.nickname, role: admin.role }
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})
