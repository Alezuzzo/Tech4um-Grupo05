// server.ts (versão ajustada para o render)
import http from 'http';
import app from './app'; //como o app.ts está configurado, agora usamo ele com as rodas reais
import { setupSocket } from './socket-service';
import { PrismaClient } from '@prisma/client';

// Criamos o servidor HTTP a partir do app
const server = http.createServer(app);

// Inicia o socket (é nele que o chat real funciona)
setupSocket(server);

// Instância do Prisma (usada apenas pelas rotas mock abaixo)
const prisma = new PrismaClient();

//comentei caso vocês queiram testar algo, mas as rotas fake sobescreviam as reais e estavam impedindo os testes
//agora como subi no render precisei utilizar as que eu fiz

/*

app.post('/auth', async (req, res) => {   
  const { username, email } = req.body;
  
  const userId = email.replace(/[^a-zA-Z0-9]/g, ''); // id fake

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { username },
      create: { 
        id: userId,
        email, 
        username, 
        password: 'temp-password-hash' // senha fake
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
app.get('/rooms', async (req, res) => {   // 
  const roomsMock = [
    { id: 'sala-1', name: 'Dev Raiz', description: 'Socket e Código' },
    { id: 'sala-2', name: 'React Lovers', description: 'Frontend e CSS' }
  ];

  try {
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
    res.json([]); // fallback
  }
});

*/


const PORT = process.env.PORT || 3000;  //  porta dinâmica para deploy

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
