import { Module } from '@nestjs/common';
import { EnvironmentModule } from './config/environment/environment.module.js';
import { BusinessModule } from './features/business/business.module.js';
import { HealthController } from './health/health.controller.js';
import { SeedersRunner } from './infrastructure/database/seeders/seeders.runner.js';
import { SequelizeModule } from './infrastructure/database/sequelize/sequelize.module.js';

@Module({
  imports: [EnvironmentModule, SequelizeModule, BusinessModule],
  controllers: [HealthController],
  providers: [SeedersRunner],
})
export class AppModule {}
