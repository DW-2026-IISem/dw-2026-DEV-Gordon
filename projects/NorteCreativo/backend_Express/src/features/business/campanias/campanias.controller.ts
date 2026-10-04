import { Request, Response } from 'express';
import { BaseController } from '../../../shared/http/base-controller';
import { toCreateCampaniaDto, toPatchCampaniaDto, toUpdateCampaniaDto } from './dto';
import { CampaniasService } from './campanias.service';

export class CampaniasController extends BaseController {
  constructor(private readonly service: CampaniasService = new CampaniasService()) {
    super();
  }

  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ campanias: await this.service.getAll() });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ campania: await this.service.getOne(this.paramId(req)) });
    });
  }

  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(201).json({ campania: await this.service.create(toCreateCampaniaDto(req.body)) });
    });
  }

  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ campania: await this.service.updatePut(this.paramId(req), toUpdateCampaniaDto(req.body)) });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ campania: await this.service.updatePatch(this.paramId(req), toPatchCampaniaDto(req.body)) });
    });
  }

  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      await this.service.deletePhysical(this.paramId(req));
      res.status(200).json({ message: 'Campaña eliminada' });
    });
  }

  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ campania: await this.service.deleteLogical(this.paramId(req)) });
    });
  }
}
