import { Inject, Injectable } from '@nestjs/common';
import { EntregableNotFoundException } from '../../domain/exceptions/entregable-not-found.exception.js';
import { ENTREGABLE_REPOSITORY } from '../../domain/interfaces/entregable.repository.js';
import type { IEntregableRepository } from '../../domain/interfaces/entregable.repository.js';
import type { Entregable } from '../../domain/entities/entregable.entity.js';

@Injectable()
export class GetEntregableByIdUseCase {
  constructor(
    @Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepo: IEntregableRepository,
  ) {}

  async execute(id: number): Promise<Entregable> {
    const entregable = await this.entregableRepo.findById(id);
    if (!entregable) {
      throw new EntregableNotFoundException(id);
    }
    return entregable;
  }
}
