import { InferAttributes, Transaction } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { Hito } from '../hitos/hito.model';
import { Tarea } from '../tareas/tarea.model';
import { Entregable } from './entregable.model';
import '../tareas/tarea.associations';
import './entregable.associations';

const MENSAJES = { foreignKey: 'El tarea_id no es válido para esta operación' };
const MENSAJES_DELETE = { foreignKey: 'No se puede eliminar: el entregable tiene versiones asociadas' };

export class EntregablesRepository {
  public findAllActive(): Promise<Entregable[]> {
    return Entregable.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
  }

  public findById(id: number, transaction?: Transaction): Promise<Entregable | null> {
    return Entregable.findByPk(id, { transaction });
  }

  public findByTarea(tareaId: number, transaction?: Transaction): Promise<Entregable[]> {
    return Entregable.findAll({ where: { tarea_id: tareaId }, transaction });
  }

  public findByIdWithTarea(id: number): Promise<Entregable | null> {
    return Entregable.findByPk(id, { include: [{ model: Tarea, as: 'tarea' }] });
  }

  // Entregable -> tarea -> hito (RN-06 consulta el estado del hito).
  public findByIdWithTareaYHito(id: number): Promise<Entregable | null> {
    return Entregable.findByPk(id, {
      include: [{ model: Tarea, as: 'tarea', include: [{ model: Hito, as: 'hito' }] }],
    });
  }

  public create(data: Partial<InferAttributes<Entregable>>): Promise<Entregable> {
    return guardDb(() => Entregable.create(data as any), MENSAJES);
  }

  public update(entregable: Entregable, data: Partial<InferAttributes<Entregable>>): Promise<Entregable> {
    return guardDb(() => entregable.update(data), MENSAJES);
  }

  public async delete(entregable: Entregable): Promise<void> {
    await guardDb(() => entregable.destroy(), MENSAJES_DELETE);
  }
}
