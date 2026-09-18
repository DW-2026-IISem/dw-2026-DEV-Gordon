import type { Cliente, TipoDocumentoCliente } from '../../domain/entities/cliente.entity.js';

export interface ClienteResponse {
  id: number;
  tipoDocumento: TipoDocumentoCliente;
  numeroDocumento: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  estado: boolean;
}

export class ClienteMapper {
  static toResponse(cliente: Cliente): ClienteResponse {
    return {
      id: cliente.id as number,
      tipoDocumento: cliente.tipoDocumento,
      numeroDocumento: cliente.numeroDocumento,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email,
      estado: cliente.estado,
    };
  }

  static toResponseList(clientes: Cliente[]): ClienteResponse[] {
    return clientes.map((cliente) => ClienteMapper.toResponse(cliente));
  }
}
