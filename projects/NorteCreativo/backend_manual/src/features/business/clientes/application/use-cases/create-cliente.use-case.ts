import { Inject, Injectable } from '@nestjs/common';
import { DocumentoYaExisteException } from '../../domain/exceptions/documento-ya-existe.exception.js';
import { CLIENTE_REPOSITORY } from '../../domain/interfaces/cliente.repository.js';
import type { IClienteRepository } from '../../domain/interfaces/cliente.repository.js';
import { CreateClienteDto } from '../dto/create-cliente.dto.js';
import { ClienteMapper } from '../mappers/cliente.mapper.js';
import type { Cliente } from '../../domain/entities/cliente.entity.js';

@Injectable()
export class CreateClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(dto: CreateClienteDto): Promise<Cliente> {
    const existing = await this.clienteRepository.findByNumeroDocumento(dto.numeroDocumento);
    if (existing) {
      throw new DocumentoYaExisteException(dto.numeroDocumento);
    }
    return this.clienteRepository.create(ClienteMapper.toEntity(dto));
  }
}
