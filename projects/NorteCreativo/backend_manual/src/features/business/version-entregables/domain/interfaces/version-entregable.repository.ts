import { VersionEntregable } from '../entities/version-entregable.entity.js';

export const VERSION_ENTREGABLE_REPOSITORY = 'IVersionEntregableRepository';

export interface IVersionEntregableRepository {
  create(version: VersionEntregable): Promise<VersionEntregable>;
  findById(id: number): Promise<VersionEntregable | null>;
  findByEntregableId(entregableId: number): Promise<VersionEntregable[]>;
  // Última versión (mayor numeroVersion) de un entregable — la usa CerrarHito
  findUltimaVersion(entregableId: number): Promise<VersionEntregable | null>;
  countByEntregableId(entregableId: number): Promise<number>;
}
