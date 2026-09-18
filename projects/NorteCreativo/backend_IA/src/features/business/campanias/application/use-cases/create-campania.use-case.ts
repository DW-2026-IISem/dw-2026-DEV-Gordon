import { Inject, Injectable } from '@nestjs/common';
import { ClienteNotFoundException } from '../../../clientes/domain/exceptions/cliente-not-found.exception.js';
import { CLIENTE_REPOSITORY, type IClienteRepository } from '../../../clientes/domain/interfaces/cliente-repository.interface.js';
import type { Campania } from '../../domain/entities/campania.entity.js';
import { CAMPANIA_REPOSITORY, type ICampaniaRepository } from '../../domain/interfaces/campania-repository.interface.js';
import type { CreateCampaniaDto } from '../dtos/create-campania.dto.js';

@Injectable()
export class CreateCampaniaUseCase {
  constructor(
    @Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepository: ICampaniaRepository,
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(dto: CreateCampaniaDto): Promise<Campania> {
    const cliente = await this.clienteRepository.findById(dto.clienteId);

    if (!cliente) {
      throw new ClienteNotFoundException(dto.clienteId);
    }

    return this.campaniaRepository.create({
      clienteId: dto.clienteId,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
    });
  }
}
