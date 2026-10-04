import { InferAttributes } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { Cliente } from './cliente.model';

const MENSAJES = {
  unique: 'El numero_documento ya está registrado',
  foreignKey: 'No se puede eliminar: el cliente tiene campañas asociadas',
};

export class ClientesRepository {
  public findAllActive(): Promise<Cliente[]> {
    return Cliente.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
  }

  public findById(id: number): Promise<Cliente | null> {
    return Cliente.findByPk(id);
  }

  public findByNumeroDocumento(numeroDocumento: string): Promise<Cliente | null> {
    return Cliente.findOne({ where: { numero_documento: numeroDocumento } });
  }

  public create(data: Partial<InferAttributes<Cliente>>): Promise<Cliente> {
    return guardDb(() => Cliente.create(data as any), MENSAJES);
  }

  public update(cliente: Cliente, data: Partial<InferAttributes<Cliente>>): Promise<Cliente> {
    return guardDb(() => cliente.update(data), MENSAJES);
  }

  public async delete(cliente: Cliente): Promise<void> {
    await guardDb(() => cliente.destroy(), MENSAJES);
  }
}
