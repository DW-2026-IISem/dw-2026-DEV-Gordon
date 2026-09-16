import { Entregable } from '../entities/entregable.entity.js';

export const ENTREGABLE_REPOSITORY = 'IEntregableRepository';

export interface IEntregableRepository {
  create(entregable: Entregable): Promise<Entregable>;
  findAll(page: number, limit: number): Promise<{ items: Entregable[]; total: number }>;
  findById(id: number): Promise<Entregable | null>;
  findByTareaId(tareaId: number): Promise<Entregable[]>;
  count(): Promise<number>;
}
