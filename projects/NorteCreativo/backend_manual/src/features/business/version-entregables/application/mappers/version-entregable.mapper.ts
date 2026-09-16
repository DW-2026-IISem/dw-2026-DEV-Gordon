import { VersionEntregable } from '../../domain/entities/version-entregable.entity.js';

export class VersionEntregableMapper {
  static toResponse(v: VersionEntregable) {
    return {
      id: v.id,
      entregableId: v.entregableId,
      numeroVersion: v.numeroVersion,
      fechaInicio: v.fechaInicio,
      fechaFin: v.fechaFin,
      total: v.total,
      estado: v.estado,
      observaciones: v.observaciones,
    };
  }
}
