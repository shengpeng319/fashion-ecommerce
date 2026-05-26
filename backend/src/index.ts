import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { PrismaClient } from '@prisma/client'

dotenv.config({ path: path.resolve(process.cwd(), '../.env') })
dotenv.config()

const app = express()
const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001
const HOST = process.env.HOST || '0.0.0.0'
export const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

app.use((req, _res, next) => {
  const start = Date.now()
  const ts = new Date().toISOString()
  console.log(`[${ts}] --> ${req.method} ${req.url} ip=${req.ip}`)
  _res.on('finish', () => {
    const ms = Date.now() - start
    console.log(`[${ts}] <-- ${req.method} ${req.url} ${_res.statusCode} ${ms}ms`)
  })
  next()
})

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// C端路由
import authRoutes from './routes/auth'
import productRoutes from './routes/product'
import categoryRoutes from './routes/category'
import cartRoutes from './routes/cart'
import orderRoutes from './routes/order'
import wholesaleRoutes from './routes/wholesale'
import addressRoutes from './routes/address'
import memberRoutes from './routes/member'

app.use('/api/fashions/auth', authRoutes)
app.use('/api/fashions/products', productRoutes)
app.use('/api/fashions/categories', categoryRoutes)
app.use('/api/fashions/cart', cartRoutes)
app.use('/api/fashions/orders', orderRoutes)
app.use('/api/fashions/wholesale', wholesaleRoutes)
app.use('/api/fashions/addresses', addressRoutes)
app.use('/api/fashions/member', memberRoutes)

// 管理端路由
import adminAuthRoutes from './routes/admin/auth'
import adminProductRoutes from './routes/admin/product'
import adminCategoryRoutes from './routes/admin/category'
import adminOrderRoutes from './routes/admin/order'
import adminUserRoutes from './routes/admin/user'
import shareholderRoutes from './routes/shareholder'
import adminMemberRoutes from './routes/admin/member'

app.use('/api/admin/auth', adminAuthRoutes)
app.use('/api/admin', adminProductRoutes)
app.use('/api/admin', adminCategoryRoutes)
app.use('/api/admin', adminOrderRoutes)
app.use('/api/admin', adminUserRoutes)
app.use('/api/admin', adminMemberRoutes)
app.use('/api/shareholder', shareholderRoutes)

app.listen(Number(PORT), HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`)
})

export default app
