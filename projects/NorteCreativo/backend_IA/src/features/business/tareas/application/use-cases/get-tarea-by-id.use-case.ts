import { Inject, Injectable } from '@nestjs/common';
import type { Tarea } from '../../domain/entities/tarea.entity.js';
import { TareaNotFoundException } from '../../domain/exceptions/tarea-not-found.exception.js';
import { TAREA_REPOSITORY, type ITareaRepository } from '../../domain/interfaces/tarea-repository.interface.js';

@Injectable()
export class GetTareaByIdUseCase {
  constructor(@Inject(TAREA_REPOSITORY) private readonly tareaRepository: ITareaRepository) {}

  async execute(id: number): Promise<Tarea> {
    const tarea = await this.tareaRepository.findById(id);

    if (!tarea) {
      throw new TareaNotFoundException(id);
    }

    return tarea;
  }
}
