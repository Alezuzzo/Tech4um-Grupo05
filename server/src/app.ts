import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import userRouter from './routes/user.route';
import authRouter from './routes/auth.route';
import { authenticateToken } from './middleware/auth.middleware';

const app = express();
 
app.use(morgan('tiny'));
 
app.use(cors());
 
app.use(helmet());
 
app.use(express.json());
 
app.use('/users/', userRouter)
app.use('/login/', authRouter)
app.use('/mwtest/', authenticateToken)
app.get('/mwtest/', (req, res) => {
  res.send('Hello World!')
})
export default app;