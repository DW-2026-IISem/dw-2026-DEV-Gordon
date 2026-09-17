import { IsIn, IsNotEmpty, IsNumberString, IsString, ValidateIf } from 'class-validator';

export const DB_DIALECTS = ['mysql', 'postgres', 'mssql', 'oracle'] as const;
export type DbDialect = (typeof DB_DIALECTS)[number];

export class EnvironmentVariables {
  @IsIn(DB_DIALECTS, {
    message: `DB_DIALECT debe ser uno de: ${DB_DIALECTS.join(', ')}`,
  })
  DB_DIALECT!: DbDialect;

  // --- MySQL ---
  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'mysql')
  @IsNotEmpty()
  @IsString()
  DB_MYSQL_HOST?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'mysql')
  @IsNotEmpty()
  @IsNumberString()
  DB_MYSQL_PORT?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'mysql')
  @IsNotEmpty()
  @IsString()
  DB_MYSQL_USERNAME?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'mysql')
  @IsString()
  DB_MYSQL_PASSWORD?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'mysql')
  @IsNotEmpty()
  @IsString()
  DB_MYSQL_NAME?: string;

  // --- PostgreSQL ---
  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'postgres')
  @IsNotEmpty()
  @IsString()
  DB_POSTGRES_HOST?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'postgres')
  @IsNotEmpty()
  @IsNumberString()
  DB_POSTGRES_PORT?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'postgres')
  @IsNotEmpty()
  @IsString()
  DB_POSTGRES_USERNAME?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'postgres')
  @IsString()
  DB_POSTGRES_PASSWORD?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'postgres')
  @IsNotEmpty()
  @IsString()
  DB_POSTGRES_NAME?: string;

  // --- SQL Server ---
  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'mssql')
  @IsNotEmpty()
  @IsString()
  DB_MSSQL_HOST?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'mssql')
  @IsNotEmpty()
  @IsNumberString()
  DB_MSSQL_PORT?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'mssql')
  @IsNotEmpty()
  @IsString()
  DB_MSSQL_USERNAME?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'mssql')
  @IsString()
  DB_MSSQL_PASSWORD?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'mssql')
  @IsNotEmpty()
  @IsString()
  DB_MSSQL_NAME?: string;

  // --- Oracle ---
  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'oracle')
  @IsNotEmpty()
  @IsString()
  DB_ORACLE_HOST?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'oracle')
  @IsNotEmpty()
  @IsNumberString()
  DB_ORACLE_PORT?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'oracle')
  @IsNotEmpty()
  @IsString()
  DB_ORACLE_USERNAME?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'oracle')
  @IsString()
  DB_ORACLE_PASSWORD?: string;

  @ValidateIf((env: EnvironmentVariables) => env.DB_DIALECT === 'oracle')
  @IsNotEmpty()
  @IsString()
  DB_ORACLE_NAME?: string;
}
