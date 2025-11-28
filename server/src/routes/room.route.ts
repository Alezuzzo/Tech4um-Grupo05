import express from 'express'
import { authenticateToken } from 'src/middleware/auth.middleware'
import * as roomController from '../controllers/room/room.controller'

const roomRouter = express.Router()

roomRouter.get('/', roomController.ctrlGetAllRooms)
roomRouter.get('/:id', roomController.ctrlGetRoomById)
roomRouter.post('/', authenticateToken, roomController.ctrlNewRoom)
roomRouter.patch('/join/:id', authenticateToken, roomController.ctrlJoinRoom)
roomRouter.patch('/leave/:id', authenticateToken, roomController.ctrlLeaveRoom)
roomRouter.patch('/:id', authenticateToken, roomController.ctrlUpdateRoomInfo)
roomRouter.delete('/id', authenticateToken, roomController.ctrlDeleteRoom)

export default roomRouter