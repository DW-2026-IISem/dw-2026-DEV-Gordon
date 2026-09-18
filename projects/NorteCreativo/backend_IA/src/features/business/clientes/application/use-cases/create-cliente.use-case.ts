import { Inject, Injectable } from '@nestjs/common';
import type { Cliente } from '../../domain/entities/cliente.entity.js';
import { DocumentoYaExisteException } from '../../domain/exceptions/documento-ya-existe.exception.js';
import { CLIENTE_REPOSITORY, type IClienteRepository } from '../../domain/interfaces/cliente-repository.interface.js';
import type { CreateClienteDto } from '../dtos/create-cliente.dto.js';

@Injectable()
export class CreateClienteUseCase {
  constructor(@Inject(CLIENTE_REPOSITORY) private readonly clienteRepository: IClienteRepository) {}

  async execute(dto: CreateClienteDto): Promise<Cliente> {
    const existente = await this.clienteRepository.findByNumeroDocumento(dto.numeroDocumento);

    if (existente) {
      throw new DocumentoYaExisteException(dto.numeroDocumento);
    }

    return this.clienteRepository.create({
      tipoDocumento: dto.tipoDocumento,
      numeroDocumento: dto.numeroDocumento,
      nombre: dto.nombre,
      telefono: dto.telefono,
      email: dto.email,
    });
  }
}
