import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function repGetUserByEmail(email:string)
{
    return prisma.user.findUnique({where: {email} });
}

export function repCreateUser(data:any)
{
    return prisma.user.create( {data} );
}

export function repUpdateUser(id:string,data:any){
    return prisma.user.update({
        where:{ id },
        data
    });

}

export function repDeleteUser(id:string)
{
    return prisma.user.delete({
        where:{id}
    });
}
