import { Injectable } from '@nestjs/common';
import { Entregable } from '../../domain/entities/entregable.entity.js';
import type { CreateEntregableData, IEntregableRepository } from '../../domain/interfaces/entregable-repository.interface.js';
import { EntregableModel } from '../models/entregable.model.js';

@Injectable()
export class EntregableRepository implements IEntregableRepository {
  async create(data: CreateEntregableData): Promise<Entregable> {
    const row = await EntregableModel.create({
      tareaId: data.tareaId,
      observaciones: data.observaciones ?? null,
    });

    return this.toDomain(row);
  }

  async findAll(): Promise<Entregable[]> {
    const rows = await EntregableModel.findAll({ order: [['id', 'ASC']] });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: number): Promise<Entregable | null> {
    const row = await EntregableModel.findByPk(id);
    return row ? this.toDomain(row) : null;
  }

  async findByTareaId(tareaId: number): Promise<Entregable[]> {
    const rows = await EntregableModel.findAll({ where: { tareaId }, order: [['id', 'ASC']] });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: EntregableModel): Entregable {
    return new Entregable({
      id: row.id,
      tareaId: row.tareaId,
      fechaInicio: row.fechaInicio,
      fechaFin: row.fechaFin,
      total: row.total === null ? null : Number(row.total),
      estado: row.estado,
      observaciones: row.observaciones,
    });
  }
}
