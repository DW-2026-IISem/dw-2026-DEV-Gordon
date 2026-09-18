import { Inject, Injectable } from '@nestjs/common';
import type { Entregable } from '../../domain/entities/entregable.entity.js';
import { ENTREGABLE_REPOSITORY, type IEntregableRepository } from '../../domain/interfaces/entregable-repository.interface.js';

@Injectable()
export class ListEntregablesUseCase {
  constructor(@Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepository: IEntregableRepository) {}

  async execute(): Promise<Entregable[]> {
    return this.entregableRepository.findAll();
  }
}
