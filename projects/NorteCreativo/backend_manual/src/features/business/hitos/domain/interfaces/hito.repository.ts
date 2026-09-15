import { Hito } from '../entities/hito.entity.js';

export const HITO_REPOSITORY = 'IHitoRepository';

export interface IHitoRepository {
  create(hito: Hito): Promise<Hito>;
  findAll(page: number, limit: number): Promise<{ items: Hito[]; total: number }>;
  findById(id: number): Promise<Hito | null>;
  count(): Promise<number>;
  // Persiste el cambio de estado (usado por CerrarHitoUseCase, dentro de una transacción externa)
  actualizarEstado(id: number, estado: string, fechaCierre: Date | null): Promise<void>;
}
