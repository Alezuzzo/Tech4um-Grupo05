import { Request, Response, NextFunction } from 'express';
import * as userRepo from '../repositories/user.repository';
import argon2 from 'argon2';

export async function ctrlNewUser(req: Request, res: Response, next: NextFunction) {
  const { nickname, email, password } = req.body;

  try {
    // criptografando a senha antes de salvar no banco
    const hashedPassword = await argon2.hash(password); 
    //  o argon2.hash() criptografa a senha recebida no corpo da requisição

    // salva o novo usuario no banco com a senha criptografada
    await userRepo.repNewUser({ nickname, email, password: hashedPassword });

    res.sendStatus(201); // retorna 201 caso tiver cadastrado com sucesso
    
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar o usuário' });
    // se tiver algum erro retornamos 500 pra saber que é um erro do servidor
  }
}
export function ctrlGetAllUsers(arg0: string, ctrlGetAllUsers: any) {
    throw new Error('Function not implemented.');
}

export function ctrlUpdateUserData(arg0: string, ctrlUpdateUserData: any) {
    throw new Error('Function not implemented.');
}

export function ctrlDeleteUser(arg0: string, ctrlDeleteUser: any) {
    throw new Error('Function not implemented.');
}

