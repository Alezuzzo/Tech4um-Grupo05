import express from 'express';
import { loginController } from 'src/controllers/auth/login.controller';
import { registerController } from 'src/controllers/auth/register.controller';

const authRouter = express.Router();

// Rota de login
authRouter.post('/login', loginController);

// Rota de cadastro
authRouter.post('/register',registerController);
export default authRouter;

// alterei para ter duas rotas uma de login e a outra de cadastro pois o login mexe apenas com email e senha
// e o cadastro pode envolver outras informações que não é legal cruzar, no caso da nossa api são a mesma coisa
//mas pelo fato do login agora gerar um jwt achei melhor separar

