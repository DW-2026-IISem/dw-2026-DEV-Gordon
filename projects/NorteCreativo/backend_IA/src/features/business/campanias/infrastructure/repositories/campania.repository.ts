import { Injectable } from '@nestjs/common';
import { Campania } from '../../domain/entities/campania.entity.js';
import type { CreateCampaniaData, ICampaniaRepository } from '../../domain/interfaces/campania-repository.interface.js';
import { CampaniaModel } from '../models/campania.model.js';

@Injectable()
export class CampaniaRepository implements ICampaniaRepository {
  async create(data: CreateCampaniaData): Promise<Campania> {
    const row = await CampaniaModel.create({
      clienteId: data.clienteId,
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
    });

    return this.toDomain(row);
  }

  async findAll(): Promise<Campania[]> {
    const rows = await CampaniaModel.findAll({ order: [['id', 'ASC']] });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: number): Promise<Campania | null> {
    const row = await CampaniaModel.findByPk(id);
    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: CampaniaModel): Campania {
    return new Campania({
      id: row.id,
      clienteId: row.clienteId,
      nombre: row.nombre,
      descripcion: row.descripcion,
      isActive: row.isActive,
    });
  }
}
