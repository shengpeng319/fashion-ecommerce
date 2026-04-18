import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
export const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// 静态文件服务（上传的图片）
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

app.use('/api/fashions/auth', authRoutes)
app.use('/api/fashions/products', productRoutes)
app.use('/api/fashions/categories', categoryRoutes)
app.use('/api/fashions/cart', cartRoutes)
app.use('/api/fashions/orders', orderRoutes)
app.use('/api/fashions/wholesale', wholesaleRoutes)
app.use('/api/fashions/addresses', addressRoutes)

// 管理端路由
import adminAuthRoutes from './routes/admin/auth'
import adminProductRoutes from './routes/admin/product'
import adminCategoryRoutes from './routes/admin/category'
import adminOrderRoutes from './routes/admin/order'
import adminUserRoutes from './routes/admin/user'
import shareholderRoutes from './routes/shareholder'

app.use('/api/admin/auth', adminAuthRoutes)
app.use('/api/admin', adminProductRoutes)
app.use('/api/admin', adminCategoryRoutes)
app.use('/api/admin', adminOrderRoutes)
app.use('/api/admin', adminUserRoutes)
app.use('/api/shareholder', shareholderRoutes)

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})

export default app
