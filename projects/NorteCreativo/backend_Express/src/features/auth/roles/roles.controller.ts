import { Request, Response } from 'express';
import { BaseController } from '../../../shared/http/base-controller';
import { toCreateRoleDto, toPatchRoleDto, toUpdateRoleDto } from './dto';
import { RolesService } from './roles.service';

export class RolesController extends BaseController {
  constructor(private readonly service: RolesService = new RolesService()) {
    super();
  }

  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ roles: await this.service.getAll() });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ rol: await this.service.getOne(this.paramId(req)) });
    });
  }

  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(201).json({ rol: await this.service.create(toCreateRoleDto(req.body)) });
    });
  }

  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ rol: await this.service.updatePut(this.paramId(req), toUpdateRoleDto(req.body)) });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ rol: await this.service.updatePatch(this.paramId(req), toPatchRoleDto(req.body)) });
    });
  }

  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const id = this.paramId(req);
      await this.service.deletePhysical(id);
      res.status(200).json({ message: 'Rol eliminado', id });
    });
  }

  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ rol: await this.service.deleteLogical(this.paramId(req)) });
    });
  }
}
