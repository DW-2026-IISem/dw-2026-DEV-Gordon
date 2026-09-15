import { Inject, Injectable } from '@nestjs/common';
import { ClienteNotFoundException } from '../../domain/exceptions/cliente-not-found.exception.js';
import { CLIENTE_REPOSITORY } from '../../domain/interfaces/cliente.repository.js';
import type { IClienteRepository } from '../../domain/interfaces/cliente.repository.js';
import type { Cliente } from '../../domain/entities/cliente.entity.js';

@Injectable()
export class GetClienteByIdUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      throw new ClienteNotFoundException(id);
    }
    return cliente;
  }
}
