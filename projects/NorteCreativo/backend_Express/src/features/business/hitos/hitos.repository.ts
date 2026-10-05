import { InferAttributes, Transaction } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { Campania } from '../campanias/campania.model';
import { Hito } from './hito.model';
import './hito.associations';

const MENSAJES = { foreignKey: 'El campania_id no es válido para esta operación' };
const MENSAJES_DELETE = { foreignKey: 'No se puede eliminar: el hito tiene tareas asociadas' };

export class HitosRepository {
  public findAllActive(): Promise<Hito[]> {
    return Hito.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
  }

  public findById(id: number): Promise<Hito | null> {
    return Hito.findByPk(id);
  }

  // Bloqueo de fila (SELECT ... FOR UPDATE): serializa aprobaciones concurrentes sobre el mismo hito.
  public findByIdForUpdate(id: number, transaction: Transaction): Promise<Hito | null> {
    return Hito.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
  }

  public findByIdWithCampania(id: number): Promise<Hito | null> {
    return Hito.findByPk(id, { include: [{ model: Campania, as: 'campania' }] });
  }

  public create(data: Partial<InferAttributes<Hito>>): Promise<Hito> {
    return guardDb(() => Hito.create(data as any), MENSAJES);
  }

  public update(hito: Hito, data: Partial<InferAttributes<Hito>>, transaction?: Transaction): Promise<Hito> {
    return guardDb(() => hito.update(data, { transaction }), MENSAJES);
  }

  public async delete(hito: Hito): Promise<void> {
    await guardDb(() => hito.destroy(), MENSAJES_DELETE);
  }
}
