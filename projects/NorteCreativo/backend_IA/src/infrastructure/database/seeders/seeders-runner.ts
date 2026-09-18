import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { CampaniaSeeder } from '../../../features/business/campanias/infrastructure/seeders/campania.seeder.js';
import { ClienteSeeder } from '../../../features/business/clientes/infrastructure/seeders/cliente.seeder.js';
import { EntregableSeeder } from '../../../features/business/entregables/infrastructure/seeders/entregable.seeder.js';
import { HitoSeeder } from '../../../features/business/hitos/infrastructure/seeders/hito.seeder.js';
import { TareaSeeder } from '../../../features/business/tareas/infrastructure/seeders/tarea.seeder.js';
import { VersionEntregableSeeder } from '../../../features/business/version-entregables/infrastructure/seeders/version-entregable.seeder.js';

/**
 * Orquesta los seeders de negocio en el único orden válido de dependencia
 * (cada uno busca el registro demo del anterior). Todos son idempotentes
 * (`findOrCreate`), así que correr esto en cada arranque no duplica nada.
 * Aprobaciones no tiene seeder a propósito (no hay un dato demo natural que
 * no altere el estado ABIERTO/CERRADO del hito demo).
 */
@Injectable()
export class SeedersRunner implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedersRunner.name);

  constructor(
    private readonly clienteSeeder: ClienteSeeder,
    private readonly campaniaSeeder: CampaniaSeeder,
    private readonly hitoSeeder: HitoSeeder,
    private readonly tareaSeeder: TareaSeeder,
    private readonly entregableSeeder: EntregableSeeder,
    private readonly versionEntregableSeeder: VersionEntregableSeeder,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Sembrando datos demo: clientes → campañas → hitos → tareas → entregables → version-entregables');

    await this.clienteSeeder.seed();
    await this.campaniaSeeder.seed();
    await this.hitoSeeder.seed();
    await this.tareaSeeder.seed();
    await this.entregableSeeder.seed();
    await this.versionEntregableSeeder.seed();

    this.logger.log('Seeders completados.');
  }
}
