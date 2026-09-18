import { Inject, Injectable } from '@nestjs/common';
import { HitoNotFoundException } from '../../../hitos/domain/exceptions/hito-not-found.exception.js';
import { HITO_REPOSITORY, type IHitoRepository } from '../../../hitos/domain/interfaces/hito-repository.interface.js';
import type { Tarea } from '../../domain/entities/tarea.entity.js';
import { TAREA_REPOSITORY, type ITareaRepository } from '../../domain/interfaces/tarea-repository.interface.js';
import type { CreateTareaDto } from '../dtos/create-tarea.dto.js';

@Injectable()
export class CreateTareaUseCase {
  constructor(
    @Inject(TAREA_REPOSITORY) private readonly tareaRepository: ITareaRepository,
    @Inject(HITO_REPOSITORY) private readonly hitoRepository: IHitoRepository,
  ) {}

  async execute(dto: CreateTareaDto): Promise<Tarea> {
    const hito = await this.hitoRepository.findById(dto.hitoId);

    if (!hito) {
      throw new HitoNotFoundException(dto.hitoId);
    }

    return this.tareaRepository.create({
      hitoId: dto.hitoId,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
    });
  }
}
