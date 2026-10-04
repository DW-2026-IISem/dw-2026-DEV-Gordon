import { InferAttributes } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { Cliente } from '../clientes/cliente.model';
import { Campania } from './campania.model';
import './campania.associations';

const MENSAJES = { foreignKey: 'El cliente_id no es válido para esta operación' };
const MENSAJES_DELETE = { foreignKey: 'No se puede eliminar: la campaña tiene hitos asociados' };

export class CampaniasRepository {
  public findAllActive(): Promise<Campania[]> {
    return Campania.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
  }

  public findById(id: number): Promise<Campania | null> {
    return Campania.findByPk(id);
  }

  public findByIdWithCliente(id: number): Promise<Campania | null> {
    return Campania.findByPk(id, { include: [{ model: Cliente, as: 'cliente' }] });
  }

  public create(data: Partial<InferAttributes<Campania>>): Promise<Campania> {
    return guardDb(() => Campania.create(data as any), MENSAJES);
  }

  public update(campania: Campania, data: Partial<InferAttributes<Campania>>): Promise<Campania> {
    return guardDb(() => campania.update(data), MENSAJES);
  }

  public async delete(campania: Campania): Promise<void> {
    await guardDb(() => campania.destroy(), MENSAJES_DELETE);
  }
}
