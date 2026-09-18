import { Inject, Injectable } from '@nestjs/common';
import type { VersionEntregable } from '../../domain/entities/version-entregable.entity.js';
import { VersionNotFoundException } from '../../domain/exceptions/version-not-found.exception.js';
import {
  VERSION_ENTREGABLE_REPOSITORY,
  type IVersionEntregableRepository,
} from '../../domain/interfaces/version-entregable-repository.interface.js';

@Injectable()
export class GetVersionByIdUseCase {
  constructor(
    @Inject(VERSION_ENTREGABLE_REPOSITORY) private readonly versionEntregableRepository: IVersionEntregableRepository,
  ) {}

  async execute(id: number): Promise<VersionEntregable> {
    const version = await this.versionEntregableRepository.findById(id);

    if (!version) {
      throw new VersionNotFoundException(id);
    }

    return version;
  }
}
