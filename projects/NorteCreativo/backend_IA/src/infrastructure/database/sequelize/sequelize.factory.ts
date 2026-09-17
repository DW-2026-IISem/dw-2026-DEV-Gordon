import { Sequelize, type Dialect, type ModelStatic, type Model } from 'sequelize';
import type { EnvironmentVariables } from '../../../config/environment/environment.js';

/**
 * Registro central de modelos. Vacío en ISS-02 (aún no hay features de
 * negocio); cada feature siguiente añade aquí su(s) modelo(s) para que
 * `sequelize.sync()` los reconozca.
 */
export const ALL_MODELS: ModelStatic<Model>[] = [];

export function getActiveDatabaseName(env: EnvironmentVariables): string {
  switch (env.DB_DIALECT) {
    case 'mysql':
      return env.DB_MYSQL_NAME as string;
    case 'postgres':
      return env.DB_POSTGRES_NAME as string;
    case 'mssql':
      return env.DB_MSSQL_NAME as string;
    case 'oracle':
      return env.DB_ORACLE_NAME as string;
    default: {
      const exhaustiveCheck: never = env.DB_DIALECT;
      throw new Error(`Dialecto de base de datos no soportado: ${exhaustiveCheck as string}`);
    }
  }
}

export function createSequelizeInstance(env: EnvironmentVariables): Sequelize {
  const dialect: Dialect = env.DB_DIALECT;

  switch (env.DB_DIALECT) {
    case 'mysql':
      return new Sequelize(env.DB_MYSQL_NAME as string, env.DB_MYSQL_USERNAME as string, env.DB_MYSQL_PASSWORD, {
        host: env.DB_MYSQL_HOST,
        port: Number(env.DB_MYSQL_PORT),
        dialect,
        logging: false,
      });

    case 'postgres':
      return new Sequelize(
        env.DB_POSTGRES_NAME as string,
        env.DB_POSTGRES_USERNAME as string,
        env.DB_POSTGRES_PASSWORD,
        {
          host: env.DB_POSTGRES_HOST,
          port: Number(env.DB_POSTGRES_PORT),
          dialect,
          logging: false,
        },
      );

    case 'mssql':
      return new Sequelize(env.DB_MSSQL_NAME as string, env.DB_MSSQL_USERNAME as string, env.DB_MSSQL_PASSWORD, {
        host: env.DB_MSSQL_HOST,
        port: Number(env.DB_MSSQL_PORT),
        dialect,
        dialectOptions: {
          options: { encrypt: false, trustServerCertificate: true },
        },
        logging: false,
      });

    case 'oracle':
      return new Sequelize(env.DB_ORACLE_NAME as string, env.DB_ORACLE_USERNAME as string, env.DB_ORACLE_PASSWORD, {
        host: env.DB_ORACLE_HOST,
        port: Number(env.DB_ORACLE_PORT),
        dialect,
        logging: false,
      });

    default: {
      const exhaustiveCheck: never = env.DB_DIALECT;
      throw new Error(`Dialecto de base de datos no soportado: ${exhaustiveCheck as string}`);
    }
  }
}
