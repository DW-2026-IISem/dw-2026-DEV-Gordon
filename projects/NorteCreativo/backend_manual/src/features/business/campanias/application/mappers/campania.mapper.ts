import { Campania } from '../../domain/entities/campania.entity.js';
import { CreateCampaniaDto } from '../dto/create-campania.dto.js';

export class CampaniaMapper {
  static toEntity(dto: CreateCampaniaDto): Campania {
    return new Campania({
      clienteId: dto.clienteId,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      isActive: true,
    });
  }

  static toResponse(c: Campania) {
    return {
      id: c.id,
      clienteId: c.clienteId,
      nombre: c.nombre,
      descripcion: c.descripcion,
      isActive: c.isActive,
    };
  }
}
