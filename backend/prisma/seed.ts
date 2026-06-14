import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import https from 'https'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const IMAGE_URLS: Record<string, string> = {
  'shirt.jpg': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop',
  'jeans.jpg': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop',
  'dress.jpg': 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&h=500&fit=crop',
  'tshirt.jpg': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
  'wide-pants.jpg': 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop',
  'lace-skirt.jpg': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
}

function downloadImage(filename: string, url: string): Promise<void> {
  const dir = path.resolve(process.cwd(), 'uploads/products')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const filePath = path.join(dir, filename)
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
    console.log(`  ${filename} already exists, skip`)
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath)
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        https.get(res.headers.location!, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
          res2.pipe(file)
          file.on('finish', () => { file.close(); console.log(`  ${filename} downloaded`); resolve() })
        }).on('error', reject)
      } else {
        res.pipe(file)
        file.on('finish', () => { file.close(); console.log(`  ${filename} downloaded`); resolve() })
      }
    }).on('error', (e) => { fs.unlinkSync(filePath); reject(e) })
  })
}

async function main() {
  console.log('Seeding database...')

  // Check if already seeded
  const existingProducts = await prisma.product.count()
  if (existingProducts > 0) {
    console.log(`Database already has ${existingProducts} products, skipping seed`)
    return
  }

  // Download product images
  console.log('Downloading product images...')
  for (const [filename, url] of Object.entries(IMAGE_URLS)) {
    try {
      await downloadImage(filename, url)
    } catch (e) {
      console.log(`  ${filename} download failed, will use fallback URL`)
    }
  }

  // Create categories
  const tops = await prisma.category.create({ data: { name: '上衣', sort: 1 } })
  const pants = await prisma.category.create({ data: { name: '裤装', sort: 2 } })
  const skirts = await prisma.category.create({ data: { name: '裙装', sort: 3 } })
  console.log('Categories created')

  // Create products with local images
  const products = [
    {
      name: '法式优雅雪纺衬衫',
      subtitle: '春季新款 气质通勤',
      price: 189.00,
      originalPrice: 299.00,
      image: IMAGE_URLS['shirt.jpg'],
      thumbnail: IMAGE_URLS['shirt.jpg'],
      images: JSON.stringify([IMAGE_URLS['shirt.jpg']]),
      description: '轻盈雪纺面料，法式复古设计',
      detail: '<p>商品详情：轻盈雪纺面料，法式复古设计，适合职场通勤。</p>',
      categoryId: tops.id,
      stock: 100,
      sales: 58
    },
    {
      name: '高腰直筒牛仔裤',
      subtitle: '百搭修身 显瘦神器',
      price: 229.00,
      originalPrice: 369.00,
      image: IMAGE_URLS['jeans.jpg'],
      thumbnail: IMAGE_URLS['jeans.jpg'],
      images: JSON.stringify([IMAGE_URLS['jeans.jpg']]),
      description: '高腰设计，拉长腿部线条',
      detail: '<p>高腰直筒牛仔裤，百搭修身。</p>',
      categoryId: pants.id,
      stock: 80,
      sales: 42
    },
    {
      name: '碎花雪纺连衣裙',
      subtitle: '小清新碎花 仙气飘飘',
      price: 268.00,
      originalPrice: 428.00,
      image: IMAGE_URLS['dress.jpg'],
      thumbnail: IMAGE_URLS['dress.jpg'],
      images: JSON.stringify([IMAGE_URLS['dress.jpg']]),
      description: '碎花雪纺，飘逸仙气',
      detail: '<p>碎花雪纺连衣裙，小清新风格。</p>',
      categoryId: skirts.id,
      stock: 60,
      sales: 35
    },
    {
      name: '简约纯棉T恤',
      subtitle: '基础百搭 舒适透气',
      price: 89.00,
      originalPrice: 129.00,
      image: IMAGE_URLS['tshirt.jpg'],
      thumbnail: IMAGE_URLS['tshirt.jpg'],
      images: JSON.stringify([IMAGE_URLS['tshirt.jpg']]),
      description: '100%纯棉，基础百搭款',
      detail: '<p>简约纯棉T恤，舒适透气。</p>',
      categoryId: tops.id,
      stock: 200,
      sales: 120
    },
    {
      name: '阔腿休闲裤',
      subtitle: '垂感十足 显高显瘦',
      price: 199.00,
      originalPrice: 299.00,
      image: IMAGE_URLS['wide-pants.jpg'],
      thumbnail: IMAGE_URLS['wide-pants.jpg'],
      images: JSON.stringify([IMAGE_URLS['wide-pants.jpg']]),
      description: '垂感面料，阔腿设计',
      detail: '<p>阔腿休闲裤，垂感十足。</p>',
      categoryId: pants.id,
      stock: 90,
      sales: 28
    },
    {
      name: '蕾丝边半身裙',
      subtitle: '精致蕾丝 优雅女人味',
      price: 178.00,
      originalPrice: 268.00,
      image: IMAGE_URLS['lace-skirt.jpg'],
      thumbnail: IMAGE_URLS['lace-skirt.jpg'],
      images: JSON.stringify([IMAGE_URLS['lace-skirt.jpg']]),
      description: '精致蕾丝边，优雅大方',
      detail: '<p>蕾丝边半身裙，优雅女人味。</p>',
      categoryId: skirts.id,
      stock: 70,
      sales: 33
    }
  ]

  for (const p of products) {
    await prisma.product.create({ data: p })
  }
  console.log('Products created')

  // Create admin user
  const adminHashed = await bcrypt.hash('admin123', 10)
  const admin = await prisma.adminUser.create({
    data: { phone: '13800138001', password: adminHashed, nickname: '超级管理员', role: 'super_admin' }
  })
  console.log('Admin user created:', admin.phone)

  // Create test user
  const hashed = await bcrypt.hash('123456', 10)
  const user = await prisma.user.create({
    data: {
      phone: '13800138000',
      password: hashed,
      nickname: '测试用户'
    }
  })
  console.log('Test user created:', user.phone)

  // Create test address
  await prisma.address.create({
    data: {
      userId: user.id,
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '福田区',
      detail: '深业上城A座1234',
      isDefault: true
    }
  })
  console.log('Test address created')

  console.log('Seeding done!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
