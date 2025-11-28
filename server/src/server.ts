import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { setupSocket, getOnlineCounts } from './socket-service';
import authRouter from './routes/auth.route';
import userRouter from './routes/user.route';

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(helmet());
app.use(express.json());

const server = http.createServer(app);
const prisma = new PrismaClient();

// inicia o Socket.io
setupSocket(server);

// rotas de autenticação e usuários
app.use('/auth', authRouter);
app.use('/users', userRouter);

// rotas dos sistemas de sala e chat

//listar salas
app.get('/rooms', async (req, res) => {
  //evita cache no navegador para atualizar o ranking sempre
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  try {
    let rooms = await prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        _count: { select: { messages: true } }, //ranking
        creator: { select: { username: true } } //nome do criador
      }
    });

    //se não tiver salas, cria Seed
    if (rooms.length === 0) {
      let admin = await prisma.user.findFirst();
      
      if (!admin) {
        admin = await prisma.user.create({
          data: { 
            username: 'System', 
            email: 'admin@tech4um.com', 
            password: 'sys' 
          }
        });
      }

      await prisma.room.createMany({
        data: [
          { name: 'Geral', description: 'Papo livre sobre tecnologia', creatorId: admin.id },
          { name: 'React', description: 'Frontend, Hooks e Componentes', creatorId: admin.id },
        ]
      });
      
      //busca novamente para retornar formatado corretamente
      rooms = await prisma.room.findMany({
        orderBy: { createdAt: 'desc' },
        include: { 
          _count: { select: { messages: true } },
          creator: { select: { username: true } }
        }
      });
    }

    // contagem real
    const liveCounts = getOnlineCounts();

    const formatted = rooms.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      creatorId: r.creatorId,
      
      //mapeamentos para o front
      creatorName: r.creator?.username || "Admin",
      participantsCount: liveCounts[r.id] || 0,
      totalMessages: r._count.messages
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Erro ao buscar salas:", error);
    res.status(500).json({ error: 'Erro ao buscar salas' });
  }
});

//criar Sala
app.post('/rooms', async (req, res) => {
  //adicionado userId para pegar o criador correto
  const { name, description, userId } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nome da sala é obrigatório' });
  }

  try {
    let creator;

    //tenta achar o usuário logado
    if (userId) {
      creator = await prisma.user.findUnique({ where: { id: userId } });
    }

    //fallback: Se não mandou ou não achou, pega o primeiro do banco
    if (!creator) {
      creator = await prisma.user.findFirst();
    }
    
    if (!creator) {
      return res.status(400).json({ error: 'Não há usuários no banco para criar sala.' });
    }

    const newRoom = await prisma.room.create({
      data: {
        name,
        description,
        creatorId: creator.id
      }
    });

    res.status(201).json(newRoom);
  } catch (error: any) {
    console.error("Erro ao criar sala:", error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe uma sala com este nome.' });
    }
    res.status(500).json({ error: 'Erro ao criar sala' });
  }
});

//histórico do chat
app.get('/chat/:roomId/messages', async (req, res) => {
  const { roomId } = req.params;
  
  try {
    const messages = await prisma.message.findMany({
      where: { roomId },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
      take: 50
    });

    const formatted = messages.map((msg) => ({
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
    console.error("Erro ao buscar histórico:", error);
    res.json([]);
  }
});

//deletar sala
app.delete('/rooms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.message.deleteMany({ where: { roomId: id } });
    await prisma.room.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar sala' });
  }
});

server.listen(PORT, () => {
  console.log(`✅ Servidor Unificado rodando na porta ${PORT}`);
});