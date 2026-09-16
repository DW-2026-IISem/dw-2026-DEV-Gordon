import { Inject, Injectable } from '@nestjs/common';
import { VersionNoEncontradaException } from '../../domain/exceptions/version-no-encontrada.exception.js';
import { APROBACION_REPOSITORY } from '../../domain/interfaces/aprobacion.repository.js';
import type { IAprobacionRepository } from '../../domain/interfaces/aprobacion.repository.js';
import type { Aprobacion } from '../../domain/entities/aprobacion.entity.js';

@Injectable()
export class GetAprobacionByIdUseCase {
  constructor(
    @Inject(APROBACION_REPOSITORY) private readonly aprobacionRepo: IAprobacionRepository,
  ) {}

  async execute(id: number): Promise<Aprobacion> {
    const aprobacion = await this.aprobacionRepo.findById(id);
    if (!aprobacion) {
      throw new VersionNoEncontradaException(id);
    }
    return aprobacion;
  }
}
