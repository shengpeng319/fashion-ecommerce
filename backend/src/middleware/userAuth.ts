import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fashion-secret-2024'

export interface UserRequest extends Request {
  userId?: string
}

export function userAuth(req: UserRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    console.log(`[USER AUTH MW] 拦截: ${req.method} ${req.url} - 无token`)
    return res.status(401).json({ error: '请先登录' })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    req.userId = decoded.userId
    next()
  } catch (e) {
    console.log(`[USER AUTH MW] 拦截: ${req.method} ${req.url} - token无效: ${(e as Error).message}`)
    return res.status(401).json({ error: 'token无效' })
  }
}
