import { Request, Response } from 'express';
import { BaseController } from '../../../shared/http/base-controller';
import { toCreateHitoDto, toPatchHitoDto, toUpdateHitoDto } from './dto';
import { HitosService } from './hitos.service';

export class HitosController extends BaseController {
  constructor(private readonly service: HitosService = new HitosService()) {
    super();
  }

  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ hitos: await this.service.getAll() });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ hito: await this.service.getOne(this.paramId(req)) });
    });
  }

  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(201).json({ hito: await this.service.create(toCreateHitoDto(req.body)) });
    });
  }

  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ hito: await this.service.updatePut(this.paramId(req), toUpdateHitoDto(req.body)) });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ hito: await this.service.updatePatch(this.paramId(req), toPatchHitoDto(req.body)) });
    });
  }

  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      await this.service.deletePhysical(this.paramId(req));
      res.status(200).json({ message: 'Hito eliminado' });
    });
  }

  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ hito: await this.service.deleteLogical(this.paramId(req)) });
    });
  }
}
