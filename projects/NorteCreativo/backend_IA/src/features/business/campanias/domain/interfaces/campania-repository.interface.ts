import type { Campania } from '../entities/campania.entity.js';

export interface CreateCampaniaData {
  clienteId: number;
  nombre: string;
  descripcion?: string;
}

export interface ICampaniaRepository {
  create(data: CreateCampaniaData): Promise<Campania>;
  findAll(): Promise<Campania[]>;
  findById(id: number): Promise<Campania | null>;
}

export const CAMPANIA_REPOSITORY = Symbol('CAMPANIA_REPOSITORY');
