import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function repGetAllRooms(){
    return prisma.room.findMany()
}

export async function repNewRoom(data: {name: string, description: string}){
    return prisma.room.create({data})
}

export async function repGetRoomByName(name: string){
    return prisma.room.findUnique({where: {name}})
}

export async function repGetRoomById(id: string){
    return prisma.room.findUnique({where: {id}})
}

export async function repUpdateRoomInfo(id: string, updatedData: {name: string, description: string}){
    return prisma.room.update({where: id, data: {updatedData}})
}

export async function repDeleteRoom(id: string){
    return prisma.room.delete({where: {id}})
}
