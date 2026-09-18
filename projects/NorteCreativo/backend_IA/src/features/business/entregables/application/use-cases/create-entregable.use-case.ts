import { Inject, Injectable } from '@nestjs/common';
import { TareaNotFoundException } from '../../../tareas/domain/exceptions/tarea-not-found.exception.js';
import { TAREA_REPOSITORY, type ITareaRepository } from '../../../tareas/domain/interfaces/tarea-repository.interface.js';
import type { Entregable } from '../../domain/entities/entregable.entity.js';
import { ENTREGABLE_REPOSITORY, type IEntregableRepository } from '../../domain/interfaces/entregable-repository.interface.js';
import type { CreateEntregableDto } from '../dtos/create-entregable.dto.js';

@Injectable()
export class CreateEntregableUseCase {
  constructor(
    @Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepository: IEntregableRepository,
    @Inject(TAREA_REPOSITORY) private readonly tareaRepository: ITareaRepository,
  ) {}

  async execute(dto: CreateEntregableDto): Promise<Entregable> {
    const tarea = await this.tareaRepository.findById(dto.tareaId);

    if (!tarea) {
      throw new TareaNotFoundException(dto.tareaId);
    }

    return this.entregableRepository.create({
      tareaId: dto.tareaId,
      observaciones: dto.observaciones,
    });
  }
}
