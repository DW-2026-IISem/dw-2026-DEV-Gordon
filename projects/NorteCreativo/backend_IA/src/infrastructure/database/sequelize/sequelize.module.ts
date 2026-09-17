import { Global, Logger, Module } from '@nestjs/common';
import { ENV_CONFIG, envConfig, type EnvironmentVariables } from '../../../config/environment/environment.js';
import { createSequelizeInstance, getActiveDatabaseName } from './sequelize.factory.js';

export const SEQUELIZE = Symbol('SEQUELIZE');

const logger = new Logger('SequelizeModule');

@Global()
@Module({
  providers: [
    { provide: ENV_CONFIG, useValue: envConfig },
    {
      provide: SEQUELIZE,
      inject: [ENV_CONFIG],
      useFactory: async (env: EnvironmentVariables) => {
        const sequelize = createSequelizeInstance(env);

        await sequelize.authenticate();
        logger.log(`Conexión a la base de datos "${getActiveDatabaseName(env)}" (${env.DB_DIALECT}) establecida correctamente.`);

        await sequelize.sync({ alter: false });

        return sequelize;
      },
    },
  ],
  exports: [SEQUELIZE],
})
export class SequelizeDatabaseModule {}
