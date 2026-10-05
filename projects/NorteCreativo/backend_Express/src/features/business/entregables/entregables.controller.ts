import { Request, Response } from 'express';
import { BaseController } from '../../../shared/http/base-controller';
import { toCreateEntregableDto, toPatchEntregableDto, toUpdateEntregableDto } from './dto';
import { EntregablesService } from './entregables.service';

export class EntregablesController extends BaseController {
  constructor(private readonly service: EntregablesService = new EntregablesService()) {
    super();
  }

  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ entregables: await this.service.getAll() });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ entregable: await this.service.getOne(this.paramId(req)) });
    });
  }

  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(201).json({ entregable: await this.service.create(toCreateEntregableDto(req.body)) });
    });
  }

  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ entregable: await this.service.updatePut(this.paramId(req), toUpdateEntregableDto(req.body)) });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ entregable: await this.service.updatePatch(this.paramId(req), toPatchEntregableDto(req.body)) });
    });
  }

  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      await this.service.deletePhysical(this.paramId(req));
      res.status(200).json({ message: 'Entregable eliminado' });
    });
  }

  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ entregable: await this.service.deleteLogical(this.paramId(req)) });
    });
  }
}
