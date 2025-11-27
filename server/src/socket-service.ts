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

// gestão de usuarios online na memoria
// isso permite mostrar quem está na sala em tempo real na sidebar
let onlineUsers: { socketId: string; userId: string; username: string; roomId: string }[] = [];

// adiciona usuário na lista
const userJoin = (socketId: string, userId: string, username: string, roomId: string) => {
  const user = { socketId, userId, username, roomId };
  // remove duplicatas se o socket reconectar
  onlineUsers = onlineUsers.filter(u => u.socketId !== socketId);
  onlineUsers.push(user);
  return user;
};

// remove usuário da lista
const userLeave = (socketId: string) => {
  const index = onlineUsers.findIndex(u => u.socketId === socketId);
  if (index !== -1) {
    return onlineUsers.splice(index, 1)[0];
  }
};

//lista daquela sala
const getRoomUsers = (roomId: string) => {
  return onlineUsers.filter(u => u.roomId === roomId);
};

export const setupSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // libera conexão do front
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket: Socket) => {
    //entrar na Sala
    // o front manda { roomId, user }
    socket.on("join_room", (data: any) => {
      let roomId = "";
      let user = null;

      // tratamento para aceitar tanto string quanto objeto (compatibilidade)
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
      console.log(`🟢 Socket ${socket.id} (${username}) entrou na sala ${roomId}`);

      // avisa todos da sala quem está online
      const usersInRoom = getRoomUsers(newUser.roomId);
      io.to(newUser.roomId).emit("room_users", usersInRoom);
    });

    //envia mensagem
    socket.on("send_message", async (data: MessagePayload) => {
      try {
        console.log("📨 Mensagem recebida:", data);

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
            sender: true //traz o nome do usuario junto
          }
        });

        //formata o obj pro front
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

        // emite para sala
        io.to(data.roomId).emit("receive_message", messageToEmit);
        
      } catch (error) {
        console.error("❌ Erro ao salvar mensagem:", error);
        socket.emit("error", { message: "Erro ao salvar mensagem no banco." });
      }
    });

    // desconecta
    socket.on("disconnect", () => {
      const user = userLeave(socket.id);
      if (user) {
        //avisa quem saiu da sala
        io.to(user.roomId).emit("room_users", getRoomUsers(user.roomId));
        console.log(`${user.username} saiu.`);
      }
    });
  });

  return io;
};