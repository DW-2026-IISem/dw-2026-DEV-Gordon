import { Request, Response } from 'express';
import { BaseController } from '../../../shared/http/base-controller';
import { toCreateClienteDto, toPatchClienteDto, toUpdateClienteDto } from './dto';
import { ClientesService } from './clientes.service';

export class ClientesController extends BaseController {
  constructor(private readonly service: ClientesService = new ClientesService()) {
    super();
  }

  public async getAll(_req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ clientes: await this.service.getAll() });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ cliente: await this.service.getOne(this.paramId(req)) });
    });
  }

  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(201).json({ cliente: await this.service.create(toCreateClienteDto(req.body)) });
    });
  }

  public async updatePut(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ cliente: await this.service.updatePut(this.paramId(req), toUpdateClienteDto(req.body)) });
    });
  }

  public async updatePatch(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ cliente: await this.service.updatePatch(this.paramId(req), toPatchClienteDto(req.body)) });
    });
  }

  public async deletePhysical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      await this.service.deletePhysical(this.paramId(req));
      res.status(200).json({ message: 'Cliente eliminado' });
    });
  }

  public async deleteLogical(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ cliente: await this.service.deleteLogical(this.paramId(req)) });
    });
  }
}
