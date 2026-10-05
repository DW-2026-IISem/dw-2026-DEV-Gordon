import { Request, Response } from 'express';
import { BaseController } from '../../../shared/http/base-controller';
import { toCreateTareaDto, toPatchTareaDto, toUpdateTareaDto } from './dto';
import { TareasService } from './tareas.service';

export class TareasController extends BaseController {
  constructor(private readonly service: TareasService = new TareasService()) {
    super();
  }

  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ tareas: await this.service.getAll() });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ tarea: await this.service.getOne(this.paramId(req)) });
    });
  }

  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(201).json({ tarea: await this.service.create(toCreateTareaDto(req.body)) });
    });
  }

  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ tarea: await this.service.updatePut(this.paramId(req), toUpdateTareaDto(req.body)) });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ tarea: await this.service.updatePatch(this.paramId(req), toPatchTareaDto(req.body)) });
    });
  }

  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      await this.service.deletePhysical(this.paramId(req));
      res.status(200).json({ message: 'Tarea eliminada' });
    });
  }

  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ tarea: await this.service.deleteLogical(this.paramId(req)) });
    });
  }
}
