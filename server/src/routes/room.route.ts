import express from 'express'
import * as roomController from '../controllers/room.controller'
import { authenticateToken } from 'src/middleware/auth.middleware'

const roomRouter = express.Router()

roomRouter.get('/', roomController.ctrlGetAllRooms)
roomRouter.get('/name/:name', roomController.ctrlGetRoomByName)
roomRouter.get('/id/:id', roomController.ctrlGetRoomById)
roomRouter.post('/', roomController.ctrlNewRoom)
roomRouter.patch('/:id', roomController.ctrlUpdateRoomInfo)
roomRouter.delete('/:id', roomController.ctrlDeleteRoom)

export default roomRouter