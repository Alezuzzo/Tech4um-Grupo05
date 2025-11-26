import { PrismaClient } from '../generated/prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()


async function main(){
    console.log("Seed attempting...")
    const senha1 = await argon2.hash("hunter1")
    const senha2 = await argon2.hash("hunter2")
    const sampleUser1 = await prisma.user.create({data:{nickname:"Eduardo", email:"edu1010@email.com", password: senha1, admin:true}})
    const sampleUser2 = await prisma.user.create({data:{nickname:"Monica", email:"lilmonix3@email.com", password:senha2}})
}

main().catch((e) => {console.error('Seeding error:', e) 
    process.exit(1)})
    .finally(()=> {prisma.$disconnect()
    console.log("Sucess.")})
