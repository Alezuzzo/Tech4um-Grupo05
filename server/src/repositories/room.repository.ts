import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function repGetAllRooms(){
    return prisma.room.findMany()
}

export async function repNewRoom(data: {name: string, description: string, creatorId: string}){
    return prisma.room.create({data})
}

export async function repGetRoomById(id: string){
    return prisma.room.findUnique({where: {id}})
}

export async function repUpdateRoomInfo(id: string, data: any){
    return prisma.room.update({where: {id}, data})
}

export async function repDeleteRoom(id: string){
    return prisma.room.delete({where: {id}})
}

export async function repJoinRoom(userId: string, roomId: string){
    const user = await prisma.user.findUnique({where: {id: userId}})
    const room = await prisma.room.findUnique({where: {id: roomId}})
    if ((user) && (room)){
        await prisma.$transaction([user.joinedRooms.push(roomId), room.usersInRoom.push(userId)])
    }
}

export async function repLeaveRoom(userId: string, roomId: string){
    const user = await prisma.user.findUnique({where: {id: userId}})
    const room = await prisma.room.findUnique({where: {id: roomId}})
    if ((user) && (room)){
        const roomWithoutUser = room.usersInRoom.filter((id: string) => id != userId)
        const userWithoutRoom = user.joinedRooms.filter((id: string) => id != roomId)
        await prisma.$transaction([prisma.user.update({where: {id: roomId}, data:{joinedRooms: userWithoutRoom}}), 
                                   prisma.room.update({where: {id: userId}, data:{usersInRoom: roomWithoutUser}})])
    }
}