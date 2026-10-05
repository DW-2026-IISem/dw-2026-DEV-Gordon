import { Request, Response } from 'express';
import { BaseController } from '../../../shared/http/base-controller';
import {
  toCreateVersionEntregableDto,
  toPatchVersionEntregableDto,
  toUpdateVersionEntregableDto,
} from './dto';
import { VersionEntregablesService } from './version-entregables.service';

export class VersionEntregablesController extends BaseController {
  constructor(private readonly service: VersionEntregablesService = new VersionEntregablesService()) {
    super();
  }

  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ versiones: await this.service.getAll() });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ version: await this.service.getOne(this.paramId(req)) });
    });
  }

  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(201).json({ version: await this.service.create(toCreateVersionEntregableDto(req.body)) });
    });
  }

  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const version = await this.service.updatePut(this.paramId(req), toUpdateVersionEntregableDto(req.body));
      res.status(200).json({ version });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const version = await this.service.updatePatch(this.paramId(req), toPatchVersionEntregableDto(req.body));
      res.status(200).json({ version });
    });
  }

  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      await this.service.deletePhysical(this.paramId(req));
      res.status(200).json({ message: 'Versión de entregable eliminada' });
    });
  }

  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ version: await this.service.deleteLogical(this.paramId(req)) });
    });
  }
}
