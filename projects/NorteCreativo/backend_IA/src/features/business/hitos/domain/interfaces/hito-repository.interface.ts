import type { EstadoHito, Hito } from '../entities/hito.entity.js';

export interface CreateHitoData {
  campaniaId: number;
  nombre: string;
  descripcion?: string;
}

export interface IHitoRepository {
  create(data: CreateHitoData): Promise<Hito>;
  findAll(): Promise<Hito[]>;
  findById(id: number): Promise<Hito | null>;
  /**
   * Persiste la transición de estado decidida por el dominio (p. ej. tras
   * `hito.cerrar()`). No recalcula la regla de negocio: solo guarda.
   */
  actualizarEstado(id: number, estado: EstadoHito, fechaCierre: Date | null): Promise<Hito>;
}

export const HITO_REPOSITORY = Symbol('HITO_REPOSITORY');
