import { AppError } from '../../../shared/errors/app-error';
import { CreateRoleDto, PatchRoleDto, RoleResponseDto, UpdateRoleDto, toRoleResponse } from './dto';
import { Role } from './role.model';
import { RolesRepository } from './roles.repository';

export class RolesService {
  constructor(private readonly repository: RolesRepository = new RolesRepository()) {}

  private async findOrFail(id: number): Promise<Role> {
    const role = await this.repository.findById(id);
    if (!role) throw new AppError(404, 'Rol no encontrado');
    return role;
  }

  // Los nombres de rol se guardan y comparan en mayúsculas y sin espacios en los bordes.
  private normalizarNombre(name: unknown): string {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new AppError(400, 'Error de validación', ['name es requerido y debe ser un texto no vacío']);
    }
    return name.trim().toUpperCase();
  }

  // Nombre repetido -> 409 (se excluye al propio rol al editar).
  private async assertNameAvailable(name: string, excludeId?: number): Promise<void> {
    const existente = await this.repository.findByName(name);
    if (existente && existente.id !== excludeId) throw new AppError(409, 'El nombre de rol ya está en uso');
  }

  public async getAll(): Promise<RoleResponseDto[]> {
    return (await this.repository.findAllActive()).map(toRoleResponse);
  }

  public async getOne(id: number): Promise<RoleResponseDto> {
    return toRoleResponse(await this.findOrFail(id));
  }

  // Un rol creado por la API nace activo salvo que se indique lo contrario.
  public async create(body: CreateRoleDto): Promise<RoleResponseDto> {
    const name = this.normalizarNombre(body.name);
    await this.assertNameAvailable(name);
    const role = await this.repository.create({
      name,
      description: body.description ?? null,
      status: body.status ?? 'active',
    });
    return toRoleResponse(role);
  }

  // PUT reemplaza: name es obligatorio; description omitida queda en null. No toca status.
  public async updatePut(id: number, body: Partial<UpdateRoleDto>): Promise<RoleResponseDto> {
    const role = await this.findOrFail(id);
    const name = this.normalizarNombre(body.name);
    await this.assertNameAvailable(name, role.id);
    await this.repository.update(role, { name, description: body.description ?? null });
    return toRoleResponse(role);
  }

  // PATCH solo modifica los campos enviados.
  public async updatePatch(id: number, body: PatchRoleDto): Promise<RoleResponseDto> {
    const role = await this.findOrFail(id);
    const data: PatchRoleDto = {};
    if (body.name !== undefined) {
      data.name = this.normalizarNombre(body.name);
      await this.assertNameAvailable(data.name, role.id);
    }
    if (body.description !== undefined) data.description = body.description;
    await this.repository.update(role, data);
    return toRoleResponse(role);
  }

  public async deletePhysical(id: number): Promise<void> {
    await this.repository.delete(await this.findOrFail(id));
  }

  public async deleteLogical(id: number): Promise<RoleResponseDto> {
    const role = await this.findOrFail(id);
    await this.repository.update(role, { status: 'inactive' });
    return toRoleResponse(role);
  }
}
