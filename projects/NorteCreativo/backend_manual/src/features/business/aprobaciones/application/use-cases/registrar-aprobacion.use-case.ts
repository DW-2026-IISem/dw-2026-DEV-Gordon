import { Inject, Injectable } from '@nestjs/common';
import { Aprobacion } from '../../domain/entities/aprobacion.entity.js';
import {
  APROBACION_REPOSITORY,
  RegistrarAprobacionResultado,
} from '../../domain/interfaces/aprobacion.repository.js';
import type { IAprobacionRepository } from '../../domain/interfaces/aprobacion.repository.js';
import { CreateAprobacionDto } from '../dto/create-aprobacion.dto.js';

@Injectable()
export class RegistrarAprobacionUseCase {
  constructor(
    @Inject(APROBACION_REPOSITORY) private readonly aprobacionRepo: IAprobacionRepository,
  ) {}

  async execute(dto: CreateAprobacionDto): Promise<RegistrarAprobacionResultado> {
    // RN-05 (simplificada, sin RBAC real todavía): en esta fase no se valida
    // el rol del aprobadorId contra la tabla de roles — eso se añade cuando
    // se implemente RBAC. Aquí solo se registra quién aprobó.
    const aprobacion = new Aprobacion({
      versionEntregableId: dto.versionEntregableId,
      estado: dto.estado,
      aprobadorId: dto.aprobadorId,
      comentario: dto.comentario ?? null,
    });

    // El repositorio hace, en una sola transacción:
    // 1) valida que la versión exista y su hito no esté cerrado (RN-06)
    // 2) inserta la aprobación
    // 3) si es RECHAZADA -> retorna (el hito sigue ABIERTO, RN-01)
    // 4) si es APROBADA -> evalúa si TODOS los entregables del hito están
    //    aprobados (RN-02, vía CierreHitoEvaluator) y, si es así, cierra el hito
    return this.aprobacionRepo.registrarYEvaluarCierre(aprobacion);
  }
}
