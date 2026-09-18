import { Inject, Injectable } from '@nestjs/common';
import type { Aprobacion } from '../../domain/entities/aprobacion.entity.js';
import { AprobacionNotFoundException } from '../../domain/exceptions/aprobacion-not-found.exception.js';
import { APROBACION_REPOSITORY, type IAprobacionRepository } from '../../domain/interfaces/aprobacion-repository.interface.js';

@Injectable()
export class GetAprobacionByIdUseCase {
  constructor(@Inject(APROBACION_REPOSITORY) private readonly aprobacionRepository: IAprobacionRepository) {}

  async execute(id: number): Promise<Aprobacion> {
    const aprobacion = await this.aprobacionRepository.findById(id);

    if (!aprobacion) {
      throw new AprobacionNotFoundException(id);
    }

    return aprobacion;
  }
}
