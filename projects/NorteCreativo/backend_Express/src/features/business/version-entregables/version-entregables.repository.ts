import { InferAttributes, Transaction } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { Entregable } from '../entregables/entregable.model';
import { VersionEntregable } from './version-entregable.model';
import './version-entregable.associations';

const MENSAJES = {
  unique: 'Ya existe una versión con ese numero_version para el entregable',
  foreignKey: 'El entregable_id no es válido para esta operación',
};
const MENSAJES_DELETE = { foreignKey: 'No se puede eliminar: la versión tiene aprobaciones asociadas' };

export class VersionEntregablesRepository {
  public findAllActive(): Promise<VersionEntregable[]> {
    return VersionEntregable.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
  }

  public findById(id: number, transaction?: Transaction): Promise<VersionEntregable | null> {
    return VersionEntregable.findByPk(id, { transaction });
  }

  // Versión más reciente (mayor numero_version) del entregable.
  public findUltimaDeEntregable(entregableId: number, transaction?: Transaction): Promise<VersionEntregable | null> {
    return VersionEntregable.findOne({
      where: { entregable_id: entregableId },
      order: [['numero_version', 'DESC']],
      transaction,
    });
  }

  public findByIdWithEntregable(id: number): Promise<VersionEntregable | null> {
    return VersionEntregable.findByPk(id, { include: [{ model: Entregable, as: 'entregable' }] });
  }

  // Máximo numero_version del entregable (null si no tiene versiones).
  public async maxNumeroVersion(entregableId: number): Promise<number | null> {
    const maximo = (await VersionEntregable.max('numero_version', { where: { entregable_id: entregableId } })) as number | null;
    return maximo === null ? null : Number(maximo);
  }

  public create(data: Partial<InferAttributes<VersionEntregable>>): Promise<VersionEntregable> {
    return guardDb(() => VersionEntregable.create(data as any), MENSAJES);
  }

  public update(
    version: VersionEntregable,
    data: Partial<InferAttributes<VersionEntregable>>,
    transaction?: Transaction
  ): Promise<VersionEntregable> {
    return guardDb(() => version.update(data, { transaction }), MENSAJES);
  }

  public async delete(version: VersionEntregable): Promise<void> {
    await guardDb(() => version.destroy(), MENSAJES_DELETE);
  }
}
