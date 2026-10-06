import { Request, Response } from 'express';
import { BaseController } from '../../../shared/http/base-controller';
import { toCreateResourceRoleDto, toListResourceRolesDto } from './dto';
import { ResourceRolesService } from './resource-roles.service';

export class ResourceRolesController extends BaseController {
  constructor(private readonly service: ResourceRolesService = new ResourceRolesService()) {
    super();
  }

  // Filtros opcionales: ?role_id= y ?resource_id=
  public async getAll(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ concesiones: await this.service.getAll(toListResourceRolesDto(req.query)) });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ concesion: await this.service.getOne(this.paramId(req)) });
    });
  }

  // 201 si se crea; 200 si reactiva una concesión inactiva; 409 si ya estaba activa.
  public async grant(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const { concesion, created } = await this.service.grant(toCreateResourceRoleDto(req.body));
      res.status(created ? 201 : 200).json({ concesion });
    });
  }

  public async deactivate(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ concesion: await this.service.deactivate(this.paramId(req)) });
    });
  }

  public async reactivate(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ concesion: await this.service.reactivate(this.paramId(req)) });
    });
  }
}
