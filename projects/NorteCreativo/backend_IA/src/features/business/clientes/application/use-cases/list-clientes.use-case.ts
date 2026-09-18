import { Inject, Injectable } from '@nestjs/common';
import type { Cliente } from '../../domain/entities/cliente.entity.js';
import { CLIENTE_REPOSITORY, type IClienteRepository } from '../../domain/interfaces/cliente-repository.interface.js';

@Injectable()
export class ListClientesUseCase {
  constructor(@Inject(CLIENTE_REPOSITORY) private readonly clienteRepository: IClienteRepository) {}

  async execute(): Promise<Cliente[]> {
    return this.clienteRepository.findAll();
  }
}
