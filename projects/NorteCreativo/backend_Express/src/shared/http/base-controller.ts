import { Request, Response } from 'express';
import { AppError } from '../errors/app-error';

export abstract class BaseController {
  protected async run(res: Response, work: () => Promise<void>): Promise<void> {
    try {
      await work();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  protected paramId(req: Request): number {
    const value = req.params.id;
    if (typeof value !== 'string' || !/^\d+$/.test(value) || Number(value) < 1) {
      throw new AppError(400, 'El id debe ser un entero positivo');
    }
    return Number(value);
  }

  protected handleError(res: Response, error: unknown): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json(error.errors ? { message: error.message, errors: error.errors } : { message: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
