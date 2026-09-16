import { Tarea } from '../../domain/entities/tarea.entity.js';
import { CreateTareaDto } from '../dto/create-tarea.dto.js';

export class TareaMapper {
  static toEntity(dto: CreateTareaDto): Tarea {
    return new Tarea({
      hitoId: dto.hitoId,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      isActive: true,
    });
  }

  static toResponse(t: Tarea) {
    return {
      id: t.id,
      hitoId: t.hitoId,
      nombre: t.nombre,
      descripcion: t.descripcion,
      isActive: t.isActive,
    };
  }
}
