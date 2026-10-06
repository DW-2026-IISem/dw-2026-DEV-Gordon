import { randomUUID } from 'crypto';
import { Transaction } from 'sequelize';
import { generateOpaqueToken, sha256Hex } from '../../../shared/auth/password';
import { getRefreshTtlDays } from '../../../shared/auth/jwt';
import { withTransaction } from '../../../shared/database/with-transaction';
import { AppError } from '../../../shared/errors/app-error';
import { RefreshTokenResponseDto, toRefreshTokenResponse } from './dto';
import { RefreshToken } from './refresh-token.model';
import { RefreshTokensRepository } from './refresh-tokens.repository';

export interface IssuedRefreshToken {
  // El token en claro se entrega UNA sola vez; en la base solo queda su SHA-256.
  rawToken: string;
  familyId: string;
  sessionId: number;
  expiresAt: Date;
}

export type RotateResult =
  | { kind: 'invalid' }
  | { kind: 'expired' }
  | { kind: 'reuse'; familyId: string; revoked: number }
  | ({ kind: 'rotated'; userId: number } & IssuedRefreshToken);

export class RefreshTokensService {
  constructor(private readonly repository: RefreshTokensRepository = new RefreshTokensRepository()) {}

  private async emit(userId: number, familyId: string, deviceInfo: string | null, transaction?: Transaction): Promise<IssuedRefreshToken> {
    const rawToken = generateOpaqueToken();
    const expiresAt = new Date(Date.now() + getRefreshTtlDays() * 24 * 60 * 60 * 1000);
    const sesion = await this.repository.create(
      { user_id: userId, family_id: familyId, token_hash: sha256Hex(rawToken), expires_at: expiresAt, device_info: deviceInfo, status: 'active' },
      transaction
    );
    return { rawToken, familyId, sessionId: sesion.id, expiresAt };
  }

  // Emite una sesión nueva (familia nueva). Lo usará el login (ISS-20).
  public issue(userId: number, deviceInfo: string | null = null, transaction?: Transaction): Promise<IssuedRefreshToken> {
    return this.emit(userId, randomUUID(), deviceInfo, transaction);
  }

  // Rotación: el token presentado se invalida y nace uno nuevo de la MISMA familia. Todo en una transacción con
  // lock pesimista sobre la fila. Devuelve el resultado (no lanza) para que la revocación por reuso se confirme.
  //  - no existe                  -> invalid
  //  - existe pero NO está activo -> REUSO: se revoca la familia completa
  //  - vencido                    -> se marca inactivo y devuelve expired
  public rotate(rawToken: string, deviceInfo: string | null = null): Promise<RotateResult> {
    return withTransaction(async (t) => {
      const token = await this.repository.findByHash(sha256Hex(rawToken), t, true);
      if (!token) return { kind: 'invalid' };

      if (token.status !== 'active') {
        const revoked = await this.repository.revokeFamily(token.family_id, t);
        return { kind: 'reuse', familyId: token.family_id, revoked };
      }

      await this.repository.update(token, { status: 'inactive', revoked_at: new Date() }, t);
      if (token.expires_at.getTime() <= Date.now()) return { kind: 'expired' };

      const nuevo = await this.emit(token.user_id, token.family_id, deviceInfo ?? token.device_info, t);
      return { kind: 'rotated', userId: token.user_id, ...nuevo };
    });
  }

  // Cierre de sesión por token (logout, ISS-20). Idempotente: un token desconocido no es error.
  public async revokeByToken(rawToken: string): Promise<void> {
    const token = await this.repository.findByHash(sha256Hex(rawToken));
    if (token && token.status === 'active') await this.repository.update(token, { status: 'inactive', revoked_at: new Date() });
  }

  // --- Sesiones propias: SIEMPRE filtradas por el usuario autenticado ---

  // Una sesión ajena es indistinguible de una inexistente: 404 (no se filtra su existencia).
  private async findMineOrFail(userId: number, id: number): Promise<RefreshToken> {
    const sesion = await this.repository.findByIdAndUser(id, userId);
    if (!sesion) throw new AppError(404, 'Sesión no encontrada');
    return sesion;
  }

  public async getAllMine(userId: number): Promise<RefreshTokenResponseDto[]> {
    return (await this.repository.findAllActiveByUser(userId)).map(toRefreshTokenResponse);
  }

  public async getMine(userId: number, id: number): Promise<RefreshTokenResponseDto> {
    return toRefreshTokenResponse(await this.findMineOrFail(userId, id));
  }

  public async revokeMine(userId: number, id: number): Promise<RefreshTokenResponseDto> {
    const sesion = await this.findMineOrFail(userId, id);
    if (sesion.status === 'inactive') throw new AppError(409, 'La sesión ya está revocada');
    await this.repository.update(sesion, { status: 'inactive', revoked_at: new Date() });
    return toRefreshTokenResponse(sesion);
  }

  public revokeAllMine(userId: number): Promise<number> {
    return this.repository.revokeAllByUser(userId);
  }

  public purgeMine(userId: number): Promise<number> {
    return this.repository.purgeInactiveByUser(userId);
  }

  public countActiveMine(userId: number): Promise<number> {
    return this.repository.countActiveByUser(userId);
  }
}
