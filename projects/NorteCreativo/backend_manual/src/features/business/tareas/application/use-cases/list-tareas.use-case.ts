import { Inject, Injectable } from '@nestjs/common';
import { TAREA_REPOSITORY } from '../../domain/interfaces/tarea.repository.js';
import type { ITareaRepository } from '../../domain/interfaces/tarea.repository.js';
import { TareaMapper } from '../mappers/tarea.mapper.js';

@Injectable()
export class ListTareasUseCase {
  constructor(
    @Inject(TAREA_REPOSITORY) private readonly tareaRepo: ITareaRepository,
  ) {}

  async execute(page: number, limit: number) {
    const { items, total } = await this.tareaRepo.findAll(page, limit);
    return {
      items: items.map(TareaMapper.toResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
