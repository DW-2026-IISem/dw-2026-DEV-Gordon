import { Cliente } from '../../domain/entities/cliente.entity.js';
import { CreateClienteDto } from '../dto/create-cliente.dto.js';

export class ClienteMapper {
  static toEntity(dto: CreateClienteDto): Cliente {
    return new Cliente({
      tipoDocumento: dto.tipoDocumento,
      numeroDocumento: dto.numeroDocumento,
      nombre: dto.nombre,
      telefono: dto.telefono ?? null,
      email: dto.email ?? null,
      estado: 'active',
    });
  }

  static toResponse(cliente: Cliente) {
    return {
      id: cliente.id,
      tipoDocumento: cliente.tipoDocumento,
      numeroDocumento: cliente.numeroDocumento,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email,
      estado: cliente.estado,
    };
  }
}
