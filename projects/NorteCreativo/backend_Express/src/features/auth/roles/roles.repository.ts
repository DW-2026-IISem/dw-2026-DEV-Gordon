import { InferAttributes } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { RoleUser } from '../role-users/role-user.model';
import '../rbac.associations';
import { Role } from './role.model';

const MENSAJES = {
  unique: 'El nombre de rol ya está en uso',
  foreignKey: 'No se puede eliminar: el rol tiene usuarios o concesiones asociados',
};

export class RolesRepository {
  public findAllActive(): Promise<Role[]> {
    return Role.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
  }

  // Roles ACTIVOS que el usuario tiene por una asignación ACTIVA (perfil).
  public findActiveByUser(userId: number): Promise<Role[]> {
    return Role.findAll({
      attributes: ['id', 'name', 'description'],
      where: { status: 'active' },
      include: [{ model: RoleUser, as: 'roleUsers', attributes: [], required: true, where: { user_id: userId, status: 'active' } }],
      order: [['id', 'ASC']],
    });
  }

  public findById(id: number): Promise<Role | null> {
    return Role.findByPk(id);
  }

  public findByName(name: string): Promise<Role | null> {
    return Role.findOne({ where: { name } });
  }

  public create(data: Partial<InferAttributes<Role>>): Promise<Role> {
    return guardDb(() => Role.create(data as any), MENSAJES);
  }

  public update(role: Role, data: Partial<InferAttributes<Role>>): Promise<Role> {
    return guardDb(() => role.update(data), MENSAJES);
  }

  public async delete(role: Role): Promise<void> {
    await guardDb(() => role.destroy(), MENSAJES);
  }
}
