import { Module } from '@nestjs/common';
import { HitosModule } from '../hitos/hitos.module.js';
import { CreateTareaUseCase } from './application/use-cases/create-tarea.use-case.js';
import { GetTareaByIdUseCase } from './application/use-cases/get-tarea-by-id.use-case.js';
import { ListTareasUseCase } from './application/use-cases/list-tareas.use-case.js';
import { TAREA_REPOSITORY } from './domain/interfaces/tarea.repository.js';
import { TareaRepository } from './infrastructure/persistence/repositories/tarea.repository.js';
import { TareaSeeder } from './infrastructure/persistence/seeders/tarea.seeder.js';
import { TareasController } from './presentation/http/controllers/tareas.controller.js';

@Module({
  imports: [HitosModule],
  controllers: [TareasController],
  providers: [
    CreateTareaUseCase,
    ListTareasUseCase,
    GetTareaByIdUseCase,
    TareaSeeder,
    { provide: TAREA_REPOSITORY, useClass: TareaRepository },
  ],
  exports: [TAREA_REPOSITORY, TareaSeeder],
})
export class TareasModule {}
