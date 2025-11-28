import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function repSendMessage(data: any){
    return prisma.message.create({data})
}

export async function repEditMessage(messageId: string, content: string){
    return prisma.message.update({where:{id: messageId}, data: {content, edited: true}})
}

export async function repDeleteMessage(messageId: string){
    return prisma.message.delete({where: {id: messageId}})
}

export async function repGetAllMessagesFromRoom(roomId: string, userId?: string){
    // vê todas as mensagens públicas e as mensagens privadas adequadas
    return prisma.message.findMany({where: {roomId, OR: [{isPrivate: false}, {senderId: userId}, {receiverId: userId}]},
                                orderBy: {createdAt: "asc"}})
}

export async function repGetPrivateConversation(userId: string, otherPersonId: string){
    return prisma.message.findMany({where: {OR: [{senderId: userId, receiverId: otherPersonId}, {senderId: otherPersonId, receiverId: userId}]},
                                    orderBy: {createdAt: "asc"}})
}
