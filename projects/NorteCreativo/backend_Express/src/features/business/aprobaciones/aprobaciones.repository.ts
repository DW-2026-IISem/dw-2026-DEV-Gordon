import { InferAttributes, Transaction } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { VersionEntregable } from '../version-entregables/version-entregable.model';
import { Aprobacion } from './aprobacion.model';
import './aprobacion.associations';

const MENSAJES = {
  unique: 'Registro duplicado',
  foreignKey: 'La versión de entregable no es válida para esta operación',
};

// La aprobación es un registro de auditoría: solo se lee y se crea (sin update ni delete).
export class AprobacionesRepository {
  public findAllActive(): Promise<Aprobacion[]> {
    return Aprobacion.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
  }

  public findByIdWithVersion(id: number): Promise<Aprobacion | null> {
    return Aprobacion.findByPk(id, { include: [{ model: VersionEntregable, as: 'version' }] });
  }

  public create(data: Partial<InferAttributes<Aprobacion>>, transaction: Transaction): Promise<Aprobacion> {
    return guardDb(() => Aprobacion.create(data as any, { transaction }), MENSAJES);
  }
}
