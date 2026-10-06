import { NextFunction, Request, Response } from 'express';
import '../../../shared/auth/auth-user'; // declara req.auth (ampliación global de Request)
import { isOperationGranted, normalizePath } from '../../../shared/auth/resource-match';
import { AppError } from '../../../shared/errors/app-error';
import { sendError } from '../../../shared/http/error-response';
import { ResourceRolesRepository } from '../resource-roles/resource-roles.repository';

const resourceRolesRepository = new ResourceRolesRepository();

// Modalidad JWT + RBAC: ¿puede ejecutar este (method, path)? Va después de authenticate.
// Deny by default: sin una concesión activa -> 403. La matriz se consulta en CADA petición (sin caché):
// dar o retirar una concesión surte efecto en la siguiente petición, sin reiniciar el servidor.
export async function authorize(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth) throw new AppError(401, 'Autenticación requerida');

    // Express atiende HEAD con los handlers de GET: se autoriza como GET.
    const method = req.method.toUpperCase() === 'HEAD' ? 'GET' : req.method.toUpperCase();
    const path = normalizePath(req.originalUrl);

    const concedidos = await resourceRolesRepository.findEffectiveForUser(req.auth.id);
    if (!isOperationGranted(concedidos, method, path)) {
      throw new AppError(403, `No autorizado: sin concesión para ${method} ${path}`);
    }
    next();
  } catch (error) {
    sendError(res, error);
  }
}
