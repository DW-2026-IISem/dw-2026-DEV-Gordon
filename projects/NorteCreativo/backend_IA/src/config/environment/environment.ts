import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';
import { EnvironmentVariables } from './env.validation.js';

export type { EnvironmentVariables } from './env.validation.js';

try {
  process.loadEnvFile();
} catch {
  // No hay .env (p. ej. las variables ya vienen del entorno/CI); se valida igual contra process.env.
}

function formatMissingVariables(errors: ValidationError[]): string {
  const names = errors.map((error) => error.property);

  return names.length === 1
    ? `falta o es inválida la variable ${names[0]}`
    : `faltan o son inválidas las variables: ${names.join(', ')}`;
}

function loadAndValidate(): EnvironmentVariables {
  const raw: Record<string, unknown> = {
    DB_DIALECT: process.env.DB_DIALECT,

    DB_MYSQL_HOST: process.env.DB_MYSQL_HOST,
    DB_MYSQL_PORT: process.env.DB_MYSQL_PORT,
    DB_MYSQL_USERNAME: process.env.DB_MYSQL_USERNAME,
    DB_MYSQL_PASSWORD: process.env.DB_MYSQL_PASSWORD,
    DB_MYSQL_NAME: process.env.DB_MYSQL_NAME,

    DB_POSTGRES_HOST: process.env.DB_POSTGRES_HOST,
    DB_POSTGRES_PORT: process.env.DB_POSTGRES_PORT,
    DB_POSTGRES_USERNAME: process.env.DB_POSTGRES_USERNAME,
    DB_POSTGRES_PASSWORD: process.env.DB_POSTGRES_PASSWORD,
    DB_POSTGRES_NAME: process.env.DB_POSTGRES_NAME,

    DB_MSSQL_HOST: process.env.DB_MSSQL_HOST,
    DB_MSSQL_PORT: process.env.DB_MSSQL_PORT,
    DB_MSSQL_USERNAME: process.env.DB_MSSQL_USERNAME,
    DB_MSSQL_PASSWORD: process.env.DB_MSSQL_PASSWORD,
    DB_MSSQL_NAME: process.env.DB_MSSQL_NAME,

    DB_ORACLE_HOST: process.env.DB_ORACLE_HOST,
    DB_ORACLE_PORT: process.env.DB_ORACLE_PORT,
    DB_ORACLE_USERNAME: process.env.DB_ORACLE_USERNAME,
    DB_ORACLE_PASSWORD: process.env.DB_ORACLE_PASSWORD,
    DB_ORACLE_NAME: process.env.DB_ORACLE_NAME,
  };

  const candidate = plainToInstance(EnvironmentVariables, raw, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(candidate, {
    skipMissingProperties: false,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`Error de configuración: ${formatMissingVariables(errors)}`);
    process.exit(1);
  }

  return candidate;
}

/**
 * Se valida en cuanto este módulo se importa (no en un request), así el
 * fallo ocurre antes de que Nest/Sequelize intenten levantar cualquier cosa.
 */
export const envConfig: EnvironmentVariables = loadAndValidate();

export const ENV_CONFIG = Symbol('ENV_CONFIG');
