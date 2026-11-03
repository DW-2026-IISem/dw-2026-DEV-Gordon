import { Request, Response } from 'express';
import { BaseController } from '../../../shared/http/base-controller';
import { toCreatePresupuestoDto, toPatchPresupuestoDto, toUpdatePresupuestoDto } from './dto';
import { PresupuestosService } from './presupuestos.service';

export class PresupuestosController extends BaseController {
  constructor(private readonly service: PresupuestosService = new PresupuestosService()) {
    super();
  }

  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ presupuestos: await this.service.getAll() });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ presupuesto: await this.service.getOne(this.paramId(req)) });
    });
  }

  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(201).json({ presupuesto: await this.service.create(toCreatePresupuestoDto(req.body)) });
    });
  }

  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ presupuesto: await this.service.updatePut(this.paramId(req), toUpdatePresupuestoDto(req.body)) });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ presupuesto: await this.service.updatePatch(this.paramId(req), toPatchPresupuestoDto(req.body)) });
    });
  }

  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      await this.service.deletePhysical(this.paramId(req));
      res.status(200).json({ message: 'Presupuesto eliminado' });
    });
  }

  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ presupuesto: await this.service.deleteLogical(this.paramId(req)) });
    });
  }
}
