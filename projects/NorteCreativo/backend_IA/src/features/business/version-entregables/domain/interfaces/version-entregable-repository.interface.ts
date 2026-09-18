import type { VersionEntregable } from '../entities/version-entregable.entity.js';

export interface CreateVersionEntregableData {
  entregableId: number;
  numeroVersion: number;
  observaciones?: string;
}

export interface IVersionEntregableRepository {
  create(data: CreateVersionEntregableData): Promise<VersionEntregable>;
  findById(id: number): Promise<VersionEntregable | null>;
  findByEntregableId(entregableId: number): Promise<VersionEntregable[]>;
  findUltimaVersion(entregableId: number): Promise<VersionEntregable | null>;
  countByEntregableId(entregableId: number): Promise<number>;
}

export const VERSION_ENTREGABLE_REPOSITORY = Symbol('VERSION_ENTREGABLE_REPOSITORY');
