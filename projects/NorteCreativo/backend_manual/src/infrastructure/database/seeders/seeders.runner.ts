import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CampaniaSeeder } from '../../../features/business/campanias/infrastructure/persistence/seeders/campania.seeder.js';
import { ClienteSeeder } from '../../../features/business/clientes/infrastructure/persistence/seeders/cliente.seeder.js';
import { EntregableSeeder } from '../../../features/business/entregables/infrastructure/persistence/seeders/entregable.seeder.js';
import { HitoSeeder } from '../../../features/business/hitos/infrastructure/persistence/seeders/hito.seeder.js';
import { TareaSeeder } from '../../../features/business/tareas/infrastructure/persistence/seeders/tarea.seeder.js';
import { VersionEntregableSeeder } from '../../../features/business/version-entregables/infrastructure/persistence/seeders/version-entregable.seeder.js';

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
    await this.clienteSeeder.seed();
    await this.campaniaSeeder.seed();
    await this.hitoSeeder.seed();
    await this.tareaSeeder.seed();
    await this.entregableSeeder.seed();
    await this.versionEntregableSeeder.seed();
    this.logger.log(
      'Seeders business ejecutados en orden: clientes → campanias → hitos → tareas → entregables → version-entregables',
    );
  }
}
