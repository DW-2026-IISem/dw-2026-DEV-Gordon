import { Module } from '@nestjs/common';
import { CreateClienteUseCase } from './application/use-cases/create-cliente.use-case.js';
import { GetClienteByIdUseCase } from './application/use-cases/get-cliente-by-id.use-case.js';
import { ListClientesUseCase } from './application/use-cases/list-clientes.use-case.js';
import { CLIENTE_REPOSITORY } from './domain/interfaces/cliente-repository.interface.js';
import { ClienteRepository } from './infrastructure/repositories/cliente.repository.js';
import { ClienteSeeder } from './infrastructure/seeders/cliente.seeder.js';
import { ClientesController } from './presentation/controllers/clientes.controller.js';

@Module({
  controllers: [ClientesController],
  providers: [
    CreateClienteUseCase,
    ListClientesUseCase,
    GetClienteByIdUseCase,
    ClienteSeeder,
    { provide: CLIENTE_REPOSITORY, useClass: ClienteRepository },
  ],
})
export class ClientesModule {}
