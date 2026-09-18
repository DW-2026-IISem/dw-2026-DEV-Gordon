import type { Entregable } from '../../domain/entities/entregable.entity.js';

export interface EntregableResponse {
  id: number;
  tareaId: number;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  total: number | null;
  estado: string;
  observaciones: string | null;
}

export class EntregableMapper {
  static toResponse(entregable: Entregable): EntregableResponse {
    return {
      id: entregable.id as number,
      tareaId: entregable.tareaId,
      fechaInicio: entregable.fechaInicio,
      fechaFin: entregable.fechaFin,
      total: entregable.total,
      estado: entregable.estado,
      observaciones: entregable.observaciones,
    };
  }

  static toResponseList(entregables: Entregable[]): EntregableResponse[] {
    return entregables.map((entregable) => EntregableMapper.toResponse(entregable));
  }
}
