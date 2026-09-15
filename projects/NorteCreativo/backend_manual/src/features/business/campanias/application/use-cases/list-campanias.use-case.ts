import { Inject, Injectable } from '@nestjs/common';
import { CAMPANIA_REPOSITORY } from '../../domain/interfaces/campania.repository.js';
import type { ICampaniaRepository } from '../../domain/interfaces/campania.repository.js';
import { CampaniaMapper } from '../mappers/campania.mapper.js';

@Injectable()
export class ListCampaniasUseCase {
  constructor(
    @Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepo: ICampaniaRepository,
  ) {}

  async execute(page: number, limit: number) {
    const { items, total } = await this.campaniaRepo.findAll(page, limit);
    return {
      items: items.map(CampaniaMapper.toResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
