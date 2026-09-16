import { RegistrarAprobacionResultado } from '../../domain/interfaces/aprobacion.repository.js';

export class AprobacionMapper {
  static toResponse(resultado: RegistrarAprobacionResultado) {
    return {
      id: resultado.aprobacion.id,
      versionEntregableId: resultado.aprobacion.versionEntregableId,
      estado: resultado.aprobacion.estado,
      aprobadorId: resultado.aprobacion.aprobadorId,
      comentario: resultado.aprobacion.comentario,
      fecha: resultado.aprobacion.fecha,
      hitoCerrado: resultado.hitoCerrado,
      hitoId: resultado.hitoId,
      fechaCierre: resultado.fechaCierre,
    };
  }
}
