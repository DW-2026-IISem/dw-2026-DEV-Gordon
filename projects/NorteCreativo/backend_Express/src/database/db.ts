import 'dotenv/config';
import { Dialect, Sequelize } from 'sequelize';

interface DbConfig {
  dialect: Dialect;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

const dbConfigurations: Record<string, DbConfig> = {
  mysql: {
    dialect: 'mysql',
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    username: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_NAME || 'norte_creativo_express',
  },
  postgres: {
    dialect: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5433,
    username: process.env.POSTGRES_USER || 'nc_admin',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_NAME || 'norte_creativo_express',
  },
  mssql: {
    dialect: 'mssql',
    host: process.env.MSSQL_HOST || 'localhost',
    port: Number(process.env.MSSQL_PORT) || 1433,
    username: process.env.MSSQL_USER || 'sa',
    password: process.env.MSSQL_PASSWORD || '',
    database: process.env.MSSQL_NAME || 'norte_creativo_express',
  },
  oracle: {
    dialect: 'oracle',
    host: process.env.ORACLE_HOST || 'localhost',
    port: Number(process.env.ORACLE_PORT) || 1521,
    username: process.env.ORACLE_USER || 'system',
    password: process.env.ORACLE_PASSWORD || '',
    database: process.env.ORACLE_NAME || 'XEPDB1',
  },
};

const selectedEngine = process.env.DB_ENGINE || 'mysql';
const selectedConfig = Object.prototype.hasOwnProperty.call(dbConfigurations, selectedEngine)
  ? dbConfigurations[selectedEngine]
  : undefined;

if (!selectedConfig) {
  throw new Error(`Motor de base de datos no soportado: ${selectedEngine}`);
}

export const sequelize = new Sequelize(
  selectedConfig.database,
  selectedConfig.username,
  selectedConfig.password,
  {
    host: selectedConfig.host,
    port: selectedConfig.port,
    dialect: selectedConfig.dialect,
    logging: false,
  }
);

export const getDatabaseInfo = () => ({
  engine: selectedEngine,
  host: selectedConfig.host,
  port: selectedConfig.port,
  database: selectedConfig.database,
  user: selectedConfig.username,
});

export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log(`Conexión exitosa a ${selectedEngine.toUpperCase()}`);
    return true;
  } catch (error) {
    const { host, port, database } = getDatabaseInfo();
    console.error(
      `No se pudo conectar a ${selectedEngine.toUpperCase()} (${host}:${port}/${database}):`,
      error instanceof Error ? error.message : error
    );
    return false;
  }
};
