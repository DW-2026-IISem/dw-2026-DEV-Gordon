import { Inject, Injectable } from '@nestjs/common';
import { TAREA_REPOSITORY } from '../../../tareas/domain/interfaces/tarea.repository.js';
import type { ITareaRepository } from '../../../tareas/domain/interfaces/tarea.repository.js';
import { TareaNotFoundException } from '../../../tareas/domain/exceptions/tarea-not-found.exception.js';
import { ENTREGABLE_REPOSITORY } from '../../domain/interfaces/entregable.repository.js';
import type { IEntregableRepository } from '../../domain/interfaces/entregable.repository.js';
import type { Entregable } from '../../domain/entities/entregable.entity.js';
import { CreateEntregableDto } from '../dto/create-entregable.dto.js';
import { EntregableMapper } from '../mappers/entregable.mapper.js';

@Injectable()
export class CreateEntregableUseCase {
  constructor(
    @Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepo: IEntregableRepository,
    @Inject(TAREA_REPOSITORY) private readonly tareaRepo: ITareaRepository,
  ) {}

  async execute(dto: CreateEntregableDto): Promise<Entregable> {
    const tarea = await this.tareaRepo.findById(dto.tareaId);
    if (!tarea) {
      throw new TareaNotFoundException(dto.tareaId);
    }
    return this.entregableRepo.create(EntregableMapper.toEntity(dto));
  }
}
