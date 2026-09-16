import { Inject, Injectable } from '@nestjs/common';
import { TareaNotFoundException } from '../../domain/exceptions/tarea-not-found.exception.js';
import { TAREA_REPOSITORY } from '../../domain/interfaces/tarea.repository.js';
import type { ITareaRepository } from '../../domain/interfaces/tarea.repository.js';
import type { Tarea } from '../../domain/entities/tarea.entity.js';

@Injectable()
export class GetTareaByIdUseCase {
  constructor(
    @Inject(TAREA_REPOSITORY) private readonly tareaRepo: ITareaRepository,
  ) {}

  async execute(id: number): Promise<Tarea> {
    const tarea = await this.tareaRepo.findById(id);
    if (!tarea) {
      throw new TareaNotFoundException(id);
    }
    return tarea;
  }
}
