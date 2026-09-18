import { Module } from '@nestjs/common';
import { EntregablesModule } from '../entregables/entregables.module.js';
import { HitosModule } from '../hitos/hitos.module.js';
import { TareasModule } from '../tareas/tareas.module.js';
import { VersionEntregablesModule } from '../version-entregables/version-entregables.module.js';
import { GetAprobacionByIdUseCase } from './application/use-cases/get-aprobacion-by-id.use-case.js';
import { RegistrarAprobacionUseCase } from './application/use-cases/registrar-aprobacion.use-case.js';
import { APROBACION_REPOSITORY } from './domain/interfaces/aprobacion-repository.interface.js';
import { AprobacionRepository } from './infrastructure/repositories/aprobacion.repository.js';
import { AprobacionesController } from './presentation/controllers/aprobaciones.controller.js';

@Module({
  imports: [VersionEntregablesModule, EntregablesModule, TareasModule, HitosModule],
  controllers: [AprobacionesController],
  providers: [
    RegistrarAprobacionUseCase,
    GetAprobacionByIdUseCase,
    { provide: APROBACION_REPOSITORY, useClass: AprobacionRepository },
  ],
})
export class AprobacionesModule {}
