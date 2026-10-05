import { Request } from 'express';
import { AppError } from '../errors/app-error';

// Identidad resuelta por el middleware de autenticación (se construye en un issue posterior).
export interface AuthUser {
  id: number;
  username: string;
  jti: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

export const requireAuthUser = (req: Request): AuthUser => {
  if (!req.auth) throw new AppError(401, 'No autenticado');
  return req.auth;
};
