import { Inject, Injectable } from '@nestjs/common';
import { HITO_REPOSITORY } from '../../domain/interfaces/hito.repository.js';
import type { IHitoRepository } from '../../domain/interfaces/hito.repository.js';
import { HitoMapper } from '../mappers/hito.mapper.js';

@Injectable()
export class ListHitosUseCase {
  constructor(
    @Inject(HITO_REPOSITORY) private readonly hitoRepo: IHitoRepository,
  ) {}

  async execute(page: number, limit: number) {
    const { items, total } = await this.hitoRepo.findAll(page, limit);
    return {
      items: items.map(HitoMapper.toResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
