import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import authRouter from './routes/auth.route';
import userRouter from './routes/user.route';

const app = express();
app.use(morgan('tiny'));
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rotas para autenticação
app.use('/auth', authRouter);  

// Rotas para usuário autenticado
app.use('/users', userRouter); 

export default app;
