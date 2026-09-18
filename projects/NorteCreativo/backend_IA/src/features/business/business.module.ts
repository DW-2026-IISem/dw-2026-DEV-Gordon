import { Module } from '@nestjs/common';
import { ClientesModule } from './clientes/clientes.module.js';

@Module({
  imports: [ClientesModule],
})
export class BusinessModule {}
