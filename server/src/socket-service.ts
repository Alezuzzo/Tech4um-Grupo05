import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface MessagePayload {
  content: string;
  senderId: string;
  roomId: string;
  isPrivate?: boolean;
  receiverId?: string;
}

//gestão de usuarios online
let onlineUsers: { socketId: string; userId: string; username: string; roomId: string }[] = [];

const userJoin = (socketId: string, userId: string, username: string, roomId: string) => {
  const user = { socketId, userId, username, roomId };
  //remove se já existir para evitar duplicidade
  onlineUsers = onlineUsers.filter(u => u.socketId !== socketId);
  onlineUsers.push(user);
  return user;
};

const userLeave = (socketId: string) => {
  const index = onlineUsers.findIndex(u => u.socketId === socketId);
  if (index !== -1) {
    return onlineUsers.splice(index, 1)[0];
  }
};

const getRoomUsers = (roomId: string) => {
  return onlineUsers.filter(u => u.roomId === roomId);
};

// server.ts vai importar isso para saber quantos users tem em cada sala
export const getOnlineCounts = () => {
  const counts: Record<string, number> = {};
  
  onlineUsers.forEach((user) => {
    //incrementa o contador para cada sala que encontrar na lista
    counts[user.roomId] = (counts[user.roomId] || 0) + 1;
  });
  
  return counts;
};

export const setupSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket: Socket) => {
    //entrar na Sala
    socket.on("join_room", (data: any) => {
      let roomId = "";
      let user = null;

      if (typeof data === "string") {
        roomId = data;
      } else {
        roomId = data.roomId;
        user = data.user;
      }

      const username = user?.username || `Visitante-${socket.id.substring(0, 4)}`;
      const userId = user?.id || socket.id;

      const newUser = userJoin(socket.id, userId, username, roomId);
      
      socket.join(newUser.roomId);
      
      //atualiza lista de participantes pro chat
      const usersInRoom = getRoomUsers(newUser.roomId);
      io.to(newUser.roomId).emit("room_users", usersInRoom);
    });

    //enviar mensagem
    socket.on("send_message", async (data: MessagePayload) => {
      try {
        console.log("📨 Mensagem:", data.content);

        // salva no Banco
        const savedMsg = await prisma.message.create({
          data: {
            content: data.content,
            roomId: data.roomId,
            senderId: data.senderId,
            isPrivate: data.isPrivate || false,
            receiverId: data.receiverId
          },
          include: { sender: true }
        });

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

        io.to(data.roomId).emit("receive_message", messageToEmit);
        
      } catch (error) {
        console.error("Erro ao salvar mensagem:", error);
      }
    });

    socket.on("disconnect", () => {
      const user = userLeave(socket.id);
      if (user) {
        io.to(user.roomId).emit("room_users", getRoomUsers(user.roomId));
      }
    });
  });

  return io;
};