import { Router } from 'express'
import { prisma } from '../../index.js'
import { adminAuth, AdminRequest } from '../../middleware/auth'

const router = Router()

// 分类列表
router.get('/categories', adminAuth, async (req: AdminRequest, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sort: 'asc' }
    })
    res.json({ success: true, categories })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 添加分类
router.post('/categories', adminAuth, async (req: AdminRequest, res) => {
  try {
    const { name, icon, sort, parentId } = req.body
    if (!name) {
      return res.status(400).json({ error: '分类名称必填' })
    }
    const category = await prisma.category.create({
      data: { name, icon, sort: Number(sort) || 0, parentId }
    })
    res.json({ success: true, category })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 更新分类
router.put('/categories/:id', adminAuth, async (req: AdminRequest, res) => {
  try {
    const { name, icon, sort, parentId } = req.body
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, icon, sort: sort ? Number(sort) : undefined, parentId }
    })
    res.json({ success: true, category })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 删除分类
router.delete('/categories/:id', adminAuth, async (req: AdminRequest, res) => {
  try {
    // 检查是否有商品关联
    const count = await prisma.product.count({ where: { categoryId: req.params.id } })
    if (count > 0) {
      return res.status(400).json({ error: '该分类下有商品，无法删除' })
    }
    await prisma.category.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: '删除成功' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
