import { InferAttributes, Transaction } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { Campania } from '../campanias/campania.model';
import { Presupuesto } from './presupuesto.model';
import './presupuesto.associations';

const MENSAJES = { foreignKey: 'El campania_id no es válido para esta operación' };
const MENSAJES_DELETE = { foreignKey: 'No se puede eliminar el presupuesto: tiene registros asociados' };

export class PresupuestosRepository {
  public findAllActive(): Promise<Presupuesto[]> {
    return Presupuesto.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
  }

  public findById(id: number): Promise<Presupuesto | null> {
    return Presupuesto.findByPk(id);
  }

  public findByIdWithCampania(id: number): Promise<Presupuesto | null> {
    return Presupuesto.findByPk(id, { include: [{ model: Campania, as: 'campania' }] });
  }

  // Presupuestos APROBADOS y activos de una campaña (base de RN-03). Acepta transacción para leer dentro de FacturarHitos.
  public findAprobadosDeCampania(campaniaId: number, transaction?: Transaction): Promise<Presupuesto[]> {
    return Presupuesto.findAll({
      where: { campania_id: campaniaId, estado: 'APROBADO', status: 'active' },
      transaction,
    });
  }

  public create(data: Partial<InferAttributes<Presupuesto>>): Promise<Presupuesto> {
    return guardDb(() => Presupuesto.create(data as any), MENSAJES);
  }

  public update(presupuesto: Presupuesto, data: Partial<InferAttributes<Presupuesto>>): Promise<Presupuesto> {
    return guardDb(() => presupuesto.update(data), MENSAJES);
  }

  public async delete(presupuesto: Presupuesto): Promise<void> {
    await guardDb(() => presupuesto.destroy(), MENSAJES_DELETE);
  }
}
