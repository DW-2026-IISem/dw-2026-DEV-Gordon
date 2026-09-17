import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthModule } from './common/health/health.module.js';
import { BusinessModule } from './features/business/business.module.js';

@Module({
  imports: [HealthModule, BusinessModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
