import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testCreateUser = async () => {
  try {
    const newUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      },
    });
    console.log('Usuário criado com sucesso:', newUser);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();  
  }
};

testCreateUser();

