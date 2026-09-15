import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { Hito } from '../../../domain/entities/hito.entity.js';
import type { HitoEstado } from '../../../domain/entities/hito.entity.js';
import { IHitoRepository } from '../../../domain/interfaces/hito.repository.js';
import { HitoModel } from '../models/hito.model.js';

@Injectable()
export class HitoRepository implements IHitoRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  private get repo() {
    return this.sequelize.getRepository(HitoModel);
  }

  async create(hito: Hito): Promise<Hito> {
    const created = await this.repo.create({
      campaniaId: hito.campaniaId,
      nombre: hito.nombre,
      descripcion: hito.descripcion,
      estado: hito.estado,
      fechaCierre: hito.fechaCierre,
      isActive: hito.isActive,
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

  async findById(id: number): Promise<Hito | null> {
    const found = await this.repo.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async actualizarEstado(id: number, estado: string, fechaCierre: Date | null): Promise<void> {
    await this.repo.update({ estado, fechaCierre }, { where: { id } });
  }

  private toDomain(m: HitoModel): Hito {
    return new Hito({
      id: m.id,
      campaniaId: m.campaniaId,
      nombre: m.nombre,
      descripcion: m.descripcion ?? null,
      estado: (m.estado as HitoEstado) ?? 'ABIERTO',
      fechaCierre: m.fechaCierre ?? null,
      isActive: m.isActive,
    });
  }
}
