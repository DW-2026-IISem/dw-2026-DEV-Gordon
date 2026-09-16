import { Module } from '@nestjs/common';
import { TareasModule } from '../tareas/tareas.module.js';
import { CreateEntregableUseCase } from './application/use-cases/create-entregable.use-case.js';
import { GetEntregableByIdUseCase } from './application/use-cases/get-entregable-by-id.use-case.js';
import { ListEntregablesUseCase } from './application/use-cases/list-entregables.use-case.js';
import { ENTREGABLE_REPOSITORY } from './domain/interfaces/entregable.repository.js';
import { EntregableRepository } from './infrastructure/persistence/repositories/entregable.repository.js';
import { EntregableSeeder } from './infrastructure/persistence/seeders/entregable.seeder.js';
import { EntregablesController } from './presentation/http/controllers/entregables.controller.js';

@Module({
  imports: [TareasModule],
  controllers: [EntregablesController],
  providers: [
    CreateEntregableUseCase,
    ListEntregablesUseCase,
    GetEntregableByIdUseCase,
    EntregableSeeder,
    { provide: ENTREGABLE_REPOSITORY, useClass: EntregableRepository },
  ],
  exports: [ENTREGABLE_REPOSITORY, EntregableSeeder],
})
export class EntregablesModule {}
