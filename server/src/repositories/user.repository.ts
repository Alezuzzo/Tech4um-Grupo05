import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'
const prisma = new PrismaClient()

export async function repGetAllUsers(){
    return prisma.user.findMany()
}

export async function repNewUser(data: {nickname: string, email: string, password: string}){
    //adicionar algoritmo para hashar a senha
    return prisma.user.create({data})
}

export async function repGetUserByEmail(email: string){
    return prisma.user.findUnique({where: {email}})
}

export async function repUpdateUserData(email: string, updatedData: {nickname: string, password: string}){
    return prisma.user.update({where: {email}, data: updatedData})
}

export async function repDeleteUser(email: string){
    return prisma.user.delete({where: {email}})
}