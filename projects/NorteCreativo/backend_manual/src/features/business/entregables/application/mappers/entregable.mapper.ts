import { Entregable } from '../../domain/entities/entregable.entity.js';
import { CreateEntregableDto } from '../dto/create-entregable.dto.js';

export class EntregableMapper {
  static toEntity(dto: CreateEntregableDto): Entregable {
    return new Entregable({
      tareaId: dto.tareaId,
      fechaInicio: new Date(),
      observaciones: dto.observaciones ?? null,
      estado: 'EN_PROCESO',
    });
  }

  static toResponse(e: Entregable) {
    return {
      id: e.id,
      tareaId: e.tareaId,
      fechaInicio: e.fechaInicio,
      fechaFin: e.fechaFin,
      total: e.total,
      estado: e.estado,
      observaciones: e.observaciones,
    };
  }
}
