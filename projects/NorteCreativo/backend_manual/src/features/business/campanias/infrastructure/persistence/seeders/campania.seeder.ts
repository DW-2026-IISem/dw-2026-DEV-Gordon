import { Inject, Injectable, Logger } from "@nestjs/common";
import { CLIENTE_REPOSITORY } from '../../../../clientes/domain/interfaces/cliente.repository.js';
import type { IClienteRepository } from '../../../../clientes/domain/interfaces/cliente.repository.js';
import { Campania } from '../../../domain/entities/campania.entity.js';
import { CAMPANIA_REPOSITORY } from '../../../domain/interfaces/campania.repository.js';
import type { ICampaniaRepository } from '../../../domain/interfaces/campania.repository.js';

@Injectable()
export class CampaniaSeeder {
  private readonly logger = new Logger(CampaniaSeeder.name);

  constructor(
    @Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepo: ICampaniaRepository,
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
  ) {}

  async seed(): Promise<void> {
    const { items: clientes } = await this.clienteRepo.findAll(1, 100);
    const cliente = clientes[0];
    if (!cliente || cliente.id === null) {
      this.logger.warn('Seeder campanias: sin cliente demo; no se siembra');
      return;
    }
    const { items: campanias } = await this.campaniaRepo.findAll(1, 100);
    if (campanias.some((c) => c.nombre === 'Carnaval 2026')) {
      this.logger.log('Seeder campanias: ya existía la campaña demo (idempotente)');
      return;
    }
    await this.campaniaRepo.create(
      new Campania({
        clienteId: cliente.id,
        nombre: 'Carnaval 2026',
        descripcion: 'Campaña de carnaval para redes y vallas',
        isActive: true,
      }),
    );
    this.logger.log('Seeder campanias: campaña demo creada');
  }
}
