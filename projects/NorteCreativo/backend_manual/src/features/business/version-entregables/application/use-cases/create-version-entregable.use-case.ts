import { Inject, Injectable } from '@nestjs/common';
import { ENTREGABLE_REPOSITORY } from '../../../entregables/domain/interfaces/entregable.repository.js';
import type { IEntregableRepository } from '../../../entregables/domain/interfaces/entregable.repository.js';
import { EntregableNotFoundException } from '../../../entregables/domain/exceptions/entregable-not-found.exception.js';
import { VersionEntregable } from '../../domain/entities/version-entregable.entity.js';
import { VERSION_ENTREGABLE_REPOSITORY } from '../../domain/interfaces/version-entregable.repository.js';
import type { IVersionEntregableRepository } from '../../domain/interfaces/version-entregable.repository.js';
import { CreateVersionEntregableDto } from '../dto/create-version-entregable.dto.js';

@Injectable()
export class CreateVersionEntregableUseCase {
  constructor(
    @Inject(VERSION_ENTREGABLE_REPOSITORY)
    private readonly versionRepo: IVersionEntregableRepository,
    @Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepo: IEntregableRepository,
  ) {}

  async execute(dto: CreateVersionEntregableDto): Promise<VersionEntregable> {
    const entregable = await this.entregableRepo.findById(dto.entregableId);
    if (!entregable) {
      throw new EntregableNotFoundException(dto.entregableId);
    }
    const totalVersiones = await this.versionRepo.countByEntregableId(dto.entregableId);
    const version = new VersionEntregable({
      entregableId: dto.entregableId,
      numeroVersion: totalVersiones + 1,
      fechaInicio: new Date(),
      observaciones: dto.observaciones ?? null,
      estado: 'EN_REVISION',
    });
    return this.versionRepo.create(version);
  }
}
