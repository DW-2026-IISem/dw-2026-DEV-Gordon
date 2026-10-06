import { Request, Response } from 'express';
import { AppError } from '../errors/app-error';
import { sendError } from './error-response';

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
    sendError(res, error);
  }
}
