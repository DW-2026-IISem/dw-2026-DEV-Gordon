import type { Tarea } from '../entities/tarea.entity.js';

export interface CreateTareaData {
  hitoId: number;
  nombre: string;
  descripcion?: string;
}

export interface ITareaRepository {
  create(data: CreateTareaData): Promise<Tarea>;
  findAll(): Promise<Tarea[]>;
  findById(id: number): Promise<Tarea | null>;
  findByHitoId(hitoId: number): Promise<Tarea[]>;
}

export const TAREA_REPOSITORY = Symbol('TAREA_REPOSITORY');
