import { Response } from 'express';
import { AppError } from '../errors/app-error';

// Punto único de traducción error -> HTTP: AppError responde con su statusCode; todo lo demás es 500.
// Lo usan BaseController (controllers) y los middlewares de acceso.
export function sendError(res: Response, error: unknown): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json(error.errors ? { message: error.message, errors: error.errors } : { message: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ message: 'Error interno del servidor' });
}
