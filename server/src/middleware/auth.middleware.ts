import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface AuthPayload extends JwtPayload {
    id: string;
    email: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}


export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];

  const token = authHeader?.split(' ')[1];//Espera o Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });//Se não tem token cai aqui
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) {
        return res.status(403).json({ message: "Token inválido" });
    }

    req.user = decoded as AuthPayload;
    next();
  });
}
