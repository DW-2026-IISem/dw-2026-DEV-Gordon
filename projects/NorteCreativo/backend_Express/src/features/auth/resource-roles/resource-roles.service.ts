import { withTransaction } from '../../../shared/database/with-transaction';
import { AppError } from '../../../shared/errors/app-error';
import { ResourcesRepository } from '../resources/resources.repository';
import { RolesRepository } from '../roles/roles.repository';
import {
  CreateResourceRoleDto,
  ListResourceRolesDto,
  ReconcileRoleResult,
  ResourceRoleResponseDto,
  toResourceRoleResponse,
} from './dto';
import { ResourceRole } from './resource-role.model';
import { ResourceRolesRepository } from './resource-roles.repository';

const entero = (valor: unknown): number | null => {
  const n = Number(valor);
  return valor !== undefined && valor !== null && valor !== '' && Number.isInteger(n) && n > 0 ? n : null;
};

export interface GrantResult {
  concesion: ResourceRoleResponseDto;
  created: boolean;
}

export class ResourceRolesService {
  constructor(
    private readonly repository: ResourceRolesRepository = new ResourceRolesRepository(),
    private readonly roles: RolesRepository = new RolesRepository(),
    private readonly resources: ResourcesRepository = new ResourcesRepository()
  ) {}

  private async findOrFail(id: number): Promise<ResourceRole> {
    const resourceRole = await this.repository.findById(id);
    if (!resourceRole) throw new AppError(404, 'Concesión no encontrada');
    return resourceRole;
  }

  // Solo se concede a roles y sobre recursos existentes y activos.
  private async validarRolYRecurso(roleId: number, resourceId: number): Promise<void> {
    const role = await this.roles.findById(roleId);
    if (!role || role.status !== 'active') throw new AppError(404, 'Rol no encontrado o inactivo');
    const resource = await this.resources.findById(resourceId);
    if (!resource || resource.status !== 'active') throw new AppError(404, 'Recurso no encontrado o inactivo');
  }

  public async getAll(filtros: ListResourceRolesDto = {}): Promise<ResourceRoleResponseDto[]> {
    return (await this.repository.findAllActive(filtros)).map(toResourceRoleResponse);
  }

  public async getOne(id: number): Promise<ResourceRoleResponseDto> {
    return toResourceRoleResponse(await this.findOrFail(id));
  }

  // Upsert idempotente: no existe -> crea activa; existe inactiva -> la reactiva (sin duplicar); existe activa -> 409.
  public async grant(body: CreateResourceRoleDto): Promise<GrantResult> {
    const roleId = entero(body.role_id);
    const resourceId = entero(body.resource_id);
    const errores: string[] = [];
    if (roleId === null) errores.push('role_id es requerido y debe ser un entero positivo');
    if (resourceId === null) errores.push('resource_id es requerido y debe ser un entero positivo');
    if (errores.length > 0) throw new AppError(400, 'Error de validación', errores);

    await this.validarRolYRecurso(roleId!, resourceId!);

    const existente = await this.repository.findByRoleAndResource(roleId!, resourceId!);
    if (!existente) {
      const creada = await this.repository.create({ role_id: roleId!, resource_id: resourceId!, status: 'active' });
      return { concesion: toResourceRoleResponse((await this.repository.findById(creada.id)) as ResourceRole), created: true };
    }
    if (existente.status === 'active') throw new AppError(409, 'La concesión ya existe y está activa');
    await this.repository.update(existente, { status: 'active' });
    return { concesion: toResourceRoleResponse(existente), created: false };
  }

  // Revocar = borrado lógico: la fila se conserva para poder reactivarla.
  public async deactivate(id: number): Promise<ResourceRoleResponseDto> {
    const resourceRole = await this.findOrFail(id);
    if (resourceRole.status === 'inactive') throw new AppError(409, 'La concesión ya está inactiva');
    await this.repository.update(resourceRole, { status: 'inactive' });
    return toResourceRoleResponse(resourceRole);
  }

  public async reactivate(id: number): Promise<ResourceRoleResponseDto> {
    const resourceRole = await this.findOrFail(id);
    if (resourceRole.status === 'active') throw new AppError(409, 'La concesión ya está activa');
    await this.validarRolYRecurso(resourceRole.role_id, resourceRole.resource_id);
    await this.repository.update(resourceRole, { status: 'active' });
    return toResourceRoleResponse(resourceRole);
  }

  // Deja las concesiones ACTIVAS del rol exactamente iguales a resourceIds, en una sola transacción:
  //  - falta -> se crea activa; existe inactiva -> se reactiva; existe activa -> sin cambios
  //  - existe activa y no está en resourceIds -> se desactiva (no se borra)
  public async reconcileRole(roleId: number, resourceIds: number[]): Promise<ReconcileRoleResult> {
    const role = await this.roles.findById(roleId);
    if (!role || role.status !== 'active') throw new AppError(404, 'Rol no encontrado o inactivo');

    const deseados = [...new Set(resourceIds)];
    for (const id of deseados) {
      const resource = await this.resources.findById(id);
      if (!resource || resource.status !== 'active') throw new AppError(404, `Recurso ${id} no encontrado o inactivo`);
    }

    return withTransaction(async (t) => {
      const existentes = await this.repository.findAllByRole(roleId, t);
      const porRecurso = new Map(existentes.map((c) => [c.resource_id, c]));
      const set = new Set(deseados);

      const faltantes = deseados.filter((id) => !porRecurso.has(id));
      const aReactivar = existentes.filter((c) => set.has(c.resource_id) && c.status === 'inactive').map((c) => c.id);
      const aDesactivar = existentes.filter((c) => !set.has(c.resource_id) && c.status === 'active').map((c) => c.id);

      await this.repository.bulkCreate(roleId, faltantes, t);
      await this.repository.setStatusByIds(aReactivar, 'active', t);
      await this.repository.setStatusByIds(aDesactivar, 'inactive', t);

      return {
        role_id: roleId,
        activated: faltantes.length + aReactivar.length,
        deactivated: aDesactivar.length,
        total_active: await this.repository.countActiveByRole(roleId, t),
      };
    });
  }
}
