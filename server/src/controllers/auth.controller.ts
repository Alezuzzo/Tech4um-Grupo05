import { Request, Response, NextFunction } from 'express';
import * as authRepo from '../repositories/auth.repository'
import * as userRepo from '../repositories/user.repository'
import jwt from 'jsonwebtoken'
import argon2 from 'argon2'

export async function ctrlAuthentication(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    try {
        const loggingUser = await userRepo.repGetUserByEmail(email)
        if (!loggingUser) {
            return res.status(401).json({ message: 'Usuário não encontrado' });
        }
        const validAuth = await argon2.verify(loggingUser!.password, password)
        if (!validAuth) {
            return res.status(401).json({ message: 'Senha inválida' });
        }
        const token = jwt.sign({ email: loggingUser!.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' }) //verificar a seguranca disso
        res.status(200).send(token)
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' }); // tratamento de erros não esperados
    }
}

export function ctrlLoginUser(arg0: string, ctrlLoginUser: any) {
    throw new Error('Function not implemented.');
}
export function ctrlNewUser(arg0: string, ctrlNewUser: any) {
    throw new Error('Function not implemented.');
}

