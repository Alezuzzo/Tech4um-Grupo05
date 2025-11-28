import express from 'express'
import { authenticateToken } from 'src/middleware/auth.middleware'
import * as messageController from '../controllers/message/message.controller'

const messageRouter = express.Router()

messageRouter.get('/room/:id', authenticateToken, messageController.ctrlGetAllMessagesFromRoom)
messageRouter.get('/user/:id', authenticateToken, messageController.ctrlGetAllPrivateMessages)
messageRouter.post('/', authenticateToken, messageController.ctrlSendMessage)
messageRouter.patch('/', authenticateToken, messageController.ctrlEditMessage)
messageRouter.delete('/', authenticateToken, messageController.ctrlRemoveMessage)

//considerar se a maneira escolhida de enviar as informações necessárias nas rotas e nos controllers é a melhor possível

export default messageRouter