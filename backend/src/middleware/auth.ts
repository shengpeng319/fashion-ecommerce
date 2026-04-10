import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-2024'

export interface AdminRequest extends Request {
  adminId?: string
  adminRole?: string
}

export function adminAuth(req: AdminRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: '请先登录' })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string; role: string }
    req.adminId = decoded.adminId
    req.adminRole = decoded.role
    next()
  } catch (e) {
    return res.status(401).json({ error: 'token无效' })
  }
}
