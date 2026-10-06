import { AppError } from '../../../shared/errors/app-error';
import { RolesRepository } from '../roles/roles.repository';
import { UsersRepository } from '../users/users.repository';
import { CreateRoleUserDto, RoleUserResponseDto, toRoleUserResponse } from './dto';
import { RoleUser } from './role-user.model';
import { RoleUsersRepository } from './role-users.repository';

const entero = (valor: unknown): number | null => {
  const n = Number(valor);
  return valor !== undefined && valor !== null && valor !== '' && Number.isInteger(n) && n > 0 ? n : null;
};

export interface AssignResult {
  asignacion: RoleUserResponseDto;
  created: boolean;
}

export class RoleUsersService {
  constructor(
    private readonly repository: RoleUsersRepository = new RoleUsersRepository(),
    private readonly users: UsersRepository = new UsersRepository(),
    private readonly roles: RolesRepository = new RolesRepository()
  ) {}

  private async findOrFail(id: number): Promise<RoleUser> {
    const roleUser = await this.repository.findById(id);
    if (!roleUser) throw new AppError(404, 'Asignación no encontrada');
    return roleUser;
  }

  // Solo se asigna a usuarios y roles existentes y activos.
  private async validarUsuarioYRol(userId: number, roleId: number): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user || user.status !== 'active') throw new AppError(404, 'Usuario no encontrado o inactivo');
    const role = await this.roles.findById(roleId);
    if (!role || role.status !== 'active') throw new AppError(404, 'Rol no encontrado o inactivo');
  }

  public async getAll(): Promise<RoleUserResponseDto[]> {
    return (await this.repository.findAllActive()).map(toRoleUserResponse);
  }

  public async getOne(id: number): Promise<RoleUserResponseDto> {
    return toRoleUserResponse(await this.findOrFail(id));
  }

  // Upsert idempotente: no existe -> crea activa; existe inactiva -> la reactiva (sin duplicar); existe activa -> 409.
  public async assign(body: CreateRoleUserDto): Promise<AssignResult> {
    const userId = entero(body.user_id);
    const roleId = entero(body.role_id);
    const errores: string[] = [];
    if (userId === null) errores.push('user_id es requerido y debe ser un entero positivo');
    if (roleId === null) errores.push('role_id es requerido y debe ser un entero positivo');
    if (errores.length > 0) throw new AppError(400, 'Error de validación', errores);

    await this.validarUsuarioYRol(userId!, roleId!);

    const existente = await this.repository.findByUserAndRole(userId!, roleId!);
    if (!existente) {
      const creada = await this.repository.create({ user_id: userId!, role_id: roleId!, status: 'active' });
      return { asignacion: toRoleUserResponse((await this.repository.findById(creada.id)) as RoleUser), created: true };
    }
    if (existente.status === 'active') throw new AppError(409, 'La asignación ya existe y está activa');
    await this.repository.update(existente, { status: 'active' });
    return { asignacion: toRoleUserResponse(existente), created: false };
  }

  // Retirar = borrado lógico: la fila se conserva para poder reactivarla.
  public async deactivate(id: number): Promise<RoleUserResponseDto> {
    const roleUser = await this.findOrFail(id);
    if (roleUser.status === 'inactive') throw new AppError(409, 'La asignación ya está inactiva');
    await this.repository.update(roleUser, { status: 'inactive' });
    return toRoleUserResponse(roleUser);
  }

  public async reactivate(id: number): Promise<RoleUserResponseDto> {
    const roleUser = await this.findOrFail(id);
    if (roleUser.status === 'active') throw new AppError(409, 'La asignación ya está activa');
    await this.validarUsuarioYRol(roleUser.user_id, roleUser.role_id);
    await this.repository.update(roleUser, { status: 'active' });
    return toRoleUserResponse(roleUser);
  }
}
