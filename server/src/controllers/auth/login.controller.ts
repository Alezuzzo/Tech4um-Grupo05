import { Request, Response, NextFunction } from 'express';
import * as userRepo from '../../repositories/user.repository';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';

export async function loginController(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body; //pega o email e a senha no json body da requisição
    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });//valida se os campos foram enviados
    }
    try {
        const user = await userRepo.repGetUserByEmail(email);//busca usuário pelo email

        if (!user) {
            return res.status(401).json({ message: 'Usuário não encontrado.' });// se não encontrou o usuário o email pode estar errado
        }

        const validPassword = await argon2.verify(user.password, password); // compara a senha enviada com o hash do banco

        if (!validPassword) {
            return res.status(401).json({ message: 'Senha incorreta.' });//senha incorreta
        }

        const token = jwt.sign(//gera o jwt com id e email do usuario
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '8h' }
        );

        return res.status(200).json({ token });//retorna o token no response

    } catch (err) {//pega erros inesperados
        console.error(err);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
}
