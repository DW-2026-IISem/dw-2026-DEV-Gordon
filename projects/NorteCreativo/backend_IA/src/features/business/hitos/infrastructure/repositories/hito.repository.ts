import { Injectable } from '@nestjs/common';
import type { EstadoHito } from '../../domain/entities/hito.entity.js';
import { Hito } from '../../domain/entities/hito.entity.js';
import { HitoNotFoundException } from '../../domain/exceptions/hito-not-found.exception.js';
import type { CreateHitoData, IHitoRepository } from '../../domain/interfaces/hito-repository.interface.js';
import { HitoModel } from '../models/hito.model.js';

@Injectable()
export class HitoRepository implements IHitoRepository {
  async create(data: CreateHitoData): Promise<Hito> {
    const row = await HitoModel.create({
      campaniaId: data.campaniaId,
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
    });

    return this.toDomain(row);
  }

  async findAll(): Promise<Hito[]> {
    const rows = await HitoModel.findAll({ order: [['id', 'ASC']] });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: number): Promise<Hito | null> {
    const row = await HitoModel.findByPk(id);
    return row ? this.toDomain(row) : null;
  }

  async actualizarEstado(id: number, estado: EstadoHito, fechaCierre: Date | null): Promise<Hito> {
    const row = await HitoModel.findByPk(id);

    if (!row) {
      throw new HitoNotFoundException(id);
    }

    row.estado = estado;
    row.fechaCierre = fechaCierre;
    await row.save();

    return this.toDomain(row);
  }

  private toDomain(row: HitoModel): Hito {
    return new Hito({
      id: row.id,
      campaniaId: row.campaniaId,
      nombre: row.nombre,
      descripcion: row.descripcion,
      estado: row.estado,
      fechaCierre: row.fechaCierre,
      isActive: row.isActive,
    });
  }
}
