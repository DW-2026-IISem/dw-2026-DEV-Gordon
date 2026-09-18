import type { Aprobacion, EstadoAprobacion } from '../../domain/entities/aprobacion.entity.js';
import type { RegistrarAprobacionResultado } from '../../domain/interfaces/aprobacion-repository.interface.js';

export interface AprobacionResponse {
  id: number;
  versionEntregableId: number;
  estado: EstadoAprobacion;
  aprobadorId: number;
  comentario: string | null;
  fecha: Date;
}

export interface RegistrarAprobacionResponse extends AprobacionResponse {
  hitoCerrado: boolean;
  hitoId: number;
  fechaCierre: Date | null;
}

export class AprobacionMapper {
  static toResponse(aprobacion: Aprobacion): AprobacionResponse {
    return {
      id: aprobacion.id as number,
      versionEntregableId: aprobacion.versionEntregableId,
      estado: aprobacion.estado,
      aprobadorId: aprobacion.aprobadorId,
      comentario: aprobacion.comentario,
      fecha: aprobacion.fecha,
    };
  }

  static toRegistrarResponse(resultado: RegistrarAprobacionResultado): RegistrarAprobacionResponse {
    return {
      ...AprobacionMapper.toResponse(resultado.aprobacion),
      hitoCerrado: resultado.hitoCerrado,
      hitoId: resultado.hitoId,
      fechaCierre: resultado.fechaCierre,
    };
  }
}
