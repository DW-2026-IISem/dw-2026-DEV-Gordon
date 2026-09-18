import { Inject, Injectable } from '@nestjs/common';
import { CampaniaNotFoundException } from '../../../campanias/domain/exceptions/campania-not-found.exception.js';
import { CAMPANIA_REPOSITORY, type ICampaniaRepository } from '../../../campanias/domain/interfaces/campania-repository.interface.js';
import type { Hito } from '../../domain/entities/hito.entity.js';
import { CampaniaInactivaParaHitoException } from '../../domain/exceptions/campania-inactiva-para-hito.exception.js';
import { HITO_REPOSITORY, type IHitoRepository } from '../../domain/interfaces/hito-repository.interface.js';
import type { CreateHitoDto } from '../dtos/create-hito.dto.js';

@Injectable()
export class CreateHitoUseCase {
  constructor(
    @Inject(HITO_REPOSITORY) private readonly hitoRepository: IHitoRepository,
    @Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepository: ICampaniaRepository,
  ) {}

  async execute(dto: CreateHitoDto): Promise<Hito> {
    const campania = await this.campaniaRepository.findById(dto.campaniaId);

    if (!campania) {
      throw new CampaniaNotFoundException(dto.campaniaId);
    }

    if (!campania.isActive) {
      throw new CampaniaInactivaParaHitoException(dto.campaniaId);
    }

    return this.hitoRepository.create({
      campaniaId: dto.campaniaId,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
    });
  }
}
