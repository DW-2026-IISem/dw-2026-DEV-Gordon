import { Hito } from '../../domain/entities/hito.entity.js';
import { CreateHitoDto } from '../dto/create-hito.dto.js';

export class HitoMapper {
  static toEntity(dto: CreateHitoDto): Hito {
    return new Hito({
      campaniaId: dto.campaniaId,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      estado: 'ABIERTO',
    });
  }

  static toResponse(h: Hito) {
    return {
      id: h.id,
      campaniaId: h.campaniaId,
      nombre: h.nombre,
      descripcion: h.descripcion,
      estado: h.estado,
      fechaCierre: h.fechaCierre,
      isActive: h.isActive,
    };
  }
}
