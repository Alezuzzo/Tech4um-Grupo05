import express from 'express'
import * as userController from '../controllers/user.controller'
import { authenticateToken } from 'src/middleware/auth.middleware'

const userRouter = express.Router()

userRouter.get('/', userController.ctrlGetAllUsers)
userRouter.get('/email/:email', userController.ctrlGetUserByEmail)
userRouter.get('/id/:id', userController.ctrlGetUserByEmail)
userRouter.post('/', userController.ctrlNewUser)
userRouter.patch('/:id', userController.ctrlUpdateUserData)
userRouter.patch('/admin/:id', authenticateToken)
userRouter.patch('/admin/:id', userController.ctrlChangeAdminStatus)
userRouter.delete('/:id', userController.ctrlDeleteUser)

export default userRouter