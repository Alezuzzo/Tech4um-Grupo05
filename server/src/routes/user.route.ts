import express from 'express';
import * as userController from '../controllers/user.controller';

const userRouter = express.Router();

userRouter.get('/', userController.ctrlGetAllUsers);           // listar todos os usuários
userRouter.get('/:email', userController.ctrlNewUser);        // buscar um usuário específico pelo email
userRouter.post('/', userController.ctrlNewUser);             // cadastro de novo usuário
userRouter.patch('/:email', userController.ctrlUpdateUserData); // atualizar dados de usuário
userRouter.delete('/:email', userController.ctrlDeleteUser);  // deletar usuário

export default userRouter;
