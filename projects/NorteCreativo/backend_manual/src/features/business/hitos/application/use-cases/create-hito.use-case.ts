import { Inject, Injectable } from '@nestjs/common';
import { CAMPANIA_REPOSITORY } from '../../../campanias/domain/interfaces/campania.repository.js';
import type { ICampaniaRepository } from '../../../campanias/domain/interfaces/campania.repository.js';
import { CampaniaNotFoundException } from '../../../campanias/domain/exceptions/campania-not-found.exception.js';
import { CampaniaInactivaParaHitoException } from '../../domain/exceptions/campania-inactiva-para-hito.exception.js';
import { HITO_REPOSITORY } from '../../domain/interfaces/hito.repository.js';
import type { IHitoRepository } from '../../domain/interfaces/hito.repository.js';
import type { Hito } from '../../domain/entities/hito.entity.js';
import { CreateHitoDto } from '../dto/create-hito.dto.js';
import { HitoMapper } from '../mappers/hito.mapper.js';

@Injectable()
export class CreateHitoUseCase {
  constructor(
    @Inject(HITO_REPOSITORY) private readonly hitoRepo: IHitoRepository,
    @Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepo: ICampaniaRepository,
  ) {}

  async execute(dto: CreateHitoDto): Promise<Hito> {
    const campania = await this.campaniaRepo.findById(dto.campaniaId);
    if (!campania) {
      throw new CampaniaNotFoundException(dto.campaniaId);
    }
    if (!campania.isActive) {
      // RN-08
      throw new CampaniaInactivaParaHitoException(dto.campaniaId);
    }
    return this.hitoRepo.create(HitoMapper.toEntity(dto));
  }
}
