import { Request, Response } from 'express';
import { requireAuthUser } from '../../../shared/auth/auth-user';
import { BaseController } from '../../../shared/http/base-controller';
import { RefreshTokensService } from './refresh-tokens.service';

// Sesiones del usuario AUTENTICADO: el id del usuario sale siempre del token (req.auth), nunca de la URL ni del body.
export class RefreshTokensController extends BaseController {
  constructor(private readonly service: RefreshTokensService = new RefreshTokensService()) {
    super();
  }

  public async getAll(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ sesiones: await this.service.getAllMine(requireAuthUser(req).id) });
    });
  }

  public async getOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ sesion: await this.service.getMine(requireAuthUser(req).id, this.paramId(req)) });
    });
  }

  public async revokeOne(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const sesion = await this.service.revokeMine(requireAuthUser(req).id, this.paramId(req));
      res.status(200).json({ message: 'Sesión revocada', sesion });
    });
  }

  public async revokeAll(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const revocadas = await this.service.revokeAllMine(requireAuthUser(req).id);
      res.status(200).json({ message: 'Sesiones revocadas', revocadas });
    });
  }

  public async purge(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const eliminadas = await this.service.purgeMine(requireAuthUser(req).id);
      res.status(200).json({ message: 'Sesiones revocadas o vencidas eliminadas', eliminadas });
    });
  }
}
