import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { Campania } from '../../../domain/entities/campania.entity.js';
import { ICampaniaRepository } from '../../../domain/interfaces/campania.repository.js';
import { CampaniaModel } from '../models/campania.model.js';

@Injectable()
export class CampaniaRepository implements ICampaniaRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  private get repo() {
    return this.sequelize.getRepository(CampaniaModel);
  }

  async create(campania: Campania): Promise<Campania> {
    const created = await this.repo.create({
      clienteId: campania.clienteId,
      nombre: campania.nombre,
      descripcion: campania.descripcion,
      isActive: campania.isActive,
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

  async findById(id: number): Promise<Campania | null> {
    const found = await this.repo.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  private toDomain(m: CampaniaModel): Campania {
    return new Campania({
      id: m.id,
      clienteId: m.clienteId,
      nombre: m.nombre,
      descripcion: m.descripcion ?? null,
      isActive: m.isActive,
    });
  }
}
