import type { Cliente, TipoDocumentoCliente } from '../entities/cliente.entity.js';

export interface CreateClienteData {
  tipoDocumento: TipoDocumentoCliente;
  numeroDocumento: string;
  nombre: string;
  telefono?: string;
  email?: string;
}

export interface IClienteRepository {
  create(data: CreateClienteData): Promise<Cliente>;
  findAll(): Promise<Cliente[]>;
  findById(id: number): Promise<Cliente | null>;
  findByNumeroDocumento(numeroDocumento: string): Promise<Cliente | null>;
}

export const CLIENTE_REPOSITORY = Symbol('CLIENTE_REPOSITORY');
