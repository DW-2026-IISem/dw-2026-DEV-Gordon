import { Module } from '@nestjs/common';
import { EntregablesModule } from '../entregables/entregables.module.js';
import { CreateVersionEntregableUseCase } from './application/use-cases/create-version-entregable.use-case.js';
import { GetVersionByIdUseCase } from './application/use-cases/get-version-by-id.use-case.js';
import { VERSION_ENTREGABLE_REPOSITORY } from './domain/interfaces/version-entregable.repository.js';
import { VersionEntregableRepository } from './infrastructure/persistence/repositories/version-entregable.repository.js';
import { VersionEntregableSeeder } from './infrastructure/persistence/seeders/version-entregable.seeder.js';
import { VersionEntregablesController } from './presentation/http/controllers/version-entregables.controller.js';

@Module({
  imports: [EntregablesModule],
  controllers: [VersionEntregablesController],
  providers: [
    CreateVersionEntregableUseCase,
    GetVersionByIdUseCase,
    VersionEntregableSeeder,
    { provide: VERSION_ENTREGABLE_REPOSITORY, useClass: VersionEntregableRepository },
  ],
  exports: [VERSION_ENTREGABLE_REPOSITORY, VersionEntregableSeeder],
})
export class VersionEntregablesModule {}
