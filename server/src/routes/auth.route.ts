import express from 'express';
import * as authController from '../controllers/auth.controller';  // Importando o controller de autenticação

const authRouter = express.Router();

// Rota de login
authRouter.post('/login', authController.ctrlLoginUser);

// Rota de cadastro
authRouter.post('/register', authController.ctrlNewUser);

export default authRouter;

// alterei para ter duas rotas uma de login e a outra de cadastro pois o login mexe apenas com email e senha
// e o cadastro pode envolver outras informações que não é legal cruzar, no caso da nossa api são a mesma coisa
//mas pelo fato do login agora gerar um jwt achei melhor separar

