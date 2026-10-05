import { InferAttributes } from 'sequelize';
import { guardDb } from '../../../shared/database/guard-db';
import { Resource } from './resource.model';

const MENSAJES = {
  unique: 'Ya existe un recurso con ese method y path',
  foreignKey: 'No se puede eliminar: el recurso tiene concesiones asociadas',
};

export class ResourcesRepository {
  public findAllActive(): Promise<Resource[]> {
    return Resource.findAll({ where: { status: 'active' }, order: [['id', 'ASC']] });
  }

  public findById(id: number): Promise<Resource | null> {
    return Resource.findByPk(id);
  }

  public findByOperation(method: string, path: string): Promise<Resource | null> {
    return Resource.findOne({ where: { method: method as Resource['method'], path } });
  }

  public create(data: Partial<InferAttributes<Resource>>): Promise<Resource> {
    return guardDb(() => Resource.create(data as any), MENSAJES);
  }

  public update(resource: Resource, data: Partial<InferAttributes<Resource>>): Promise<Resource> {
    return guardDb(() => resource.update(data), MENSAJES);
  }

  public async delete(resource: Resource): Promise<void> {
    await guardDb(() => resource.destroy(), MENSAJES);
  }
}
