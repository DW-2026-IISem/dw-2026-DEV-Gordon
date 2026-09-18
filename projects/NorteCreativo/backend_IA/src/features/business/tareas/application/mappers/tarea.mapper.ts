import type { Tarea } from '../../domain/entities/tarea.entity.js';

export interface TareaResponse {
  id: number;
  hitoId: number;
  nombre: string;
  descripcion: string | null;
  isActive: boolean;
}

export class TareaMapper {
  static toResponse(tarea: Tarea): TareaResponse {
    return {
      id: tarea.id as number,
      hitoId: tarea.hitoId,
      nombre: tarea.nombre,
      descripcion: tarea.descripcion,
      isActive: tarea.isActive,
    };
  }

  static toResponseList(tareas: Tarea[]): TareaResponse[] {
    return tareas.map((tarea) => TareaMapper.toResponse(tarea));
  }
}
