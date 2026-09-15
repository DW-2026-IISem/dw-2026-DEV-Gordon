import { Inject, Injectable } from '@nestjs/common';
import { CLIENTE_REPOSITORY } from '../../../clientes/domain/interfaces/cliente.repository.js';
import type { IClienteRepository } from '../../../clientes/domain/interfaces/cliente.repository.js';
import { ClienteNotFoundException } from '../../../clientes/domain/exceptions/cliente-not-found.exception.js';
import { CAMPANIA_REPOSITORY } from '../../domain/interfaces/campania.repository.js';
import type { ICampaniaRepository } from '../../domain/interfaces/campania.repository.js';
import type { Campania } from '../../domain/entities/campania.entity.js';
import { CreateCampaniaDto } from '../dto/create-campania.dto.js';
import { CampaniaMapper } from '../mappers/campania.mapper.js';

@Injectable()
export class CreateCampaniaUseCase {
  constructor(
    @Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepo: ICampaniaRepository,
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
  ) {}

  async execute(dto: CreateCampaniaDto): Promise<Campania> {
    const cliente = await this.clienteRepo.findById(dto.clienteId);
    if (!cliente) {
      throw new ClienteNotFoundException(dto.clienteId);
    }
    return this.campaniaRepo.create(CampaniaMapper.toEntity(dto));
  }
}
