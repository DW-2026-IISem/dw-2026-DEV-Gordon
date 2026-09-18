import type { EstadoHito, Hito } from '../../domain/entities/hito.entity.js';

export interface HitoResponse {
  id: number;
  campaniaId: number;
  nombre: string;
  descripcion: string | null;
  estado: EstadoHito;
  fechaCierre: Date | null;
  isActive: boolean;
}

export class HitoMapper {
  static toResponse(hito: Hito): HitoResponse {
    return {
      id: hito.id as number,
      campaniaId: hito.campaniaId,
      nombre: hito.nombre,
      descripcion: hito.descripcion,
      estado: hito.estado,
      fechaCierre: hito.fechaCierre,
      isActive: hito.isActive,
    };
  }

  static toResponseList(hitos: Hito[]): HitoResponse[] {
    return hitos.map((hito) => HitoMapper.toResponse(hito));
  }
}
