import type { Campania } from '../../domain/entities/campania.entity.js';

export interface CampaniaResponse {
  id: number;
  clienteId: number;
  nombre: string;
  descripcion: string | null;
  isActive: boolean;
}

export class CampaniaMapper {
  static toResponse(campania: Campania): CampaniaResponse {
    return {
      id: campania.id as number,
      clienteId: campania.clienteId,
      nombre: campania.nombre,
      descripcion: campania.descripcion,
      isActive: campania.isActive,
    };
  }

  static toResponseList(campanias: Campania[]): CampaniaResponse[] {
    return campanias.map((campania) => CampaniaMapper.toResponse(campania));
  }
}
