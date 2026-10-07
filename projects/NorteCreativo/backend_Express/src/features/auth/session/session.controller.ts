import { Request, Response } from 'express';
import { requireAuthUser } from '../../../shared/auth/auth-user';
import { BaseController } from '../../../shared/http/base-controller';
import { toLoginDto, toLogoutSessionDto, toRefreshSessionDto } from './dto';
import { SessionService } from './session.service';

// User-Agent como información del dispositivo (la columna device_info admite 255 caracteres).
const deviceInfo = (req: Request): string | null => {
  const agente = req.headers['user-agent'];
  return typeof agente === 'string' && agente.trim() !== '' ? agente.slice(0, 255) : null;
};

export class SessionController extends BaseController {
  constructor(private readonly service: SessionService = new SessionService()) {
    super();
  }

  public async login(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json(await this.service.login(toLoginDto(req.body), deviceInfo(req)));
    });
  }

  public async refresh(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json(await this.service.refresh(toRefreshSessionDto(req.body), deviceInfo(req)));
    });
  }

  public async logout(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      await this.service.logout(toLogoutSessionDto(req.body));
      res.status(200).json({ message: 'Sesión cerrada' });
    });
  }

  public async profile(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      res.status(200).json({ usuario: await this.service.profile(requireAuthUser(req).id) });
    });
  }

  public async myPermissions(req: Request, res: Response): Promise<void> {
    await this.run(res, async () => {
      const permisos = await this.service.myPermissions(requireAuthUser(req).id);
      res.status(200).json({ total: permisos.length, permisos });
    });
  }
}
