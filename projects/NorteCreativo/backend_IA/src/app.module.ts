import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthModule } from './common/health/health.module.js';
import { BusinessModule } from './features/business/business.module.js';
import { SeedersModule } from './infrastructure/database/seeders/seeders.module.js';
import { SequelizeDatabaseModule } from './infrastructure/database/sequelize/sequelize.module.js';

@Module({
  imports: [SequelizeDatabaseModule, HealthModule, BusinessModule, SeedersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
