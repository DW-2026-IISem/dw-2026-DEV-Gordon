import { InferAttributes, Transaction } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { Hito } from '../hitos/hito.model';
import { Tarea } from './tarea.model';
import './tarea.associations';

const MENSAJES = { foreignKey: 'El hito_id no es válido para esta operación' };
const MENSAJES_DELETE = { foreignKey: 'No se puede eliminar: la tarea tiene entregables asociados' };

export class TareasRepository {
  public findAllActive(): Promise<Tarea[]> {
    return Tarea.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
  }

  public findById(id: number, transaction?: Transaction): Promise<Tarea | null> {
    return Tarea.findByPk(id, { transaction });
  }

  public findByHito(hitoId: number, transaction?: Transaction): Promise<Tarea[]> {
    return Tarea.findAll({ where: { hito_id: hitoId }, transaction });
  }

  public findByIdWithHito(id: number): Promise<Tarea | null> {
    return Tarea.findByPk(id, { include: [{ model: Hito, as: 'hito' }] });
  }

  public create(data: Partial<InferAttributes<Tarea>>): Promise<Tarea> {
    return guardDb(() => Tarea.create(data as any), MENSAJES);
  }

  public update(tarea: Tarea, data: Partial<InferAttributes<Tarea>>): Promise<Tarea> {
    return guardDb(() => tarea.update(data), MENSAJES);
  }

  public async delete(tarea: Tarea): Promise<void> {
    await guardDb(() => tarea.destroy(), MENSAJES_DELETE);
  }
}
