import { Inject, Injectable } from '@nestjs/common';
import { HITO_REPOSITORY } from '../../../hitos/domain/interfaces/hito.repository.js';
import type { IHitoRepository } from '../../../hitos/domain/interfaces/hito.repository.js';
import { HitoNotFoundException } from '../../../hitos/domain/exceptions/hito-not-found.exception.js';
import { TAREA_REPOSITORY } from '../../domain/interfaces/tarea.repository.js';
import type { ITareaRepository } from '../../domain/interfaces/tarea.repository.js';
import type { Tarea } from '../../domain/entities/tarea.entity.js';
import { CreateTareaDto } from '../dto/create-tarea.dto.js';
import { TareaMapper } from '../mappers/tarea.mapper.js';

@Injectable()
export class CreateTareaUseCase {
  constructor(
    @Inject(TAREA_REPOSITORY) private readonly tareaRepo: ITareaRepository,
    @Inject(HITO_REPOSITORY) private readonly hitoRepo: IHitoRepository,
  ) {}

  async execute(dto: CreateTareaDto): Promise<Tarea> {
    const hito = await this.hitoRepo.findById(dto.hitoId);
    if (!hito) {
      throw new HitoNotFoundException(dto.hitoId);
    }
    return this.tareaRepo.create(TareaMapper.toEntity(dto));
  }
}
