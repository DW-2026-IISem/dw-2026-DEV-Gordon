import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { VersionEntregable } from '../../../domain/entities/version-entregable.entity.js';
import type { VersionEstado } from '../../../domain/entities/version-entregable.entity.js';
import { IVersionEntregableRepository } from '../../../domain/interfaces/version-entregable.repository.js';
import { VersionEntregableModel } from '../models/version-entregable.model.js';

@Injectable()
export class VersionEntregableRepository implements IVersionEntregableRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  private get repo() {
    return this.sequelize.getRepository(VersionEntregableModel);
  }

  async create(version: VersionEntregable): Promise<VersionEntregable> {
    const created = await this.repo.create({
      entregableId: version.entregableId,
      numeroVersion: version.numeroVersion,
      fechaInicio: version.fechaInicio,
      fechaFin: version.fechaFin,
      total: version.total,
      estado: version.estado,
      observaciones: version.observaciones,
    });
    return this.toDomain(created);
  }

  async findById(id: number): Promise<VersionEntregable | null> {
    const found = await this.repo.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async findByEntregableId(entregableId: number): Promise<VersionEntregable[]> {
    const rows = await this.repo.findAll({
      where: { entregableId },
      order: [['numeroVersion', 'ASC']],
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findUltimaVersion(entregableId: number): Promise<VersionEntregable | null> {
    const found = await this.repo.findOne({
      where: { entregableId },
      order: [['numeroVersion', 'DESC']],
    });
    return found ? this.toDomain(found) : null;
  }

  async countByEntregableId(entregableId: number): Promise<number> {
    return this.repo.count({ where: { entregableId } });
  }

  private toDomain(m: VersionEntregableModel): VersionEntregable {
    return new VersionEntregable({
      id: m.id,
      entregableId: m.entregableId,
      numeroVersion: m.numeroVersion,
      fechaInicio: m.fechaInicio ?? null,
      fechaFin: m.fechaFin ?? null,
      total: m.total ? Number(m.total) : null,
      estado: (m.estado as VersionEstado) ?? 'EN_REVISION',
      observaciones: m.observaciones ?? null,
    });
  }
}
