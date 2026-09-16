import { Inject, Injectable } from '@nestjs/common';
import { ENTREGABLE_REPOSITORY } from '../../domain/interfaces/entregable.repository.js';
import type { IEntregableRepository } from '../../domain/interfaces/entregable.repository.js';
import { EntregableMapper } from '../mappers/entregable.mapper.js';

@Injectable()
export class ListEntregablesUseCase {
  constructor(
    @Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepo: IEntregableRepository,
  ) {}

  async execute(page: number, limit: number) {
    const { items, total } = await this.entregableRepo.findAll(page, limit);
    return {
      items: items.map(EntregableMapper.toResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
