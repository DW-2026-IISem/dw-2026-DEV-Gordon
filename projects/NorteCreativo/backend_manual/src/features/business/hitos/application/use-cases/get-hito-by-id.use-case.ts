import { Inject, Injectable } from '@nestjs/common';
import { HitoNotFoundException } from '../../domain/exceptions/hito-not-found.exception.js';
import { HITO_REPOSITORY } from '../../domain/interfaces/hito.repository.js';
import type { IHitoRepository } from '../../domain/interfaces/hito.repository.js';
import type { Hito } from '../../domain/entities/hito.entity.js';

@Injectable()
export class GetHitoByIdUseCase {
  constructor(
    @Inject(HITO_REPOSITORY) private readonly hitoRepo: IHitoRepository,
  ) {}

  async execute(id: number): Promise<Hito> {
    const hito = await this.hitoRepo.findById(id);
    if (!hito) {
      throw new HitoNotFoundException(id);
    }
    return hito;
  }
}
