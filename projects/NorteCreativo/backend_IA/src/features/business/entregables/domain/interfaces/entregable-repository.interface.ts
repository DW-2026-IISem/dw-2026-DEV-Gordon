import type { Entregable } from '../entities/entregable.entity.js';

export interface CreateEntregableData {
  tareaId: number;
  observaciones?: string;
}

export interface IEntregableRepository {
  create(data: CreateEntregableData): Promise<Entregable>;
  findAll(): Promise<Entregable[]>;
  findById(id: number): Promise<Entregable | null>;
  findByTareaId(tareaId: number): Promise<Entregable[]>;
}

export const ENTREGABLE_REPOSITORY = Symbol('ENTREGABLE_REPOSITORY');
