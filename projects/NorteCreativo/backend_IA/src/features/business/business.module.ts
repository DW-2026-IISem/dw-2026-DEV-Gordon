import { Module } from '@nestjs/common';
import { CampaniasModule } from './campanias/campanias.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { HitosModule } from './hitos/hitos.module.js';

@Module({
  imports: [ClientesModule, CampaniasModule, HitosModule],
})
export class BusinessModule {}
