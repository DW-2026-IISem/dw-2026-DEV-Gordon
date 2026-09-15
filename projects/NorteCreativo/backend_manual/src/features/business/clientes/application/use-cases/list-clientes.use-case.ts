import { Inject, Injectable } from '@nestjs/common';
import { CLIENTE_REPOSITORY } from '../../domain/interfaces/cliente.repository.js';
import type { IClienteRepository } from '../../domain/interfaces/cliente.repository.js';
import { ClienteMapper } from '../mappers/cliente.mapper.js';

@Injectable()
export class ListClientesUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(page: number, limit: number) {
    const { items, total } = await this.clienteRepository.findAll(page, limit);
    return {
      items: items.map(ClienteMapper.toResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
