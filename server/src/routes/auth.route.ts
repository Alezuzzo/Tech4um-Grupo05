import express from 'express'
import * as authController from '../controllers/auth.controller'

const authRouter = express.Router()

authRouter.post('/', authController.ctrlAuthentication)

export default authRouter