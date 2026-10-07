import { ErrorRequestHandler } from 'express';

// Se registra DESPUÉS de las rutas (aridad 4). Traduce los errores que Express genera antes de llegar a un controller
// (JSON mal formado, cuerpo demasiado grande...) a respuestas JSON SIN stack trace ni rutas del servidor.
export const bodyErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido' });
    return;
  }
  const status = typeof err?.status === 'number' ? err.status : undefined;
  if (status === 413) {
    res.status(413).json({ message: 'El cuerpo de la petición es demasiado grande' });
    return;
  }
  if (status !== undefined && status >= 400 && status < 500) {
    res.status(status).json({ message: 'Petición no válida' });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
};
