import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { Cliente } from '../../../domain/entities/cliente.entity.js';
import type { ClienteEstado } from '../../../domain/entities/cliente.entity.js';
import { IClienteRepository } from '../../../domain/interfaces/cliente.repository.js';
import { ClienteModel } from '../models/cliente.model.js';

@Injectable()
export class ClienteRepository implements IClienteRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  private get repo() {
    return this.sequelize.getRepository(ClienteModel);
  }

  async create(cliente: Cliente): Promise<Cliente> {
    const created = await this.repo.create({
      tipoDocumento: cliente.tipoDocumento,
      numeroDocumento: cliente.numeroDocumento,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email,
      estado: cliente.estado,
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

  async findById(id: number): Promise<Cliente | null> {
    const found = await this.repo.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async findByNumeroDocumento(numeroDocumento: string): Promise<Cliente | null> {
    const found = await this.repo.findOne({ where: { numeroDocumento } });
    return found ? this.toDomain(found) : null;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  private toDomain(m: ClienteModel): Cliente {
    return new Cliente({
      id: m.id,
      tipoDocumento: m.tipoDocumento,
      numeroDocumento: m.numeroDocumento,
      nombre: m.nombre,
      telefono: m.telefono ?? null,
      email: m.email ?? null,
      estado: (m.estado as ClienteEstado) ?? 'active',
    });
  }
}
