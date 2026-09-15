import { Campania } from '../entities/campania.entity.js';

export const CAMPANIA_REPOSITORY = 'ICampaniaRepository';

export interface ICampaniaRepository {
  create(campania: Campania): Promise<Campania>;
  findAll(page: number, limit: number): Promise<{ items: Campania[]; total: number }>;
  findById(id: number): Promise<Campania | null>;
  count(): Promise<number>;
}
