import { Module } from '@nestjs/common';
import { AprobacionesModule } from './aprobaciones/aprobaciones.module.js';
import { CampaniasModule } from './campanias/campanias.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { EntregablesModule } from './entregables/entregables.module.js';
import { HitosModule } from './hitos/hitos.module.js';
import { TareasModule } from './tareas/tareas.module.js';
import { VersionEntregablesModule } from './version-entregables/version-entregables.module.js';

@Module({
  imports: [
    ClientesModule,
    CampaniasModule,
    HitosModule,
    TareasModule,
    EntregablesModule,
    VersionEntregablesModule,
    AprobacionesModule,
  ],
  exports: [
    ClientesModule,
    CampaniasModule,
    HitosModule,
    TareasModule,
    EntregablesModule,
    VersionEntregablesModule,
    AprobacionesModule,
  ],
})
export class BusinessModule {}
