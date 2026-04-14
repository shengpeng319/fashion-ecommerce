import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 默认门槛配置
  const defaultConfigs = [
    { level: 1, name: '普通股东', minAmount: new Prisma.Decimal(100000) },
    { level: 2, name: '战略股东', minAmount: new Prisma.Decimal(300000) },
    { level: 3, name: '创始人股东', minAmount: new Prisma.Decimal(500000) }
  ]

  for (const config of defaultConfigs) {
    await prisma.shareholderLevelConfig.upsert({
      where: { level: config.level },
      update: { name: config.name, minAmount: config.minAmount },
      create: config
    })
    console.log(`Upserted level ${config.level}: ${config.name}`)
  }
  console.log('Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
