import { Request, Response } from 'express';
import { BaseController } from '../../../shared/http/base-controller';
import { toCreateResourceDto, toPatchResourceDto, toUpdateResourceDto } from './dto';
import { ResourcesService } from './resources.service';

export class ResourcesController extends BaseController {
  constructor(private readonly service: ResourcesService = new ResourcesService()) {
    super();
  }

  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ recursos: await this.service.getAll() });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ recurso: await this.service.getOne(this.paramId(req)) });
    });
  }

  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(201).json({ recurso: await this.service.create(toCreateResourceDto(req.body)) });
    });
  }

  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ recurso: await this.service.updatePut(this.paramId(req), toUpdateResourceDto(req.body)) });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ recurso: await this.service.updatePatch(this.paramId(req), toPatchResourceDto(req.body)) });
    });
  }

  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const id = this.paramId(req);
      await this.service.deletePhysical(id);
      res.status(200).json({ message: 'Recurso eliminado', id });
    });
  }

  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ recurso: await this.service.deleteLogical(this.paramId(req)) });
    });
  }
}
