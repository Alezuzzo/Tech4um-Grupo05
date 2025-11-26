import { Request, Response, NextFunction } from 'express';
import * as authRepo from '../repositories/auth.repository'
import * as userRepo from '../repositories/user.repository'
import jwt from 'jsonwebtoken'
import argon2 from 'argon2'

export async function ctrlAuthentication (req: Request, res: Response, next: NextFunction){
    const {email, password} = req.body
    if (!email || !password){
        res.sendStatus(400)
    }
    const loggingUser = await userRepo.repGetUserByEmail(email)
    if (!loggingUser){
        res.sendStatus(401)
    }
    const validAuth = await argon2.verify(loggingUser!.password, password)
    if (!validAuth){
        res.sendStatus(401)
    } 
    const token = jwt.sign({email: loggingUser!.email}, process.env.JWT_SECRET || 'secret', {expiresIn: '8h'}) //verificar a seguranca disso
    res.status(200).send(token)
}