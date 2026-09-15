import { Inject, Injectable, Logger } from "@nestjs/common";
import { CAMPANIA_REPOSITORY } from '../../../../campanias/domain/interfaces/campania.repository.js';
import type { ICampaniaRepository } from '../../../../campanias/domain/interfaces/campania.repository.js';
import { Hito } from '../../../domain/entities/hito.entity.js';
import { HITO_REPOSITORY } from '../../../domain/interfaces/hito.repository.js';
import type { IHitoRepository } from '../../../domain/interfaces/hito.repository.js';

@Injectable()
export class HitoSeeder {
  private readonly logger = new Logger(HitoSeeder.name);

  constructor(
    @Inject(HITO_REPOSITORY) private readonly hitoRepo: IHitoRepository,
    @Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepo: ICampaniaRepository,
  ) {}

  async seed(): Promise<void> {
    const { items: campanias } = await this.campaniaRepo.findAll(1, 100);
    const campania = campanias.find((c) => c.isActive);
    if (!campania || campania.id === null) {
      this.logger.warn('Seeder hitos: sin campaña activa; no se siembra');
      return;
    }
    const { items: hitos } = await this.hitoRepo.findAll(1, 100);
    if (hitos.some((h) => h.nombre === 'Piezas para redes sociales')) {
      this.logger.log('Seeder hitos: ya existía el hito demo (idempotente)');
      return;
    }
    await this.hitoRepo.create(
      new Hito({
        campaniaId: campania.id,
        nombre: 'Piezas para redes sociales',
        descripcion: 'Diseño de post e historias para Instagram',
        estado: 'ABIERTO',
      }),
    );
    this.logger.log('Seeder hitos: hito demo creado');
  }
}
