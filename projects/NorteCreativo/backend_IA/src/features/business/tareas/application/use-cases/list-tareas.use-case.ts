import { Inject, Injectable } from '@nestjs/common';
import type { Tarea } from '../../domain/entities/tarea.entity.js';
import { TAREA_REPOSITORY, type ITareaRepository } from '../../domain/interfaces/tarea-repository.interface.js';

@Injectable()
export class ListTareasUseCase {
  constructor(@Inject(TAREA_REPOSITORY) private readonly tareaRepository: ITareaRepository) {}

  async execute(): Promise<Tarea[]> {
    return this.tareaRepository.findAll();
  }
}
