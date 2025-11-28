import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando Seed do Banco...")

  // Define senha padrão ou usa variável de ambiente
  const defaultPassword = process.env.SEED_PASSWORD || '123456'
  
  // Cria o hash da senha
  const passwordHash = await bcrypt.hash(defaultPassword, 10)

  // Usuário 1: Eduardo
  const edu = await prisma.user.upsert({
    where: { email: 'edu1010@email.com' },
    update: {},
    create: {
      username: "Eduardo",
      email: "edu1010@email.com",
      password: passwordHash
    }
  })

  // Usuário 2: Monica
  const monica = await prisma.user.upsert({
    where: { email: 'lilmonix3@email.com' },
    update: {},
    create: {
      username: "Monica",
      email: "lilmonix3@email.com",
      password: passwordHash
    }
  })

  console.log(`✅ Usuários criados: ${edu.username} e ${monica.username}`)
}

// Execução da função main com tratamento de erro adequado
main()
  .catch((e) => {
    console.error('❌ Erro no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });