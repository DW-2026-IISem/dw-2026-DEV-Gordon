import { InferAttributes, Op } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { User } from './user.model';

const MENSAJES = {
  unique: 'El username o el email ya está en uso',
  foreignKey: 'No se puede eliminar: el usuario tiene roles o sesiones asociados',
};

// Las lecturas normales excluyen password desde el SELECT.
const SIN_PASSWORD = { exclude: ['password'] };

export class UsersRepository {
  public findAllActive(): Promise<User[]> {
    return User.findAll({ attributes: SIN_PASSWORD, where: { status: 'active' }, order: [['id', 'ASC']] });
  }

  public findById(id: number): Promise<User | null> {
    return User.findByPk(id, { attributes: SIN_PASSWORD });
  }

  // Login: busca por username O email (ya normalizado a minúsculas) e INCLUYE el hash de password.
  // Es la única lectura que lo trae: nunca debe salir de la capa de servicio.
  public findByIdentifierWithPassword(identifier: string): Promise<User | null> {
    return User.findOne({ where: { [Op.or]: [{ username: identifier }, { email: identifier }] } });
  }

  // Usuarios que ya usan ese username o ese email (se excluye al propio al editar).
  public findConflicts(username: string | undefined, email: string | undefined, excludeId?: number): Promise<User[]> {
    const condiciones = [];
    if (username !== undefined) condiciones.push({ username });
    if (email !== undefined) condiciones.push({ email });
    if (condiciones.length === 0) return Promise.resolve([]);
    return User.findAll({
      attributes: ['id', 'username', 'email'],
      where: excludeId === undefined ? { [Op.or]: condiciones } : { [Op.and]: [{ [Op.or]: condiciones }, { id: { [Op.ne]: excludeId } }] },
    });
  }

  // El hook beforeSave del modelo hashea la contraseña.
  public create(data: Partial<InferAttributes<User>>): Promise<User> {
    return guardDb(() => User.create(data as any), MENSAJES);
  }

  public update(user: User, data: Partial<InferAttributes<User>>): Promise<User> {
    return guardDb(() => user.update(data), MENSAJES);
  }

  public async delete(user: User): Promise<void> {
    await guardDb(() => user.destroy(), MENSAJES);
  }
}
