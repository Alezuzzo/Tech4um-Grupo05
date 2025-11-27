import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import userRouter from './routes/user.route';
import authRouter from './routes/auth.route';
import { authenticateToken } from './middleware/auth.middleware';

const app = express();
 
app.use(morgan('tiny'));

// Habilitar CORS
app.use(cors());

app.use(helmet());

app.use(express.json());

// Rotas para autenticação
app.use('/api/auth', authRouter);  

// Rotas para usuários
app.use('/api/users', userRouter); 

app.use('/mwtest', authenticateToken);
app.get('/mwtest', (req: Request, res: Response) => {
  res.send('Hello World!');
});

export default app;
