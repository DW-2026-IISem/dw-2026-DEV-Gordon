import { Inject, Injectable } from '@nestjs/common';
import { VersionNotFoundException } from '../../domain/exceptions/version-not-found.exception.js';
import { VERSION_ENTREGABLE_REPOSITORY } from '../../domain/interfaces/version-entregable.repository.js';
import type { IVersionEntregableRepository } from '../../domain/interfaces/version-entregable.repository.js';
import type { VersionEntregable } from '../../domain/entities/version-entregable.entity.js';

@Injectable()
export class GetVersionByIdUseCase {
  constructor(
    @Inject(VERSION_ENTREGABLE_REPOSITORY)
    private readonly versionRepo: IVersionEntregableRepository,
  ) {}

  async execute(id: number): Promise<VersionEntregable> {
    const version = await this.versionRepo.findById(id);
    if (!version) {
      throw new VersionNotFoundException(id);
    }
    return version;
  }
}
