import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { Tarea } from '../../../domain/entities/tarea.entity.js';
import { ITareaRepository } from '../../../domain/interfaces/tarea.repository.js';
import { TareaModel } from '../models/tarea.model.js';

@Injectable()
export class TareaRepository implements ITareaRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  private get repo() {
    return this.sequelize.getRepository(TareaModel);
  }

  async create(tarea: Tarea): Promise<Tarea> {
    const created = await this.repo.create({
      hitoId: tarea.hitoId,
      nombre: tarea.nombre,
      descripcion: tarea.descripcion,
      isActive: tarea.isActive,
    });
    return this.toDomain(created);
  }

  async findAll(page: number, limit: number) {
    const { rows, count } = await this.repo.findAndCountAll({
      offset: (page - 1) * limit,
      limit,
      order: [['id', 'ASC']],
    });
    return { items: rows.map((r) => this.toDomain(r)), total: count };
  }

  async findById(id: number): Promise<Tarea | null> {
    const found = await this.repo.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async findByHitoId(hitoId: number): Promise<Tarea[]> {
    const rows = await this.repo.findAll({ where: { hitoId }, order: [['id', 'ASC']] });
    return rows.map((r) => this.toDomain(r));
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  private toDomain(m: TareaModel): Tarea {
    return new Tarea({
      id: m.id,
      hitoId: m.hitoId,
      nombre: m.nombre,
      descripcion: m.descripcion ?? null,
      isActive: m.isActive,
    });
  }
}
