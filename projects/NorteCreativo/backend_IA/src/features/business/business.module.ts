import { Module } from '@nestjs/common';
import { CampaniasModule } from './campanias/campanias.module.js';
import { ClientesModule } from './clientes/clientes.module.js';

@Module({
  imports: [ClientesModule, CampaniasModule],
})
export class BusinessModule {}
