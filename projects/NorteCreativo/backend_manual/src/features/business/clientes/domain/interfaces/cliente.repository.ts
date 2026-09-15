import { Cliente } from '../entities/cliente.entity.js';

export const CLIENTE_REPOSITORY = 'IClienteRepository';

export interface IClienteRepository {
  create(cliente: Cliente): Promise<Cliente>;
  findAll(page: number, limit: number): Promise<{ items: Cliente[]; total: number }>;
  findById(id: number): Promise<Cliente | null>;
  findByNumeroDocumento(numeroDocumento: string): Promise<Cliente | null>;
  count(): Promise<number>;
}
