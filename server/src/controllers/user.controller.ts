import { Request, Response, NextFunction } from 'express';
import * as userRepo from '../repositories/user.repository'

export async function ctrlGetAllUsers(req: Request, res: Response, next: NextFunction){
    const allUsers = await userRepo.repGetAllUsers()
    res.json(allUsers)
}

export async function ctrlGetUserById(req: Request, res: Response, next: NextFunction){
    const userId = req.params.id
    const foundUser = await userRepo.repGetUserByEmail(userId)
    if (!foundUser){
        res.sendStatus(404)
    }
    res.json(foundUser)
}

export async function ctrlGetUserByEmail(req: Request, res: Response, next: NextFunction){
    const userEmail = req.params.email
    const foundUser = await userRepo.repGetUserByEmail(userEmail)
    if (!foundUser){
        res.sendStatus(404)
    }
    res.json(foundUser)
}

export async function ctrlNewUser(req: Request, res: Response, next: NextFunction){
    const {nickname, email, password} = req.body
    await userRepo.repNewUser({nickname, email, password})
    res.sendStatus(201)
}

export async function ctrlUpdateUserData(req: Request, res: Response, next: NextFunction){
    const userId = req.params.id
    const {nickname, password} = req.body
    await userRepo.repUpdateUserData(userId, {nickname, password})
    res.sendStatus(201)
}

export async function ctrlChangeAdminStatus(req: Request, res: Response, next: NextFunction){
    try{
        const checkedUser = await userRepo.repGetUserByEmail(req.payload?.id)//funciona?
        if (!checkedUser.admin){
            res.sendStatus(403)
        }
    } catch (e) {
        res.sendStatus(403)
    }
    const userId = req.params.id
    const {admin} = req.body
    await userRepo.repChangeAdminStatus(userId, {admin})
    res.sendStatus(201)
}

export async function ctrlDeleteUser(req: Request, res: Response, next: NextFunction){
    const userId = req.params.id
    await userRepo.repDeleteUser(userId)
    res.sendStatus(204)
}