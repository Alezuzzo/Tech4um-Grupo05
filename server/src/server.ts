import http from 'http';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { setupSocket } from './socket-service';

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const server = http.createServer(app);

// inicia o Socket (que já está configurado para usar o banco real)
setupSocket(server);

// mistura das rotas de mock e sycn
// pra fazer apenas o chat funcionar

// login fake pra garantir que o usuario existe
app.post('/auth', async (req, res) => {
  const { username, email } = req.body;
  
  // id fiox simulado pra facilitar o teste
  const userId = email.replace(/[^a-zA-Z0-9]/g, ''); 

  try {
    // cria;/atualiza o usuario pra nao dar erro de FK
    // nao valido senha - fazer depois
    const user = await prisma.user.upsert({
      where: { email },
      update: { username },
      create: { 
        id: userId, // forcei um id 
        email, 
        username, 
        password: 'temp-password-hash' // placeholder da senha
      }
    });

    console.log(`🔓 Login simulado (sync no banco): ${user.username}`);
    
    res.json({ 
      user: { id: user.id, username: user.username, email: user.email }, 
      token: 'token-de-teste-socket' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao sincronizar usuário mock' });
  }
});

// salas fake tambem
app.get('/rooms', async (req, res) => {
  const roomsMock = [
    { id: 'sala-1', name: 'Dev Raiz', description: 'Socket e Código' },
    { id: 'sala-2', name: 'React Lovers', description: 'Frontend e CSS' }
  ];

  try {
    // garante que essas salas existam no banco
    const systemUser = await prisma.user.upsert({
      where: { email: 'system@test.com' },
      update: {},
      create: { id: 'system', username: 'System', email: 'system@test.com', password: 'sys' }
    });

    for (const room of roomsMock) {
      await prisma.room.upsert({
        where: { id: room.id },
        update: {},
        create: { 
          id: room.id, 
          name: room.name, 
          description: room.description, 
          creatorId: systemUser.id 
        }
      });
    }

    //retorna a lista pro front
    res.json(roomsMock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao sincronizar salas mock' });
  }
});

// rota real do chat - busca o historico verdadeiro salvo pelo Socket
app.get('/chat/:roomId/messages', async (req, res) => {
  const { roomId } = req.params;
  
  try {
    const messages = await prisma.message.findMany({
      where: { roomId },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
      take: 50
    });

    // formata para o front
    const formatted = messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      senderName: msg.sender.username,
      createdAt: msg.createdAt,
      isPrivate: msg.isPrivate,
      receiverId: msg.receiverId
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    // se a sala nao tiver mensagens ou der erro, retorna vazio pra não quebrar
    res.json([]);
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor HÍBRIDO rodando na porta ${PORT}`);
});