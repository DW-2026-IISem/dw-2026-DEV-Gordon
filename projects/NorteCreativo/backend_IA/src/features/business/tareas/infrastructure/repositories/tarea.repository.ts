import { Injectable } from '@nestjs/common';
import { Tarea } from '../../domain/entities/tarea.entity.js';
import type { CreateTareaData, ITareaRepository } from '../../domain/interfaces/tarea-repository.interface.js';
import { TareaModel } from '../models/tarea.model.js';

@Injectable()
export class TareaRepository implements ITareaRepository {
  async create(data: CreateTareaData): Promise<Tarea> {
    const row = await TareaModel.create({
      hitoId: data.hitoId,
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
    });

    return this.toDomain(row);
  }

  async findAll(): Promise<Tarea[]> {
    const rows = await TareaModel.findAll({ order: [['id', 'ASC']] });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: number): Promise<Tarea | null> {
    const row = await TareaModel.findByPk(id);
    return row ? this.toDomain(row) : null;
  }

  async findByHitoId(hitoId: number): Promise<Tarea[]> {
    const rows = await TareaModel.findAll({ where: { hitoId }, order: [['id', 'ASC']] });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: TareaModel): Tarea {
    return new Tarea({
      id: row.id,
      hitoId: row.hitoId,
      nombre: row.nombre,
      descripcion: row.descripcion,
      isActive: row.isActive,
    });
  }
}
