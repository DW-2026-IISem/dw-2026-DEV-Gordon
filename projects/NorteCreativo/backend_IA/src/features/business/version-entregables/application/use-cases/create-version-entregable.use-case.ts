import { Inject, Injectable } from '@nestjs/common';
import { EntregableNotFoundException } from '../../../entregables/domain/exceptions/entregable-not-found.exception.js';
import { ENTREGABLE_REPOSITORY, type IEntregableRepository } from '../../../entregables/domain/interfaces/entregable-repository.interface.js';
import type { VersionEntregable } from '../../domain/entities/version-entregable.entity.js';
import {
  VERSION_ENTREGABLE_REPOSITORY,
  type IVersionEntregableRepository,
} from '../../domain/interfaces/version-entregable-repository.interface.js';
import type { CreateVersionEntregableDto } from '../dtos/create-version-entregable.dto.js';

@Injectable()
export class CreateVersionEntregableUseCase {
  constructor(
    @Inject(VERSION_ENTREGABLE_REPOSITORY) private readonly versionEntregableRepository: IVersionEntregableRepository,
    @Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepository: IEntregableRepository,
  ) {}

  async execute(dto: CreateVersionEntregableDto): Promise<VersionEntregable> {
    const entregable = await this.entregableRepository.findById(dto.entregableId);

    if (!entregable) {
      throw new EntregableNotFoundException(dto.entregableId);
    }

    const versionesExistentes = await this.versionEntregableRepository.countByEntregableId(dto.entregableId);
    const numeroVersion = versionesExistentes + 1;

    return this.versionEntregableRepository.create({
      entregableId: dto.entregableId,
      numeroVersion,
      observaciones: dto.observaciones,
    });
  }
}
