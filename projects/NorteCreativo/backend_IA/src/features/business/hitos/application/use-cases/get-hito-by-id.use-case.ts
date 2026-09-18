import { Inject, Injectable } from '@nestjs/common';
import type { Hito } from '../../domain/entities/hito.entity.js';
import { HitoNotFoundException } from '../../domain/exceptions/hito-not-found.exception.js';
import { HITO_REPOSITORY, type IHitoRepository } from '../../domain/interfaces/hito-repository.interface.js';

@Injectable()
export class GetHitoByIdUseCase {
  constructor(@Inject(HITO_REPOSITORY) private readonly hitoRepository: IHitoRepository) {}

  async execute(id: number): Promise<Hito> {
    const hito = await this.hitoRepository.findById(id);

    if (!hito) {
      throw new HitoNotFoundException(id);
    }

    return hito;
  }
}
