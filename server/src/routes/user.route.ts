import express from 'express'
import * as userController from '../controllers/user.controller'

const userRouter = express.Router()

userRouter.get('/', userController.ctrlGetAllUsers)
userRouter.get('/:email', userController.ctrlGetUser)
userRouter.post('/', userController.ctrlNewUser)
userRouter.patch('/:email', userController.ctrlUpdateUserData)
userRouter.delete('/:email', userController.ctrlDeleteUser)

export default userRouter