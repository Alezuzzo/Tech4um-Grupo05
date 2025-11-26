import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
        }
        console.log(decoded) //temporario, editar posteriormente para checar privilegios de admin
        next()
    }) //verificar a seguranca disso
}
