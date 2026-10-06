import { InferAttributes, Transaction } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { Resource } from '../resources/resource.model';
import { Role } from '../roles/role.model';
import '../rbac.associations';
import { ResourceRole } from './resource-role.model';
import { ListResourceRolesDto } from './dto';

const MENSAJES = {
  unique: 'La concesión ya existe',
  foreignKey: 'El role_id o el resource_id no es válido para esta operación',
};

const INCLUDE = [
  { model: Role, as: 'role', attributes: ['id', 'name', 'status'] },
  { model: Resource, as: 'resource', attributes: ['id', 'method', 'path', 'description', 'status'] },
];

export class ResourceRolesRepository {
  // Concesiones activas, con filtros opcionales por rol y/o por recurso.
  public findAllActive(filtros: ListResourceRolesDto = {}): Promise<ResourceRole[]> {
    const where: Record<string, unknown> = { status: 'active' };
    if (filtros.role_id !== undefined) where.role_id = filtros.role_id;
    if (filtros.resource_id !== undefined) where.resource_id = filtros.resource_id;
    return ResourceRole.findAll({ where, include: INCLUDE, order: [['id', 'ASC']] });
  }

  public findById(id: number): Promise<ResourceRole | null> {
    return ResourceRole.findByPk(id, { include: INCLUDE });
  }

  // Búsqueda idempotente: encuentra la fila en cualquier estado para reactivarla en vez de duplicarla.
  public findByRoleAndResource(roleId: number, resourceId: number): Promise<ResourceRole | null> {
    return ResourceRole.findOne({ where: { role_id: roleId, resource_id: resourceId }, include: INCLUDE });
  }

  // Todas las concesiones del rol (activas e inactivas): base de reconcileRole.
  public findAllByRole(roleId: number, transaction?: Transaction): Promise<ResourceRole[]> {
    return ResourceRole.findAll({ where: { role_id: roleId }, transaction });
  }

  public create(data: Partial<InferAttributes<ResourceRole>>): Promise<ResourceRole> {
    return guardDb(() => ResourceRole.create(data as any), MENSAJES);
  }

  public update(resourceRole: ResourceRole, data: Partial<InferAttributes<ResourceRole>>): Promise<ResourceRole> {
    return guardDb(() => resourceRole.update(data), MENSAJES);
  }

  public async bulkCreate(roleId: number, resourceIds: number[], transaction: Transaction): Promise<void> {
    if (resourceIds.length === 0) return;
    await guardDb(
      () =>
        ResourceRole.bulkCreate(
          resourceIds.map((resource_id) => ({ role_id: roleId, resource_id, status: 'active' as const })),
          { transaction }
        ),
      MENSAJES
    );
  }

  public async setStatusByIds(ids: number[], status: 'active' | 'inactive', transaction: Transaction): Promise<void> {
    if (ids.length === 0) return;
    await ResourceRole.update({ status }, { where: { id: ids }, transaction });
  }

  public countActiveByRole(roleId: number, transaction?: Transaction): Promise<number> {
    return ResourceRole.count({ where: { role_id: roleId, status: 'active' }, transaction });
  }
}
