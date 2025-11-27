import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as userController from '../controllers/user/user.controller';

const userRouter = express.Router();

userRouter.patch('/me', authenticateToken, userController.ctrlUpdateUserData);
userRouter.delete('/me', authenticateToken, userController.ctrlDeleteUser);

export default userRouter;
