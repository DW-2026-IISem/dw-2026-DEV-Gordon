import { Injectable } from '@nestjs/common';
import { VersionEntregable } from '../../domain/entities/version-entregable.entity.js';
import type {
  CreateVersionEntregableData,
  IVersionEntregableRepository,
} from '../../domain/interfaces/version-entregable-repository.interface.js';
import { VersionEntregableModel } from '../models/version-entregable.model.js';

@Injectable()
export class VersionEntregableRepository implements IVersionEntregableRepository {
  async create(data: CreateVersionEntregableData): Promise<VersionEntregable> {
    const row = await VersionEntregableModel.create({
      entregableId: data.entregableId,
      numeroVersion: data.numeroVersion,
      observaciones: data.observaciones ?? null,
    });

    return this.toDomain(row);
  }

  async findById(id: number): Promise<VersionEntregable | null> {
    const row = await VersionEntregableModel.findByPk(id);
    return row ? this.toDomain(row) : null;
  }

  async findByEntregableId(entregableId: number): Promise<VersionEntregable[]> {
    const rows = await VersionEntregableModel.findAll({
      where: { entregableId },
      order: [['numeroVersion', 'ASC']],
    });

    return rows.map((row) => this.toDomain(row));
  }

  async findUltimaVersion(entregableId: number): Promise<VersionEntregable | null> {
    const row = await VersionEntregableModel.findOne({
      where: { entregableId },
      order: [['numeroVersion', 'DESC']],
    });

    return row ? this.toDomain(row) : null;
  }

  async countByEntregableId(entregableId: number): Promise<number> {
    return VersionEntregableModel.count({ where: { entregableId } });
  }

  private toDomain(row: VersionEntregableModel): VersionEntregable {
    return new VersionEntregable({
      id: row.id,
      entregableId: row.entregableId,
      numeroVersion: row.numeroVersion,
      fechaInicio: row.fechaInicio,
      fechaFin: row.fechaFin,
      total: row.total === null ? null : Number(row.total),
      estado: row.estado,
      observaciones: row.observaciones,
    });
  }
}
