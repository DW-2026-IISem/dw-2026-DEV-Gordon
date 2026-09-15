import { Module } from '@nestjs/common';
import { ClientesModule } from '../clientes/clientes.module.js';
import { CreateCampaniaUseCase } from './application/use-cases/create-campania.use-case.js';
import { GetCampaniaByIdUseCase } from './application/use-cases/get-campania-by-id.use-case.js';
import { ListCampaniasUseCase } from './application/use-cases/list-campanias.use-case.js';
import { CAMPANIA_REPOSITORY } from './domain/interfaces/campania.repository.js';
import { CampaniaRepository } from './infrastructure/persistence/repositories/campania.repository.js';
import { CampaniaSeeder } from './infrastructure/persistence/seeders/campania.seeder.js';
import { CampaniasController } from './presentation/http/controllers/campanias.controller.js';

@Module({
  imports: [ClientesModule],
  controllers: [CampaniasController],
  providers: [
    CreateCampaniaUseCase,
    ListCampaniasUseCase,
    GetCampaniaByIdUseCase,
    CampaniaSeeder,
    { provide: CAMPANIA_REPOSITORY, useClass: CampaniaRepository },
  ],
  exports: [CAMPANIA_REPOSITORY, CampaniaSeeder],
})
export class CampaniasModule {}
