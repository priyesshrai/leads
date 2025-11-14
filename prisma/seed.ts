import prisma from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const email = 'admin@priyesh.com'
  const password = 'adminpriyesh'
  const hashed = await bcrypt.hash(password, 10)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('✅ SuperAdmin already exists.')
    return
  }

  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email,
      password: hashed,
      role: 'SUPERADMIN',
    },
  })

  console.log('✅ SuperAdmin created successfully!')
  console.log('Email:', email)
  console.log('Password:', password)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
