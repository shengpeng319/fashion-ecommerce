import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating admin user...')
  
  const hashed = await bcrypt.hash('admin123', 10)
  const admin = await prisma.adminUser.upsert({
    where: { phone: '13800138001' },
    update: {},
    create: {
      phone: '13800138001',
      password: hashed,
      nickname: '管理员',
      role: 'super_admin'
    }
  })
  
  console.log('Admin created:', admin.phone)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
