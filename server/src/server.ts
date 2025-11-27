import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { setupSocket } from './socket-service';
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

//inicia o socket
setupSocket(server);

// 4. ROTAS

//rotas de autenticação e usuários
app.use('/auth', authRouter);
app.use('/users', userRouter);

//rotas de salas e chat

//lista salas
app.get('/rooms', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        _count: { select: { messages: true } } 
      }
    });

    //se não tiver salas, cria umas padrão (Seed) para não ficar vazio
    if (rooms.length === 0) {
      //tenta achar ou criar um admin para ser o dono das salas iniciais
      let admin = await prisma.user.findFirst();
      
      if (!admin) {
        //se o banco estiver zerado mesmo, cria um user dummy
        admin = await prisma.user.create({
          data: { 
            username: 'System', 
            email: 'admin@tech4um.com', 
            password: 'sys' //hash simplificado só pra seed
          }
        });
      }

      await prisma.room.createMany({
        data: [
          { name: 'Geral', description: 'Papo livre', creatorId: admin.id },
          { name: 'React', description: 'Frontend e JS', creatorId: admin.id }
        ]
      });
      
      const newRooms = await prisma.room.findMany();
      return res.json(newRooms);
    }

    res.json(rooms);
  } catch (error) {
    console.error("Erro ao buscar salas:", error);
    res.status(500).json({ error: 'Erro ao buscar salas' });
  }
});

//cria sala
app.post('/rooms', async (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nome da sala é obrigatório' });
  }

  try {
    //pega o primeiro usuário do banco para ser dono
    const creator = await prisma.user.findFirst();
    
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
    //tratamento para nomes duplicados de sala
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

//inicia servidor
server.listen(PORT, () => {
  console.log(`✅ Servidor Unificado rodando na porta ${PORT}`);
});