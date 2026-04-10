import { Router } from 'express'
import { prisma } from '../../index.js'
import { upload, processImage } from '../../middleware/upload'
import { adminAuth, AdminRequest } from '../../middleware/auth'

const router = Router()

// 商品列表
router.get('/products', adminAuth, async (req: AdminRequest, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, categoryId, isActive } = req.query
    const where: any = {}
    
    if (keyword) {
      where.OR = [
        { name: { contains: keyword as string } },
        { subtitle: { contains: keyword as string } }
      ]
    }
    if (categoryId) where.categoryId = categoryId
    if (isActive !== undefined) where.isActive = isActive === 'true'

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, brand: true },
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ])

    res.json({ success: true, products, total, page: Number(page), pageSize: Number(pageSize) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 获取单个商品
router.get('/products/:id', adminAuth, async (req: AdminRequest, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true, brand: true }
    })
    if (!product) {
      return res.status(404).json({ error: '商品不存在' })
    }
    res.json({ success: true, product })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 添加商品
router.post('/products', adminAuth, async (req: AdminRequest, res) => {
  try {
    const { name, subtitle, price, originalPrice, image, thumbnail, images, description, detail, categoryId, brandId, stock, sales, isActive } = req.body
    
    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: '名称、价格、分类必填' })
    }

    const product = await prisma.product.create({
      data: {
        name,
        subtitle,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        image,
        thumbnail,
        images: images || '[]',
        description,
        detail,
        categoryId,
        brandId,
        stock: Number(stock) || 0,
        sales: Number(sales) || 0,
        isActive: isActive !== false
      }
    })
    res.json({ success: true, product })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 更新商品
router.put('/products/:id', adminAuth, async (req: AdminRequest, res) => {
  try {
    const { name, subtitle, price, originalPrice, image, thumbnail, images, description, detail, categoryId, brandId, stock, sales, isActive } = req.body
    
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        subtitle,
        price: price ? Number(price) : undefined,
        originalPrice: originalPrice !== undefined ? (originalPrice ? Number(originalPrice) : null) : undefined,
        image,
        thumbnail,
        images,
        description,
        detail,
        categoryId,
        brandId,
        stock: stock !== undefined ? Number(stock) : undefined,
        sales: sales !== undefined ? Number(sales) : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    })
    res.json({ success: true, product })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 删除商品
router.delete('/products/:id', adminAuth, async (req: AdminRequest, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: '删除成功' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 图片上传
router.post('/upload', adminAuth, upload.single('image'), async (req: AdminRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择图片' })
    }
    const { image, thumbnail } = await processImage(req.file.filename)
    res.json({ success: true, image, thumbnail })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
