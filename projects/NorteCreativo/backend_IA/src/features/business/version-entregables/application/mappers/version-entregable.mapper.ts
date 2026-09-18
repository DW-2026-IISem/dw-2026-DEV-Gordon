import type { EstadoVersionEntregable, VersionEntregable } from '../../domain/entities/version-entregable.entity.js';

export interface VersionEntregableResponse {
  id: number;
  entregableId: number;
  numeroVersion: number;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  total: number | null;
  estado: EstadoVersionEntregable;
  observaciones: string | null;
}

export class VersionEntregableMapper {
  static toResponse(version: VersionEntregable): VersionEntregableResponse {
    return {
      id: version.id as number,
      entregableId: version.entregableId,
      numeroVersion: version.numeroVersion,
      fechaInicio: version.fechaInicio,
      fechaFin: version.fechaFin,
      total: version.total,
      estado: version.estado,
      observaciones: version.observaciones,
    };
  }
}
