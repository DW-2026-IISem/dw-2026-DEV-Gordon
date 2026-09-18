import { Inject, Injectable } from '@nestjs/common';
import type { Hito } from '../../domain/entities/hito.entity.js';
import { HITO_REPOSITORY, type IHitoRepository } from '../../domain/interfaces/hito-repository.interface.js';

@Injectable()
export class ListHitosUseCase {
  constructor(@Inject(HITO_REPOSITORY) private readonly hitoRepository: IHitoRepository) {}

  async execute(): Promise<Hito[]> {
    return this.hitoRepository.findAll();
  }
}
