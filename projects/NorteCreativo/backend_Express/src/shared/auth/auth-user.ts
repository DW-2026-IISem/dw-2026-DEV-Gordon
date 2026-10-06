import { Request } from 'express';
import { AppError } from '../errors/app-error';

// Identidad resuelta por el middleware authenticate: se carga desde la BD (el token solo trae sub, username y jti).
export interface AuthUser {
  id: number;
  username: string;
  email: string;
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
