import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function repIsAdmin(id:string){
        const result = await prisma.user.findUnique({where:{id}, select:{isAdmin: true}})
        return result!.isAdmin
    }

export async function repIsRoomCreator(userId: string, roomId: string){
    const result = await prisma.room.findUnique({where:{id: roomId}, select:{creatorId: true}})
    if ((!result) || (result.creatorId != userId)){return false}
    else {return true}
}

export async function repIsSender(userId: string, messageId: string){
    const result = await prisma.message.findUnique({where:{id: messageId}, select:{senderId: true}})
    if ((!result) || (result!.senderId != userId)){return false}
    else {return true}
    
}