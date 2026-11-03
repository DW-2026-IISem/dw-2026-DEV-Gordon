import { Request, Response } from 'express';
import { BaseController } from '../../../shared/http/base-controller';
import { toCreateFacturaDto } from './dto';
import { FacturasService } from './facturas.service';

export class FacturasController extends BaseController {
  constructor(private readonly service: FacturasService = new FacturasService()) {
    super();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ facturas: await this.service.getAll(req.query.campania_id) });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ factura: await this.service.getOne(this.paramId(req)) });
    });
  }

  // FacturarHitos: la transacción vive en el service.
  public async create(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(201).json(await this.service.create(toCreateFacturaDto(req.body)));
    });
  }
}
