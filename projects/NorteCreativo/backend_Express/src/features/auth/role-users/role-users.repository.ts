import { InferAttributes } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { Role } from '../roles/role.model';
import { User } from '../users/user.model';
import '../rbac.associations';
import { RoleUser } from './role-user.model';

const MENSAJES = {
  unique: 'La asignación ya existe',
  foreignKey: 'El user_id o el role_id no es válido para esta operación',
};

// Resumen del usuario SIN password y del rol.
const INCLUDE = [
  { model: User, as: 'user', attributes: ['id', 'username', 'email', 'status'] },
  { model: Role, as: 'role', attributes: ['id', 'name', 'status'] },
];

export class RoleUsersRepository {
  public findAllActive(): Promise<RoleUser[]> {
    return RoleUser.findAll({ where: { status: 'active' }, include: INCLUDE, order: [['id', 'ASC']] });
  }

  public findById(id: number): Promise<RoleUser | null> {
    return RoleUser.findByPk(id, { include: INCLUDE });
  }

  // Búsqueda idempotente: encuentra la fila en cualquier estado para reactivarla en vez de duplicarla.
  public findByUserAndRole(userId: number, roleId: number): Promise<RoleUser | null> {
    return RoleUser.findOne({ where: { user_id: userId, role_id: roleId }, include: INCLUDE });
  }

  public create(data: Partial<InferAttributes<RoleUser>>): Promise<RoleUser> {
    return guardDb(() => RoleUser.create(data as any), MENSAJES);
  }

  public update(roleUser: RoleUser, data: Partial<InferAttributes<RoleUser>>): Promise<RoleUser> {
    return guardDb(() => roleUser.update(data), MENSAJES);
  }
}
