import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { Entregable } from '../../../domain/entities/entregable.entity.js';
import type { EntregableEstado } from '../../../domain/entities/entregable.entity.js';
import { IEntregableRepository } from '../../../domain/interfaces/entregable.repository.js';
import { EntregableModel } from '../models/entregable.model.js';

@Injectable()
export class EntregableRepository implements IEntregableRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  private get repo() {
    return this.sequelize.getRepository(EntregableModel);
  }

  async create(entregable: Entregable): Promise<Entregable> {
    const created = await this.repo.create({
      tareaId: entregable.tareaId,
      fechaInicio: entregable.fechaInicio,
      fechaFin: entregable.fechaFin,
      total: entregable.total,
      estado: entregable.estado,
      observaciones: entregable.observaciones,
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

  async findById(id: number): Promise<Entregable | null> {
    const found = await this.repo.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async findByTareaId(tareaId: number): Promise<Entregable[]> {
    const rows = await this.repo.findAll({ where: { tareaId }, order: [['id', 'ASC']] });
    return rows.map((r) => this.toDomain(r));
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  private toDomain(m: EntregableModel): Entregable {
    return new Entregable({
      id: m.id,
      tareaId: m.tareaId,
      fechaInicio: m.fechaInicio ?? null,
      fechaFin: m.fechaFin ?? null,
      total: m.total ? Number(m.total) : null,
      estado: (m.estado as EntregableEstado) ?? 'EN_PROCESO',
      observaciones: m.observaciones ?? null,
    });
  }
}
