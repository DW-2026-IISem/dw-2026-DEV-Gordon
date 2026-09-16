import { Tarea } from '../entities/tarea.entity.js';

export const TAREA_REPOSITORY = 'ITareaRepository';

export interface ITareaRepository {
  create(tarea: Tarea): Promise<Tarea>;
  findAll(page: number, limit: number): Promise<{ items: Tarea[]; total: number }>;
  findById(id: number): Promise<Tarea | null>;
  findByHitoId(hitoId: number): Promise<Tarea[]>;
  count(): Promise<number>;
}
