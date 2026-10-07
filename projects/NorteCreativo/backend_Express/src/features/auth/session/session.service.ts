import { getAccessTtlSeconds, getRefreshTtlDays, signAccessToken } from '../../../shared/auth/jwt';
import { hashPassword, verifyPassword } from '../../../shared/auth/password';
import { AppError } from '../../../shared/errors/app-error';
import { ResourceRolesRepository } from '../resource-roles/resource-roles.repository';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { RolesRepository } from '../roles/roles.repository';
import { UsersRepository } from '../users/users.repository';
import { LoginDto, LogoutSessionDto, PermissionDto, ProfileDto, RefreshSessionDto, SessionTokensDto } from './dto';

// Mismo mensaje para usuario inexistente, contraseña incorrecta y usuario inactivo: no se revela cuál fue.
const MSG_CREDENCIALES = 'Credenciales inválidas';
const IDENTIFIER_MAX = 255;
const PASSWORD_MAX = 1024;

// Hash descartable para gastar el mismo tiempo de bcrypt cuando el usuario no existe (evita distinguirlo por latencia).
let hashFicticio: Promise<string> | null = null;
const getHashFicticio = (): Promise<string> => (hashFicticio ??= hashPassword('contraseña-ficticia-para-igualar-tiempos'));

export class SessionService {
  constructor(
    private readonly users: UsersRepository = new UsersRepository(),
    private readonly roles: RolesRepository = new RolesRepository(),
    private readonly grants: ResourceRolesRepository = new ResourceRolesRepository(),
    private readonly refreshTokens: RefreshTokensService = new RefreshTokensService()
  ) {}

  private requerirTexto(valor: unknown, campo: string, max: number): string {
    if (typeof valor !== 'string' || valor.trim() === '' || valor.length > max) {
      throw new AppError(400, 'Error de validación', [`${campo} es requerido y debe ser un texto no vacío (máx. ${max} caracteres)`]);
    }
    return valor;
  }

  private armarTokens(user: { id: number; username: string }, emitido: { rawToken: string }): SessionTokensDto {
    return {
      access_token: signAccessToken(user),
      token_type: 'Bearer',
      expires_in: getAccessTtlSeconds(),
      refresh_token: emitido.rawToken,
      refresh_expires_in: getRefreshTtlDays() * 24 * 60 * 60,
    };
  }

  // identifier = username o email. Siempre se verifica una contraseña (la real o una ficticia) y todos los
  // fallos responden 401 con el mismo mensaje.
  public async login(body: LoginDto, deviceInfo: string | null): Promise<SessionTokensDto> {
    const identifier = this.requerirTexto(body.identifier, 'identifier', IDENTIFIER_MAX).trim().toLowerCase();
    const password = this.requerirTexto(body.password, 'password', PASSWORD_MAX);

    const user = await this.users.findByIdentifierWithPassword(identifier);
    const coincide = await verifyPassword(password, user ? user.password : await getHashFicticio());
    if (!user || !coincide || user.status !== 'active') throw new AppError(401, MSG_CREDENCIALES);

    const emitido = await this.refreshTokens.issue(user.id, deviceInfo);
    return this.armarTokens(user, emitido);
  }

  // Rotación: el refresh usado se invalida y se entrega un par nuevo. Un token ya rotado (reuso) revoca la familia.
  public async refresh(body: RefreshSessionDto, deviceInfo: string | null): Promise<SessionTokensDto> {
    const rawToken = this.requerirTexto(body.refresh_token, 'refresh_token', 512);

    const resultado = await this.refreshTokens.rotate(rawToken, deviceInfo);
    switch (resultado.kind) {
      case 'invalid':
        throw new AppError(401, 'Refresh token inválido');
      case 'expired':
        throw new AppError(401, 'Refresh token vencido');
      case 'reuse':
        throw new AppError(401, 'Refresh token ya usado: la sesión fue revocada');
    }

    // Revalida al usuario: si lo desactivaron, se corta la sesión que acaba de rotar.
    const user = await this.users.findById(resultado.userId);
    if (!user || user.status !== 'active') {
      await this.refreshTokens.revokeByToken(resultado.rawToken);
      throw new AppError(401, 'Usuario inexistente o inactivo');
    }
    return this.armarTokens(user, resultado);
  }

  // Idempotente: un token desconocido o ya revocado no es error.
  public async logout(body: LogoutSessionDto): Promise<void> {
    await this.refreshTokens.revokeByToken(this.requerirTexto(body.refresh_token, 'refresh_token', 512));
  }

  public async profile(userId: number): Promise<ProfileDto> {
    const user = await this.users.findById(userId);
    if (!user) throw new AppError(404, 'Usuario no encontrado');
    const roles = await this.roles.findActiveByUser(userId);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      roles: roles.map((r) => ({ id: r.id, name: r.name, description: r.description })),
    };
  }

  // Concesiones efectivas (cadena completa con status active), sin duplicados y con los roles que las otorgan.
  public async myPermissions(userId: number): Promise<PermissionDto[]> {
    const concedidos = await this.grants.findEffectiveForUser(userId);
    const porOperacion = new Map<string, PermissionDto>();
    for (const c of concedidos) {
      const clave = `${c.method} ${c.path}`;
      const existente = porOperacion.get(clave);
      if (existente) {
        if (!existente.roles.includes(c.role_name)) existente.roles.push(c.role_name);
      } else {
        porOperacion.set(clave, { method: c.method, path: c.path, roles: [c.role_name] });
      }
    }
    return [...porOperacion.values()].sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
  }
}
