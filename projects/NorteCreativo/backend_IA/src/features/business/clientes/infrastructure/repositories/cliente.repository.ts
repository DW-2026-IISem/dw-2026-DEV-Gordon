import { Injectable } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';
import { Cliente } from '../../domain/entities/cliente.entity.js';
import { DocumentoYaExisteException } from '../../domain/exceptions/documento-ya-existe.exception.js';
import type { CreateClienteData, IClienteRepository } from '../../domain/interfaces/cliente-repository.interface.js';
import { ClienteModel } from '../models/cliente.model.js';

@Injectable()
export class ClienteRepository implements IClienteRepository {
  async create(data: CreateClienteData): Promise<Cliente> {
    try {
      const row = await ClienteModel.create({
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        nombre: data.nombre,
        telefono: data.telefono ?? null,
        email: data.email ?? null,
      });

      return this.toDomain(row);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new DocumentoYaExisteException(data.numeroDocumento);
      }

      throw error;
    }
  }

  async findAll(): Promise<Cliente[]> {
    const rows = await ClienteModel.findAll({ order: [['id', 'ASC']] });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: number): Promise<Cliente | null> {
    const row = await ClienteModel.findByPk(id);
    return row ? this.toDomain(row) : null;
  }

  async findByNumeroDocumento(numeroDocumento: string): Promise<Cliente | null> {
    const row = await ClienteModel.findOne({ where: { numeroDocumento } });
    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: ClienteModel): Cliente {
    return new Cliente({
      id: row.id,
      tipoDocumento: row.tipoDocumento,
      numeroDocumento: row.numeroDocumento,
      nombre: row.nombre,
      telefono: row.telefono,
      email: row.email,
      estado: row.estado,
    });
  }
}
