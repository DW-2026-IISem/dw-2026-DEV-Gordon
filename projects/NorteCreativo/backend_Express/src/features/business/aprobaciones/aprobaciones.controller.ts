import { Request, Response } from 'express';
import { BaseController } from '../../../shared/http/base-controller';
import { AprobacionesService } from './aprobaciones.service';
import { toCreateAprobacionDto } from './dto';

export class AprobacionesController extends BaseController {
  constructor(private readonly service: AprobacionesService = new AprobacionesService()) {
    super();
  }

  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ aprobaciones: await this.service.getAll() });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ aprobacion: await this.service.getOne(this.paramId(req)) });
    });
  }

  // CerrarHito: la transacción vive en el service.
  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(201).json(await this.service.create(toCreateAprobacionDto(req.body)));
    });
  }
}
