import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MessagePayLoad {
    content: string;
    senderId: string;
    roomId: string;
    isPrivate?: boolean;
    receiverId?: string;
}

export const setupSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // libera conexão do Frontend (localhost:5173)
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Usuário conectado: ${socket.id}`);

    // entrar na sala
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} entrou na sala ${roomId}`);
    });

    // envia mensagem
    socket.on("send_message", async (data: MessagePayLoad) => {
      try {
        console.log("Recebendo mensagem:", data);

        //salva no banco
        const savedMsg = await prisma.message.create({
          data: {
            content: data.content,
            roomId: data.roomId,
            senderId: data.senderId,
            isPrivate: data.isPrivate || false,
            receiverId: data.receiverId
          },
          include: {
            sender: true // Traz o nome do usuário junto para devolver pro front
          }
        });

        // B. Formata o objeto para o Frontend
        // O Front espera "senderName", mas o banco tem "sender.username"
        const messageToEmit = {
          id: savedMsg.id,
          content: savedMsg.content,
          senderId: savedMsg.senderId,
          senderName: savedMsg.sender.username,
          roomId: savedMsg.roomId,
          createdAt: savedMsg.createdAt.toISOString(),
          isPrivate: savedMsg.isPrivate,
          receiverId: savedMsg.receiverId
        };

        // C. Emite para a sala
        io.to(data.roomId).emit("receive_message", messageToEmit);
        
      } catch (error) {
        console.error("Erro ao salvar mensagem:", error);
        // Opcional: emitir um erro de volta pro usuário
        socket.emit("error", { message: "Erro ao enviar mensagem" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Usuário desconectado", socket.id);
    });
  });

  return io;
};