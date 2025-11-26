import { Request, Response, NextFunction } from 'express';
import * as userRepo from '../repositories/user.repository'

export async function ctrlGetAllUsers(req: Request, res: Response, next: NextFunction){
    const allUsers = await userRepo.repGetAllUsers()
    res.json(allUsers)
}

export async function ctrlGetUser(req: Request, res: Response, next: NextFunction){
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
    const userEmail = req.params.email
    const {nickname, password} = req.body
    await userRepo.repUpdateUserData(userEmail, {nickname, password})
    res.sendStatus(201)
}

export async function ctrlDeleteUser(req: Request, res: Response, next: NextFunction){
    const userEmail = req.params.email
    await userRepo.repDeleteUser(userEmail)
    res.sendStatus(204)
}