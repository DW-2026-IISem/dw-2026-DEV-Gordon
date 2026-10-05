import { Request, Response } from 'express';
import { BaseController } from '../../../shared/http/base-controller';
import { toCreateUserDto, toPatchUserDto, toUpdateUserDto } from './dto';
import { UsersService } from './users.service';

export class UsersController extends BaseController {
  constructor(private readonly service: UsersService = new UsersService()) {
    super();
  }

  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ usuarios: await this.service.getAll() });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ usuario: await this.service.getOne(this.paramId(req)) });
    });
  }

  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(201).json({ usuario: await this.service.create(toCreateUserDto(req.body)) });
    });
  }

  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ usuario: await this.service.updatePut(this.paramId(req), toUpdateUserDto(req.body)) });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ usuario: await this.service.updatePatch(this.paramId(req), toPatchUserDto(req.body)) });
    });
  }

  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const id = this.paramId(req);
      await this.service.deletePhysical(id);
      res.status(200).json({ message: 'Usuario eliminado', id });
    });
  }

  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ usuario: await this.service.deleteLogical(this.paramId(req)) });
    });
  }
}
