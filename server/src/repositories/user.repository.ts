import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'
const prisma = new PrismaClient()

export async function repGetAllUsers(){
    return prisma.user.findMany()
}

export async function repNewUser(data: {nickname: string, email: string, password: string}){
    const hashedPass = await argon2.hash(data.password)
    data.password = hashedPass
    return prisma.user.create({data})
}

export async function repGetUserById(id: string){
    return prisma.user.findUnique({where: {id}})
}

export async function repGetUserByEmail(email: string){
    return prisma.user.findUnique({where: {email}})
}

export async function repUpdateUserData(id: string, updatedData: {nickname: string, password: string}){
    return prisma.user.update({where: {id}, data: updatedData})
}

export async function repChangeAdminStatus(id: string, updatedData: {admin: boolean}){
    return prisma.user.update({where: {id}, data: updatedData})
}

export async function repDeleteUser(id: string){
    return prisma.user.delete({where: {id}})
}
