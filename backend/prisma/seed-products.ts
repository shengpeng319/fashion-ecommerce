import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 时尚女装商品数据 - 参考韩都衣舍、优衣库、ZARA风格
const products = [
  // 上衣 - 6个
  {
    name: '法式慵懒风针织开衫',
    subtitle: '早秋新款 气质米色',
    price: 229.00,
    originalPrice: 399.00,
    categoryId: '', // 上衣
    stock: 85,
    sales: 126,
    images: JSON.stringify(['https://img.yzcdn.cn/vant/apple-1.jpg']),
    description: '法式慵懒风针织开衫，早秋必备气质单品',
    detail: '<p>法式慵懒风针织开衫，精选优质针织面料，柔软舒适。早秋新款，气质米色，百搭款。</p>'
  },
  {
    name: '韩版宽松字母印花卫衣',
    subtitle: '休闲百搭 学生党首选',
    price: 159.00,
    originalPrice: 259.00,
    categoryId: '',
    stock: 120,
    sales: 342,
    images: JSON.stringify(['https://img.yzcdn.cn/vant/apple-2.jpg']),
    description: '韩版宽松卫衣，休闲百搭',
    detail: '<p>韩版宽松字母印花卫衣，舒适面料，休闲百搭，学生党首选。</p>'
  },
  {
    name: '气质飘带真丝衬衫',
    subtitle: '职场通勤 优雅大气',
    price: 319.00,
    originalPrice: 499.00,
    categoryId: '',
    stock: 68,
    sales: 89,
    images: JSON.stringify(['https://img.yzcdn.cn/vant/cat.jpeg']),
    description: '气质飘带真丝衬衫，职场通勤必备',
    detail: '<p>气质飘带真丝衬衫，选用优质真丝面料，飘带设计增添优雅气质。</p>'
  },
  {
    name: '复古波点雪纺上衣',
    subtitle: '法式优雅 露肩设计',
    price: 189.00,
    originalPrice: 329.00,
    categoryId: '',
    stock: 76,
    sales: 167,
    images: JSON.stringify(['https://placehold.co/400x500/pink/white?text=Ladies+Blouse']),
    description: '复古波点雪纺上衣，法式优雅露肩设计',
    detail: '<p>复古波点雪纺上衣，露肩设计增添小性感，法式优雅风格。</p>'
  },
  {
    name: '高领修身纯棉打底衫',
    subtitle: '秋冬必备 基础百搭',
    price: 99.00,
    originalPrice: 159.00,
    categoryId: '',
    stock: 200,
    sales: 523,
    images: JSON.stringify(['https://placehold.co/400x500/beige/black?text=Camisole']),
    description: '高领修身纯棉打底衫，秋冬必备基础款',
    detail: '<p>高领修身纯棉打底衫，优质纯棉面料，贴身舒适，基础百搭款。</p>'
  },
  {
    name: '荷叶边蕾丝短袖上衣',
    subtitle: '甜美公主风 约会必备',
    price: 179.00,
    originalPrice: 299.00,
    categoryId: '',
    stock: 92,
    sales: 201,
    images: JSON.stringify(['https://placehold.co/400x500/white/pink?text=Ladies+Top']),
    description: '荷叶边蕾丝短袖上衣，甜美公主风',
    detail: '<p>荷叶边蕾丝短袖上衣，甜美公主风设计，约会必备单品。</p>'
  },
  // 裤装 - 6个
  {
    name: '高腰直筒九分牛仔裤',
    subtitle: '显瘦百搭 春秋新款',
    price: 199.00,
    originalPrice: 329.00,
    categoryId: '', // 裤装
    stock: 110,
    sales: 445,
    images: JSON.stringify(['https://img.yzcdn.cn/vant/apple-3.jpg']),
    description: '高腰直筒九分牛仔裤，显瘦百搭',
    detail: '<p>高腰直筒九分牛仔裤，修饰腿型，显瘦百搭，春秋新款。</p>'
  },
  {
    name: '阔腿裤休闲长裤',
    subtitle: '显高显瘦 气场全开',
    price: 239.00,
    originalPrice: 399.00,
    categoryId: '',
    stock: 88,
    sales: 278,
    images: JSON.stringify(['https://placehold.co/400x500/black/white?text=Wide+Leg+Pants']),
    description: '阔腿裤休闲长裤，显高显瘦气场全开',
    detail: '<p>阔腿裤休闲长裤，高腰设计显高显瘦，气场全开。</p>'
  },
  {
    name: '修身小脚铅笔裤',
    subtitle: '职场通勤 干练利落',
    price: 179.00,
    originalPrice: 299.00,
    categoryId: '',
    stock: 130,
    sales: 367,
    images: JSON.stringify(['https://placehold.co/400x500/navy/white?text=Pencil+Pants']),
    description: '修身小脚铅笔裤，职场通勤必备',
    detail: '<p>修身小脚铅笔裤，干练利落，职场通勤首选。</p>'
  },
  {
    name: '运动休闲束脚裤',
    subtitle: '舒适自在 居家户外',
    price: 129.00,
    originalPrice: 199.00,
    categoryId: '',
    stock: 150,
    sales: 189,
    images: JSON.stringify(['https://placehold.co/400x500/gray/white?text=Sport+Pants']),
    description: '运动休闲束脚裤，舒适自在',
    detail: '<p>运动休闲束脚裤，舒适面料，自在运动，居家户外皆宜。</p>'
  },
  {
    name: '复古格纹阔腿裤',
    subtitle: '英伦风 时尚博主同款',
    price: 269.00,
    originalPrice: 459.00,
    categoryId: '',
    stock: 65,
    sales: 156,
    images: JSON.stringify(['https://placehold.co/400x500/brown/white?text=Tartan+Pants']),
    description: '复古格纹阔腿裤，英伦时尚',
    detail: '<p>复古格纹阔腿裤，英伦风格，时尚博主同款。</p>'
  },
  {
    name: '西装烟管裤',
    subtitle: '职业装 干练气质',
    price: 219.00,
    originalPrice: 359.00,
    categoryId: '',
    stock: 95,
    sales: 234,
    images: JSON.stringify(['https://placehold.co/400x500/black/gold?text=Suit+Pants']),
    description: '西装烟管裤，职业干练气质',
    detail: '<p>西装烟管裤，干练气质，职业装首选。</p>'
  },
  // 裙装 - 6个
  {
    name: '碎花雪纺连衣裙',
    subtitle: '清新碎花 仙气飘飘',
    price: 268.00,
    originalPrice: 428.00,
    categoryId: '', // 裙装
    stock: 78,
    sales: 412,
    images: JSON.stringify(['https://img.yzcdn.cn/vant/apple-4.jpg']),
    description: '碎花雪纺连衣裙，清新仙气',
    detail: '<p>碎花雪纺连衣裙，轻盈面料，清新碎花设计，仙气飘飘。</p>'
  },
  {
    name: '法式复古茶歇裙',
    subtitle: '方领收腰 优雅浪漫',
    price: 299.00,
    originalPrice: 499.00,
    categoryId: '',
    stock: 55,
    sales: 289,
    images: JSON.stringify(['https://placehold.co/400x500/pink/white?text=Tea+Dress']),
    description: '法式复古茶歇裙，方领收腰优雅浪漫',
    detail: '<p>法式复古茶歇裙，方领设计，收腰剪裁，优雅浪漫。</p>'
  },
  {
    name: '针织气质连衣裙',
    subtitle: '秋冬新款 知性优雅',
    price: 349.00,
    originalPrice: 569.00,
    categoryId: '',
    stock: 62,
    sales: 178,
    images: JSON.stringify(['https://placehold.co/400x500/camel/white?text=Knit+Dress']),
    description: '针织气质连衣裙，知性优雅',
    detail: '<p>针织气质连衣裙，优质针织面料，秋冬新款，知性优雅。</p>'
  },
  {
    name: 'A字高腰半身裙',
    subtitle: '显瘦百搭 学院风',
    price: 169.00,
    originalPrice: 279.00,
    categoryId: '',
    stock: 105,
    sales: 356,
    images: JSON.stringify(['https://placehold.co/400x500/white/black?text=A+Line+Skirt']),
    description: 'A字高腰半身裙，显瘦百搭学院风',
    detail: '<p>A字高腰半身裙，高腰设计显瘦百搭，学院风格。</p>'
  },
  {
    name: '百褶网纱半身裙',
    subtitle: '轻盈飘逸 晚礼服风',
    price: 219.00,
    originalPrice: 369.00,
    categoryId: '',
    stock: 82,
    sales: 145,
    images: JSON.stringify(['https://placehold.co/400x500/silver/white?text=Pleated+Skirt']),
    description: '百褶网纱半身裙，轻盈飘逸',
    detail: '<p>百褶网纱半身裙，轻盈飘逸面料，晚礼服风格。</p>'
  },
  {
    name: '蕾丝拼接吊带裙',
    subtitle: '性感迷人 约会首选',
    price: 259.00,
    originalPrice: 429.00,
    categoryId: '',
    stock: 48,
    sales: 198,
    images: JSON.stringify(['https://placehold.co/400x500/black/gold?text=Lace+Dress']),
    description: '蕾丝拼接吊带裙，性感迷人约会首选',
    detail: '<p>蕾丝拼接吊带裙，蕾丝设计增添性感魅力，约会首选。</p>'
  },
  // 配饰 - 3个（放在上衣分类下作为补充）
  {
    name: '韩版纯棉头巾发带',
    subtitle: '优雅发饰 减龄小心机',
    price: 29.00,
    originalPrice: 49.00,
    categoryId: '',
    stock: 200,
    sales: 89,
    images: JSON.stringify(['https://placehold.co/400x500/pink/white?text=Headband']),
    description: '韩版纯棉头巾发带，优雅发饰',
    detail: '<p>韩版纯棉头巾发带，优雅设计，减龄小心机。</p>'
  },
  {
    name: '通勤简约手提包',
    subtitle: '大容量 职场首选',
    price: 199.00,
    originalPrice: 359.00,
    categoryId: '',
    stock: 75,
    sales: 234,
    images: JSON.stringify(['https://placehold.co/400x500/brown/white?text=Handbag']),
    description: '通勤简约手提包，大容量职场首选',
    detail: '<p>通勤简约手提包，大容量设计，职场首选。</p>'
  },
  {
    name: '细节点缀皮带腰带',
    subtitle: '精致扣头 显瘦神器',
    price: 69.00,
    originalPrice: 99.00,
    categoryId: '',
    stock: 180,
    sales: 167,
    images: JSON.stringify(['https://placehold.co/400x500/black/gold?text=Belt']),
    description: '细节点缀皮带腰带，精致扣头显瘦神器',
    detail: '<p>细节点缀皮带腰带，精致扣头设计，显瘦神器。</p>'
  }
]

