import { Module } from '@nestjs/common';
import { CampaniasModule } from '../campanias/campanias.module.js';
import { CreateHitoUseCase } from './application/use-cases/create-hito.use-case.js';
import { GetHitoByIdUseCase } from './application/use-cases/get-hito-by-id.use-case.js';
import { ListHitosUseCase } from './application/use-cases/list-hitos.use-case.js';
import { HITO_REPOSITORY } from './domain/interfaces/hito.repository.js';
import { HitoRepository } from './infrastructure/persistence/repositories/hito.repository.js';
import { HitoSeeder } from './infrastructure/persistence/seeders/hito.seeder.js';
import { HitosController } from './presentation/http/controllers/hitos.controller.js';

@Module({
  imports: [CampaniasModule],
  controllers: [HitosController],
  providers: [
    CreateHitoUseCase,
    ListHitosUseCase,
    GetHitoByIdUseCase,
    HitoSeeder,
    { provide: HITO_REPOSITORY, useClass: HitoRepository },
  ],
  exports: [HITO_REPOSITORY, HitoSeeder],
})
export class HitosModule {}
