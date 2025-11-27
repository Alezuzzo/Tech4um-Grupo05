import { Request, Response } from 'express';
import * as userRepo from '../../repositories/user.repository';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

export async function registerController(req: Request, res: Response) {
    const { nickname, email, password } = req.body;
    //pega os campos e cria um usuário

    if (!nickname || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });//verifica se os campos foram preechidos
    }

    try {
        //verifica se já existe usuário com o email digitado
        const existing = await userRepo.repGetUserByEmail(email);

        if (existing) {
            return res.status(409).json({ message: 'Email já cadastrado.' });//se já existe ele barra
        }

        const hashedPassword = await argon2.hash(password);//criptografa a senha antes de salvar

        const newUser = await userRepo.repCreateUser({//cria o usuário no banco
            username: nickname,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({/*como o front espera receber o token tanto de login quanto do cadastro, precisamos passar ele aqui também, pois antes ele estava dando como erro ao processar a requisição pois o token só vinha no login. como já tinhamos que receber o token no cadastro, coloquei pra já logar direto após fazer o cadastro */
            message: 'Usuário criado com sucesso!',
            user: newUser,
            token: jwt.sign(
                { id: newUser.id, email: newUser.email },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '8h' }
            )
        });

    } catch (err) {//qualquer erro inesperado cai aqui
        console.error(err);

        return res.status(500).json({ message: 'Erro ao criar usuário.' });
    }
}
