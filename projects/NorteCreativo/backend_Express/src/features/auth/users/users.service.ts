import { AppError } from '../../../shared/errors/app-error';
import { CreateUserDto, PatchUserDto, UpdateUserDto, UserResponseDto, toUserResponse } from './dto';
import { User } from './user.model';
import { UsersRepository } from './users.repository';

const PASSWORD_MIN = 8;
// bcrypt solo procesa los primeros 72 bytes: se rechaza lo que excede para no truncar en silencio.
const PASSWORD_MAX_BYTES = 72;

export class UsersService {
  constructor(private readonly repository: UsersRepository = new UsersRepository()) {}

  private async findOrFail(id: number): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) throw new AppError(404, 'Usuario no encontrado');
    return user;
  }

  // username y email se comparan y guardan en minúsculas y sin espacios en los bordes.
  private normalizar(valor: unknown): unknown {
    return typeof valor === 'string' ? valor.trim().toLowerCase() : valor;
  }

  // username o email repetidos -> 409 (si no son strings lo valida el modelo -> 400).
  private async assertUnique(username: unknown, email: unknown, excludeId?: number): Promise<void> {
    const u = typeof username === 'string' ? username : undefined;
    const e = typeof email === 'string' ? email : undefined;
    const conflictos = await this.repository.findConflicts(u, e, excludeId);
    if (conflictos.some((c) => c.username === u)) throw new AppError(409, 'El username ya está en uso');
    if (conflictos.some((c) => c.email === e)) throw new AppError(409, 'El email ya está en uso');
  }

  private validarPassword(password: unknown): void {
    if (typeof password !== 'string' || password.length < PASSWORD_MIN || Buffer.byteLength(password) > PASSWORD_MAX_BYTES) {
      throw new AppError(400, 'Error de validación', [
        `password es requerido y debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX_BYTES} caracteres`,
      ]);
    }
  }

  public async getAll(): Promise<UserResponseDto[]> {
    return (await this.repository.findAllActive()).map(toUserResponse);
  }

  // Solo los usuarios activos son visibles.
  public async getOne(id: number): Promise<UserResponseDto> {
    const user = await this.findOrFail(id);
    if (user.status !== 'active') throw new AppError(404, 'Usuario no encontrado');
    return toUserResponse(user);
  }

  // Un usuario creado por la API nace activo salvo que se indique lo contrario.
  public async create(body: CreateUserDto): Promise<UserResponseDto> {
    this.validarPassword(body.password);
    const username = this.normalizar(body.username);
    const email = this.normalizar(body.email);
    await this.assertUnique(username, email);
    const user = await this.repository.create({
      username: username as string,
      email: email as string,
      password: body.password,
      status: body.status ?? 'active',
    });
    return toUserResponse(user);
  }

  // PUT reemplaza la identidad completa: username y email son obligatorios. No toca password ni status.
  public async updatePut(id: number, body: Partial<UpdateUserDto>): Promise<UserResponseDto> {
    const user = await this.findOrFail(id);
    const faltantes = (['username', 'email'] as const).filter((c) => body[c] === undefined);
    if (faltantes.length > 0) {
      throw new AppError(400, 'Error de validación', faltantes.map((c) => `${c} es requerido en PUT`));
    }
    const username = this.normalizar(body.username);
    const email = this.normalizar(body.email);
    await this.assertUnique(username, email, user.id);
    await this.repository.update(user, { username: username as string, email: email as string });
    return toUserResponse(user);
  }

  // PATCH solo modifica los campos enviados.
  public async updatePatch(id: number, body: PatchUserDto): Promise<UserResponseDto> {
    const user = await this.findOrFail(id);
    const data: PatchUserDto = {};
    if (body.username !== undefined) data.username = this.normalizar(body.username) as string;
    if (body.email !== undefined) data.email = this.normalizar(body.email) as string;
    await this.assertUnique(data.username, data.email, user.id);
    await this.repository.update(user, data);
    return toUserResponse(user);
  }

  public async deletePhysical(id: number): Promise<void> {
    await this.repository.delete(await this.findOrFail(id));
  }

  public async deleteLogical(id: number): Promise<UserResponseDto> {
    const user = await this.findOrFail(id);
    await this.repository.update(user, { status: 'inactive' });
    return toUserResponse(user);
  }
}
