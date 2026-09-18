import { Module } from '@nestjs/common';
import { CampaniasModule } from '../../../features/business/campanias/campanias.module.js';
import { ClientesModule } from '../../../features/business/clientes/clientes.module.js';
import { EntregablesModule } from '../../../features/business/entregables/entregables.module.js';
import { HitosModule } from '../../../features/business/hitos/hitos.module.js';
import { TareasModule } from '../../../features/business/tareas/tareas.module.js';
import { VersionEntregablesModule } from '../../../features/business/version-entregables/version-entregables.module.js';
import { SeedersRunner } from './seeders-runner.js';

@Module({
  imports: [ClientesModule, CampaniasModule, HitosModule, TareasModule, EntregablesModule, VersionEntregablesModule],
  providers: [SeedersRunner],
})
export class SeedersModule {}
