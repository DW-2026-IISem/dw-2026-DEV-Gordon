import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cliente } from '../../../domain/entities/cliente.entity.js';
import { CLIENTE_REPOSITORY } from '../../../domain/interfaces/cliente.repository.js';
import type { IClienteRepository } from '../../../domain/interfaces/cliente.repository.js';

@Injectable()
export class ClienteSeeder {
  private readonly logger = new Logger(ClienteSeeder.name);

  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepository: IClienteRepository,
  ) {}

  async seed(): Promise<void> {
    const numeroDocumento = '900123456-7';
    const existing = await this.clienteRepository.findByNumeroDocumento(numeroDocumento);
    if (existing) {
      this.logger.log('Seeder clientes: ya existía el cliente demo (idempotente)');
      return;
    }
    await this.clienteRepository.create(
      new Cliente({
        tipoDocumento: 'NIT',
        numeroDocumento,
        nombre: 'Postobón S.A.',
        telefono: '3001234567',
        email: 'contacto@postobon.com',
        estado: 'active',
      }),
    );
    this.logger.log('Seeder clientes: cliente demo creado');
  }
}