async function main() {
  console.log('开始扩充商品数据...')
  
  // 获取分类
  const categories = await prisma.category.findMany()
  const categoryMap: Record<string, string> = {}
  categories.forEach(c => { categoryMap[c.name] = c.id })
  
  console.log('分类映射:', categoryMap)
  
  // 为每个产品设置正确的categoryId
  let topsId = categoryMap['上衣']
  let pantsId = categoryMap['裤装']
  let skirtsId = categoryMap['裙装']
  
  // 设置categoryId
  products[0].categoryId = topsId  // 针织开衫
  products[1].categoryId = topsId  // 卫衣
  products[2].categoryId = topsId  // 真丝衬衫
  products[3].categoryId = topsId  // 波点上衣
  products[4].categoryId = topsId  // 打底衫
  products[5].categoryId = topsId  // 蕾丝上衣
  products[6].categoryId = pantsId // 牛仔裤
  products[7].categoryId = pantsId // 阔腿裤
  products[8].categoryId = pantsId // 铅笔裤
  products[9].categoryId = pantsId // 运动裤
  products[10].categoryId = pantsId // 格纹裤
  products[11].categoryId = pantsId // 烟管裤
  products[12].categoryId = skirtsId // 碎花裙
  products[13].categoryId = skirtsId // 茶歇裙
  products[14].categoryId = skirtsId // 针织裙
  products[15].categoryId = skirtsId // 半身裙
  products[16].categoryId = skirtsId // 百褶裙
  products[17].categoryId = skirtsId // 吊带裙
  products[18].categoryId = topsId  // 发带
  products[19].categoryId = topsId  // 手提包
  products[20].categoryId = topsId  // 腰带
  
  // 删除现有商品（保留seed数据）
  await prisma.product.deleteMany({})
  console.log('已清空现有商品数据')
  
  // 批量创建商品
  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        subtitle: p.subtitle,
        price: p.price,
        originalPrice: p.originalPrice,
        categoryId: p.categoryId,
        stock: p.stock,
        sales: p.sales,
        images: p.images,
        description: p.description,
        detail: p.detail,
        isActive: true
      }
    })
    console.log(`创建: ${p.name}`)
  }
  
  console.log(`\n✅ 共创建 ${products.length} 个商品`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
