import { Router } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../../index.js'
import jwt from 'jsonwebtoken'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-2024'
const ADMIN_EXPIRES = '24h'

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body
    if (!phone || !password) {
      console.log(`[ADMIN AUTH] 登录失败: 手机号或密码为空`)
      return res.status(400).json({ error: '手机号和密码必填' })
    }
    console.log(`[ADMIN AUTH] 管理员登录尝试: phone=${phone}`)
    const admin = await prisma.adminUser.findUnique({ where: { phone } })
    if (!admin) {
      console.log(`[ADMIN AUTH] 登录失败: 手机号 ${phone} 未找到管理员`)
      return res.status(401).json({ error: '账号或密码错误' })
    }
    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) {
      console.log(`[ADMIN AUTH] 登录失败: 手机号 ${phone} 密码错误`)
      return res.status(401).json({ error: '账号或密码错误' })
    }
    const token = jwt.sign({ adminId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: ADMIN_EXPIRES })
    console.log(`[ADMIN AUTH] 登录成功: phone=${phone} adminId=${admin.id} role=${admin.role}`)
    res.json({
      success: true,
      token,
      admin: { id: admin.id, phone: admin.phone, nickname: admin.nickname, role: admin.role }
    })
  } catch (e) {
    console.error(`[ADMIN AUTH] 登录异常:`, e)
    res.status(500).json({ error: e.message })
  }
})

router.post('/register', async (req, res) => {
  try {
    const { phone, password, nickname } = req.body
    if (!phone || !password) {
      console.log(`[ADMIN AUTH] 注册失败: 手机号或密码为空`)
      return res.status(400).json({ error: '手机号和密码必填' })
    }
    if (password.length < 6) {
      console.log(`[ADMIN AUTH] 注册失败: 密码不足6位`)
      return res.status(400).json({ error: '密码至少6位' })
    }
    const exist = await prisma.adminUser.findUnique({ where: { phone } })
    if (exist) {
      console.log(`[ADMIN AUTH] 注册失败: 手机号 ${phone} 已存在`)
      return res.status(400).json({ error: '账号已存在' })
    }
    const hashed = await bcrypt.hash(password, 10)
    const admin = await prisma.adminUser.create({
      data: { phone, password: hashed, nickname: nickname || '管理员' }
    })
    const token = jwt.sign({ adminId: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: ADMIN_EXPIRES })
    console.log(`[ADMIN AUTH] 注册成功: phone=${phone} adminId=${admin.id}`)
    res.json({
      success: true,
      token,
      admin: { id: admin.id, phone: admin.phone, nickname: admin.nickname, role: admin.role }
    })
  } catch (e) {
    console.error(`[ADMIN AUTH] 注册异常:`, e)
    res.status(500).json({ error: e.message })
  }
})

router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      console.log(`[ADMIN AUTH] 获取profile失败: 无token`)
      return res.status(401).json({ error: '未登录' })
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string }
    const admin = await prisma.adminUser.findUnique({ where: { id: decoded.adminId } })
    if (!admin) {
      console.log(`[ADMIN AUTH] 获取profile失败: adminId=${decoded.adminId} 不存在`)
      return res.status(401).json({ error: '管理员不存在' })
    }
    res.json({
      success: true,
      admin: { id: admin.id, phone: admin.phone, nickname: admin.nickname, role: admin.role }
    })
  } catch (e) {
    console.log(`[ADMIN AUTH] 获取profile失败: token无效 - ${(e as Error).message}`)
    res.status(401).json({ error: 'token无效' })
  }
})

router.put('/password', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: '未登录' })
    }
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string }
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
      console.log(`[ADMIN AUTH] 修改密码失败: adminId=${decoded.adminId} 旧密码错误`)
      return res.status(401).json({ error: '旧密码错误' })
    }
    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.adminUser.update({
      where: { id: decoded.adminId },
      data: { password: hashed }
    })
    console.log(`[ADMIN AUTH] 修改密码成功: adminId=${decoded.adminId}`)
    res.json({ success: true, message: '密码修改成功' })
  } catch (e) {
    console.error(`[ADMIN AUTH] 修改密码异常:`, e)
    res.status(500).json({ error: e.message })
  }
})

export default router
