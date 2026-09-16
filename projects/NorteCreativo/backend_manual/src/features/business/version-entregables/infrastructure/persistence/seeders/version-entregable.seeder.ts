import { Inject, Injectable, Logger } from "@nestjs/common";
import { ENTREGABLE_REPOSITORY } from '../../../../entregables/domain/interfaces/entregable.repository.js';
import type { IEntregableRepository } from '../../../../entregables/domain/interfaces/entregable.repository.js';
import { VersionEntregable } from '../../../domain/entities/version-entregable.entity.js';
import { VERSION_ENTREGABLE_REPOSITORY } from '../../../domain/interfaces/version-entregable.repository.js';
import type { IVersionEntregableRepository } from '../../../domain/interfaces/version-entregable.repository.js';

@Injectable()
export class VersionEntregableSeeder {
  private readonly logger = new Logger(VersionEntregableSeeder.name);

  constructor(
    @Inject(VERSION_ENTREGABLE_REPOSITORY)
    private readonly versionRepo: IVersionEntregableRepository,
    @Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepo: IEntregableRepository,
  ) {}

  async seed(): Promise<void> {
    const { items: entregables } = await this.entregableRepo.findAll(1, 100);
    const entregable = entregables[0];
    if (!entregable || entregable.id === null) {
      this.logger.warn('Seeder version-entregables: sin entregable demo; no se siembra');
      return;
    }
    const existentes = await this.versionRepo.findByEntregableId(entregable.id);
    if (existentes.length > 0) {
      this.logger.log('Seeder version-entregables: ya existía la versión demo (idempotente)');
      return;
    }
    await this.versionRepo.create(
      new VersionEntregable({
        entregableId: entregable.id,
        numeroVersion: 1,
        fechaInicio: new Date(),
        observaciones: 'Primera versión para revisión del cliente',
        estado: 'EN_REVISION',
      }),
    );
    this.logger.log('Seeder version-entregables: versión demo creada');
  }
}
