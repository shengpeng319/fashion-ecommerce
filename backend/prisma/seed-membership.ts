import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const levels = [
  {
    key: 'LIGHT',
    name: '轻会员',
    minDeposit: 0,
    bonusPoints: 0,
    isRefundable: false,
    sortOrder: 1,
    benefits: JSON.stringify(['消费累计积分', '专属生日礼包'])
  },
  {
    key: 'PREMIUM',
    name: '尊享会员',
    minDeposit: 3000,
    bonusPoints: 600,
    isRefundable: true,
    sortOrder: 2,
    benefits: JSON.stringify(['定制生日礼盒', '新品优先选款权', '消费累计积分'])
  },
  {
    key: 'LUXURY',
    name: '奢享会员',
    minDeposit: 5000,
    bonusPoints: 2000,
    isRefundable: true,
    sortOrder: 3,
    benefits: JSON.stringify(['一对一专属穿搭师', '生日消费双倍积分', '新品优先选款权', '消费累计积分'])
  },
  {
    key: 'SELECT',
    name: '臻选会员',
    minDeposit: 10000,
    bonusPoints: 5000,
    isRefundable: true,
    sortOrder: 4,
    benefits: JSON.stringify(['季度品牌画册寄送', '爆款黄金码预留权限', '一对一专属穿搭师', '消费累计积分'])
  },
  {
    key: 'CREATOR',
    name: '美学共创员',
    minDeposit: 30000,
    bonusPoints: 15000,
    isRefundable: false,
    sortOrder: 5,
    benefits: JSON.stringify(['新品投票权', '服装设计优化建议权', '推荐新会员返15000积分', '消费累计积分'])
  },
  {
    key: 'OFFICER',
    name: '美学共创官',
    minDeposit: 50000,
    bonusPoints: 50000,
    isRefundable: false,
    sortOrder: 6,
    benefits: JSON.stringify(['新品评审权', '品牌美学顾问证书', '推荐新会员返50000积分', '消费累计积分'])
  }
]

async function main() {
  console.log('Seeding membership levels...')
  for (const level of levels) {
    await prisma.membershipLevel.upsert({
      where: { key: level.key },
      update: level,
      create: level
    })
    console.log(`  ✓ ${level.name} (${level.key})`)
  }
  console.log('Done!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
