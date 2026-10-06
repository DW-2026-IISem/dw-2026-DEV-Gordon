import { Request, Response } from 'express';
import { BaseController } from '../../../shared/http/base-controller';
import { toCreateRoleUserDto } from './dto';
import { RoleUsersService } from './role-users.service';

export class RoleUsersController extends BaseController {
  constructor(private readonly service: RoleUsersService = new RoleUsersService()) {
    super();
  }

  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ asignaciones: await this.service.getAll() });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ asignacion: await this.service.getOne(this.paramId(req)) });
    });
  }

  // 201 si se crea; 200 si reactiva una asignación inactiva; 409 si ya estaba activa.
  public async assign(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const { asignacion, created } = await this.service.assign(toCreateRoleUserDto(req.body));
      res.status(created ? 201 : 200).json({ asignacion });
    });
  }

  public async deactivate(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ asignacion: await this.service.deactivate(this.paramId(req)) });
    });
  }

  public async reactivate(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ asignacion: await this.service.reactivate(this.paramId(req)) });
    });
  }
}
