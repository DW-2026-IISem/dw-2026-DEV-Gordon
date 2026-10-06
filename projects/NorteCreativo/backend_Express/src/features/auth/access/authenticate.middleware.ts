import { NextFunction, Request, Response } from 'express';
import '../../../shared/auth/auth-user'; // declara req.auth (ampliación global de Request)
import { extractBearerToken, verifyAccessToken } from '../../../shared/auth/jwt';
import { AppError } from '../../../shared/errors/app-error';
import { sendError } from '../../../shared/http/error-response';
import { UsersRepository } from '../users/users.repository';

const usersRepository = new UsersRepository();

// Modalidad JWT: ¿quién eres? 401 si falta el token, es inválido/vencido o el usuario ya no existe o está inactivo.
// Revalida el usuario en la BD en cada petición: desactivar un usuario corta su acceso al instante.
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) throw new AppError(401, 'Falta el token Bearer en la cabecera Authorization');

    const claims = verifyAccessToken(token);

    const user = await usersRepository.findById(claims.userId);
    if (!user || user.status !== 'active') throw new AppError(401, 'Usuario inexistente o inactivo');

    req.auth = { id: user.id, username: user.username, email: user.email, jti: claims.jti };
    next();
  } catch (error) {
    sendError(res, error);
  }
}
