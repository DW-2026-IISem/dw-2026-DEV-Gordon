import { Inject, Injectable } from '@nestjs/common';
import type { Entregable } from '../../domain/entities/entregable.entity.js';
import { EntregableNotFoundException } from '../../domain/exceptions/entregable-not-found.exception.js';
import { ENTREGABLE_REPOSITORY, type IEntregableRepository } from '../../domain/interfaces/entregable-repository.interface.js';

@Injectable()
export class GetEntregableByIdUseCase {
  constructor(@Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepository: IEntregableRepository) {}

  async execute(id: number): Promise<Entregable> {
    const entregable = await this.entregableRepository.findById(id);

    if (!entregable) {
      throw new EntregableNotFoundException(id);
    }

    return entregable;
  }
}
