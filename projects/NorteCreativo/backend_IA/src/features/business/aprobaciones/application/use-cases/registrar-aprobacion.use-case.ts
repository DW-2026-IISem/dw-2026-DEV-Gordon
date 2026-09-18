import { Inject, Injectable } from '@nestjs/common';
import {
  APROBACION_REPOSITORY,
  type IAprobacionRepository,
  type RegistrarAprobacionResultado,
} from '../../domain/interfaces/aprobacion-repository.interface.js';
import type { CreateAprobacionDto } from '../dtos/create-aprobacion.dto.js';

@Injectable()
export class RegistrarAprobacionUseCase {
  constructor(@Inject(APROBACION_REPOSITORY) private readonly aprobacionRepository: IAprobacionRepository) {}

  /**
   * Delega TODO el flujo (validar versión, bloquear el hito, registrar la
   * aprobación y evaluar el cierre) al repositorio, que lo ejecuta como una
   * única transacción de Sequelize.
   */
  async execute(dto: CreateAprobacionDto): Promise<RegistrarAprobacionResultado> {
    return this.aprobacionRepository.registrarYEvaluarCierre({
      versionEntregableId: dto.versionEntregableId,
      estado: dto.estado,
      aprobadorId: dto.aprobadorId,
      comentario: dto.comentario,
    });
  }
}
