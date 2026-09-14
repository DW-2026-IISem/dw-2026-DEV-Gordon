# Manual de construcción — Backend NestJS (Norte Creativo · solo Business)

> **Objetivo:** construir desde cero, **sin ayuda de IA**, el backend de negocio de **Norte Creativo** (`clientes`, `campanias`, `hitos`, `tareas`, `entregables`, `version-entregables`, `aprobaciones`) con **NestJS 12 + Sequelize** y **Clean Architecture por feature**.
>
> Adaptado del manual base del docente (StoreLab) a las 7 entidades de la cadena central del SDD de Norte Creativo. No incluye RBAC ni autenticación (fuera de alcance de esta fase).
>
> La construcción está dividida en **segmentos**, cada uno un bloque de trabajo trazable. Cada archivo se crea con un heredoc (`cat > ... <<'EOF_MANUAL'`) listo para copiar/pegar.
>
> Antes de cada archivo verás una **leyenda de capa** (🟢🔵🟠🟣⚙️) que indica en qué capa de la arquitectura estás.

---

## Índice

1. [La arquitectura y su leyenda](#1-la-arquitectura-y-su-leyenda)
2. [Requisitos previos](#2-requisitos-previos)
3. [SEG-01 · Esqueleto NestJS arrancable](#3-seg-01--esqueleto-nestjs-arrancable)
4. [SEG-02 · Entorno Sequelize y common](#4-seg-02--entorno-sequelize-y-common)
5. [SEG-03 · Feature clientes](#5-seg-03--feature-clientes)
6. [SEG-04 · Feature campanias](#6-seg-04--feature-campanias)
7. [SEG-05 · Feature hitos](#7-seg-05--feature-hitos)
8. [SEG-06 · Feature tareas](#8-seg-06--feature-tareas)
9. [SEG-07 · Feature entregables](#9-seg-07--feature-entregables)
10. [SEG-08 · Feature version-entregables](#10-seg-08--feature-version-entregables)
11. [SEG-09 · Feature aprobaciones (cierre automático de hito)](#11-seg-09--feature-aprobaciones-cierre-automatico-de-hito)
12. [SEG-10 · Integración, seeders y demo](#12-seg-10--integracion-seeders-y-demo)

---

## 1. La arquitectura y su leyenda

### 1.1 Clean Architecture por feature

El backend se organiza en **features** (una carpeta por entidad de negocio). Dentro de cada feature hay **4 capas** con dependencia estricta hacia adentro:

```
presentation  ──▶  application  ──▶  domain
      │                   │
      │                   ▼
      └────────────▶  infrastructure  (implementa los contratos de domain)
```

### 1.2 Leyenda de capas

| Marcador | Capa | Carpeta | Qué contiene | Regla de dependencia |
|---|---|---|---|---|
| 🟢 `domain` | dominio | `domain/` | entidades, puertos, excepciones, servicios de dominio | no depende de nadie |
| 🔵 `application` | aplicación | `application/` | casos de uso, DTOs, mappers | depende solo de `domain` |
| 🟠 `infrastructure` | infraestructura | `infrastructure/persistence/` | modelos Sequelize, repositorios, seeders | implementa los puertos de `domain` |
| 🟣 `presentation` | presentación | `presentation/http/` | controladores, DTOs de entrada | depende de `application` |
| ⚙️ `transversal` | transversal | `config/`, `common/`, `infrastructure/database/`, `health/` | configuración, errores, interceptores, conexión BD | compartido por todas las features |

### 1.3 Mapa de segmentos y correspondencia con el SDD

| Segmento | Feature | Entidad del SDD | Rol |
|---|---|---|---|
| SEG-01 | — | — | Esqueleto NestJS arrancable |
| SEG-02 | — | — | Config, common, Sequelize, health |
| SEG-03 | `clientes` | Cliente | Raíz de la cadena — actor externo |
| SEG-04 | `campanias` | Campania | Contenedor de hitos, FK a Cliente |
| SEG-05 | `hitos` | Hito | Entidad con estado (ABIERTO/CERRADO/FACTURADO), FK a Campania |
| SEG-06 | `tareas` | Tarea | FK a Hito |
| SEG-07 | `entregables` | Entregable | FK a Tarea |
| SEG-08 | `version-entregables` | VersionEntregable | FK a Entregable, versionado |
| SEG-09 | `aprobaciones` | Aprobacion | **Transaccional** — dispara CerrarHito (RN-01, RN-02, RN-06) |
| SEG-10 | — | — | Integración, seeders, demo |

> Nota: `Presupuesto`, `Factura` y `FacturaHito` quedan fuera de este manual (siguiente fase). Este manual cubre la cadena que sostiene la capacidad integrada CerrarHito.

---

## 2. Requisitos previos

- **Node.js ≥ 20** y **npm ≥ 10**: `node -v` y `npm -v`.
- **Nest CLI** instalado globalmente:

```bash
npm install -g @nestjs/cli
```

- Una base de datos accesible (`mysql | postgres | mssql | oracle`).
- Terminal con `bash` (para los heredocs).

```bash
node -v && npm -v && nest --version
```


---

## 3. SEG-01 · Esqueleto NestJS arrancable

> **Segmento:** dejar un proyecto NestJS arrancable (sin features aún).

### 3.1 Crear la carpeta del proyecto

> ⚙️ `transversal` — paso previo fuera del código. Se corre dentro de `projects/NorteCreativo/backend_manual/`.

```bash
# Ya estás dentro de projects/NorteCreativo/ — crea y entra al backend manual
mkdir -p backend_manual
chmod -R 777 backend_manual
cd backend_manual
```

### 3.2 Crear el proyecto con `nest new`

```bash
nest new . --package-manager npm --skip-git
```

`nest new` genera CommonJS por defecto. Convertimos a **ESM** a continuación.

### 3.3 Convertir a ESM y definir los scripts

> ⚙️ `transversal` — `package.json` (raíz del proyecto).

```bash
cat > package.json <<'EOF_MANUAL'
{
  "name": "norte-creativo-backend-manual",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "npm run free:port && nest start --watch",
    "start:prod": "node dist/main",
    "lint": "oxlint src/ test/",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "test:e2e": "vitest run --config ./vitest.config.e2e.ts",
    "free:port": "node scripts/free-port.js"
  }
}
EOF_MANUAL
```

### 3.4 Instalar dependencias adicionales

```bash
npm install @nestjs/swagger \
  sequelize sequelize-typescript mysql2 pg oracledb tedious \
  class-validator class-transformer dotenv
```

```bash
npm install -D @types/supertest \
  vitest @vitest/coverage-v8 vite-tsconfig-paths supertest \
  oxlint source-map-support
```

### 3.5 Configurar TypeScript y tooling

```bash
cat > tsconfig.json <<'EOF_MANUAL'
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolvePackageJsonExports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "incremental": true,
    "skipLibCheck": true,
    "strict": true,
    "strictPropertyInitialization": false,
    "types": ["vitest/globals", "node"]
  }
}
EOF_MANUAL
```

```bash
cat > tsconfig.build.json <<'EOF_MANUAL'
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "rootDir": "./src" },
  "include": ["src"],
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
EOF_MANUAL
```

```bash
cat > nest-cli.json <<'EOF_MANUAL'
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "deleteOutDir": true }
}
EOF_MANUAL
```

```bash
cat > .prettierrc <<'EOF_MANUAL'
{
  "singleQuote": true,
  "trailingComma": "all"
}
EOF_MANUAL
```

```bash
cat > .gitignore <<'EOF_MANUAL'
node_modules/
dist/
.env
.env.local
.env.*.local
*.log
npm-debug.log*
*.tsbuildinfo
EOF_MANUAL
```

### 3.6 Script auxiliar y variables de entorno

```bash
mkdir -p scripts
cat > scripts/free-port.js <<'EOF_MANUAL'
import { execSync } from 'node:child_process';

const port = process.env.PORT ?? 3010;
const label = `[free-port]`;

function findAndKill(p) {
  const commands = [`lsof -ti tcp:${p}`, `fuser ${p}/tcp 2>/dev/null`];
  for (const cmd of commands) {
    try {
      const out = execSync(cmd, { encoding: 'utf8' }).trim();
      if (!out) continue;
      for (const pid of out.split(/\s+/).filter(Boolean)) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          console.log(`${label} liberado: mató PID ${pid} en el puerto ${p}`);
        } catch { /* ya no existe */ }
      }
      return;
    } catch { /* comando no disponible o puerto libre */ }
  }
  console.log(`${label} puerto ${p} libre`);
}

findAndKill(port);
EOF_MANUAL
```

> Nota: usamos el puerto **3010** (distinto del 3002 de StoreLab y distinto del backend_IA) para poder correr ambos backends de Norte Creativo al mismo tiempo sin choque de puertos.

```bash
cat > .env.example <<'EOF_MANUAL'
PORT=3010
NODE_ENV=development
DB_DIALECT=mysql
DB_MYSQL_HOST=<IP_HOST_DOCKER>
DB_MYSQL_PORT=3306
DB_MYSQL_USERNAME=admin
DB_MYSQL_PASSWORD=<PASSWORD>
DB_MYSQL_NAME=norte_creativo_manual
EOF_MANUAL
```

```bash
cp .env.example .env
```

### 3.7 Estructura de carpetas

```bash
mkdir -p src/common/exceptions src/common/filters src/common/interceptors
mkdir -p src/config/environment
mkdir -p src/infrastructure/database/sequelize src/infrastructure/database/seeders
mkdir -p src/health
mkdir -p src/features/business
for f in clientes campanias hitos tareas entregables version-entregables aprobaciones; do
  mkdir -p "src/features/business/$f/domain/entities" \
           "src/features/business/$f/domain/interfaces" \
           "src/features/business/$f/domain/exceptions" \
           "src/features/business/$f/application/dto" \
           "src/features/business/$f/application/mappers" \
           "src/features/business/$f/application/use-cases" \
           "src/features/business/$f/infrastructure/persistence/models" \
           "src/features/business/$f/infrastructure/persistence/repositories" \
           "src/features/business/$f/infrastructure/persistence/seeders" \
           "src/features/business/$f/presentation/http/controllers"
done
```

> ✅ **Fin de SEG-01**: el proyecto arranca (aún sin features).

---

## 4. SEG-02 · Entorno Sequelize y common

> **Segmento:** configuración validada, manejo uniforme de errores, interceptores y conexión a BD.

### 4.1 Capa de configuración `config/environment`

> ⚙️ `transversal`

```bash
cat > src/config/environment/env.interface.ts <<'EOF_MANUAL'
export type DbDialect = 'mysql' | 'postgres' | 'mssql' | 'oracle';

export interface IDbBlock {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
  connectString?: string;
}

export interface IEnvConfig {
  port: number;
  nodeEnv: string;
  dbDialect: DbDialect;
  mysql: IDbBlock;
  postgres: IDbBlock;
  mssql: IDbBlock;
  oracle: IDbBlock;
}
EOF_MANUAL
```

```bash
cat > src/config/environment/env.validation.ts <<'EOF_MANUAL'
import { plainToInstance } from 'class-transformer';
import { IsIn, IsNotEmpty, validateSync, ValidateIf } from 'class-validator';

const DIALECTS = ['mysql', 'postgres', 'mssql', 'oracle'];

export class EnvVariables {
  @IsIn(DIALECTS, {
    message: 'DB_DIALECT debe ser mysql | postgres | mssql | oracle',
  })
  DB_DIALECT!: string;

  @ValidateIf((o) => o.DB_DIALECT === 'mysql')
  @IsNotEmpty({ message: 'DB_MYSQL_HOST es requerida (DB_DIALECT=mysql)' })
  DB_MYSQL_HOST?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'mysql')
  @IsNotEmpty({ message: 'DB_MYSQL_USERNAME es requerida (DB_DIALECT=mysql)' })
  DB_MYSQL_USERNAME?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'mysql')
  @IsNotEmpty({ message: 'DB_MYSQL_NAME es requerida (DB_DIALECT=mysql)' })
  DB_MYSQL_NAME?: string;

  @ValidateIf((o) => o.DB_DIALECT === 'postgres')
  @IsNotEmpty({ message: 'DB_POSTGRES_HOST es requerida (DB_DIALECT=postgres)' })
  DB_POSTGRES_HOST?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'postgres')
  @IsNotEmpty({ message: 'DB_POSTGRES_USERNAME es requerida (DB_DIALECT=postgres)' })
  DB_POSTGRES_USERNAME?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'postgres')
  @IsNotEmpty({ message: 'DB_POSTGRES_NAME es requerida (DB_DIALECT=postgres)' })
  DB_POSTGRES_NAME?: string;

  @ValidateIf((o) => o.DB_DIALECT === 'mssql')
  @IsNotEmpty({ message: 'DB_MSSQL_HOST es requerida (DB_DIALECT=mssql)' })
  DB_MSSQL_HOST?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'mssql')
  @IsNotEmpty({ message: 'DB_MSSQL_USERNAME es requerida (DB_DIALECT=mssql)' })
  DB_MSSQL_USERNAME?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'mssql')
  @IsNotEmpty({ message: 'DB_MSSQL_NAME es requerida (DB_DIALECT=mssql)' })
  DB_MSSQL_NAME?: string;

  @ValidateIf((o) => o.DB_DIALECT === 'oracle')
  @IsNotEmpty({ message: 'DB_ORACLE_HOST es requerida (DB_DIALECT=oracle)' })
  DB_ORACLE_HOST?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'oracle')
  @IsNotEmpty({ message: 'DB_ORACLE_USERNAME es requerida (DB_DIALECT=oracle)' })
  DB_ORACLE_USERNAME?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'oracle')
  @IsNotEmpty({ message: 'DB_ORACLE_NAME es requerida (DB_DIALECT=oracle)' })
  DB_ORACLE_NAME?: string;
}

export function validateEnv(raw: Record<string, unknown>): EnvVariables {
  const config = plainToInstance(EnvVariables, raw);
  const errors = validateSync(config, { whitelist: false, forbidNonWhitelisted: false });
  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints ?? {}).join('; '))
      .join(' | ');
    throw new Error(`Error de configuración: ${messages}`);
  }
  return config;
}
EOF_MANUAL
```

```bash
cat > src/config/environment/db-env.ts <<'EOF_MANUAL'
import { IDbBlock, IEnvConfig } from './env.interface.js';

export function getDbBlock(cfg: IEnvConfig): IDbBlock {
  switch (cfg.dbDialect) {
    case 'mysql':
      return cfg.mysql;
    case 'postgres':
      return cfg.postgres;
    case 'mssql':
      return cfg.mssql;
    case 'oracle':
      return cfg.oracle;
    default:
      throw new Error(`Dialecto no soportado: ${String(cfg.dbDialect)}`);
  }
}
EOF_MANUAL
```

```bash
cat > src/config/environment/env.config.ts <<'EOF_MANUAL'
import { config as loadDotenv } from 'dotenv';
import { IDbBlock, IEnvConfig, DbDialect } from './env.interface.js';
import { validateEnv } from './env.validation.js';

export const ENV_CONFIG = Symbol('ENV_CONFIG');

function toBlock(prefix: string, raw: Record<string, unknown>, defaultPort: number): IDbBlock {
  return {
    host: String(raw[`DB_${prefix}_HOST`] ?? 'localhost'),
    port: Number(raw[`DB_${prefix}_PORT`] ?? defaultPort),
    username: String(raw[`DB_${prefix}_USERNAME`] ?? ''),
    password: String(raw[`DB_${prefix}_PASSWORD`] ?? ''),
    name: String(raw[`DB_${prefix}_NAME`] ?? ''),
    connectString: raw[`DB_${prefix}_CONNECT_STRING`]
      ? String(raw[`DB_${prefix}_CONNECT_STRING`])
      : undefined,
  };
}

export function loadEnvConfig(): IEnvConfig {
  loadDotenv();
  const raw = process.env as Record<string, unknown>;
  validateEnv(raw);
  const dialect = String(raw.DB_DIALECT) as DbDialect;
  return {
    port: Number(raw.PORT ?? 3010),
    nodeEnv: String(raw.NODE_ENV ?? 'development'),
    dbDialect: dialect,
    mysql: toBlock('MYSQL', raw, 3306),
    postgres: toBlock('POSTGRES', raw, 5432),
    mssql: toBlock('MSSQL', raw, 1433),
    oracle: toBlock('ORACLE', raw, 1521),
  };
}

export const envConfig = {
  KEY: ENV_CONFIG,
};
EOF_MANUAL
```

```bash
cat > src/config/environment/environment.module.ts <<'EOF_MANUAL'
import { Global, Module } from '@nestjs/common';
import { envConfig, loadEnvConfig } from './env.config.js';

@Global()
@Module({
  providers: [
    {
      provide: envConfig.KEY,
      useFactory: () => loadEnvConfig(),
    },
  ],
  exports: [envConfig.KEY],
})
export class EnvironmentModule {}
EOF_MANUAL
```

```bash
cat > src/config/environment/index.ts <<'EOF_MANUAL'
export * from './env.interface.js';
export * from './env.validation.js';
export * from './db-env.js';
export * from './env.config.js';
export * from './environment.module.js';
EOF_MANUAL
```

### 4.2 Excepciones `common/exceptions`

> ⚙️ `transversal` — jerarquía de errores de negocio → códigos HTTP.

```bash
cat > src/common/exceptions/application.exception.ts <<'EOF_MANUAL'
export class ApplicationException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
EOF_MANUAL
```

```bash
cat > src/common/exceptions/business-rule.exception.ts <<'EOF_MANUAL'
import { ApplicationException } from './application.exception.js';

export class BusinessRuleException extends ApplicationException {
  constructor(message: string) {
    super(409, message);
  }
}
EOF_MANUAL
```

```bash
cat > src/common/exceptions/domain.exception.ts <<'EOF_MANUAL'
import { ApplicationException } from './application.exception.js';

export class DomainException extends ApplicationException {
  constructor(message: string) {
    super(400, message);
  }
}
EOF_MANUAL
```

```bash
cat > src/common/exceptions/entity-not-found.exception.ts <<'EOF_MANUAL'
import { ApplicationException } from './application.exception.js';

export class EntityNotFoundException extends ApplicationException {
  constructor(message = 'Entidad no encontrada') {
    super(404, message);
  }
}
EOF_MANUAL
```

### 4.3 Filtro global de errores

> ⚙️ `transversal`

```bash
cat > src/common/filters/global-exception.filter.ts <<'EOF_MANUAL'
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApplicationException } from '../exceptions/application.exception.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Error interno del servidor';

    if (exception instanceof ApplicationException) {
      status = exception.statusCode;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        message = (body as { message?: string | string[] }).message ?? exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const msg = Array.isArray(message) ? message.join('; ') : message;
    this.logger.error(`${req.method} ${req.url} → ${status}: ${msg}`);

    res.status(status).json({
      statusCode: status,
      message: msg,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
EOF_MANUAL
```

### 4.4 Interceptores

> ⚙️ `transversal`

```bash
cat > src/common/interceptors/response.interceptor.ts <<'EOF_MANUAL'
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Response } from 'express';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((data) => ({
        statusCode: res.statusCode,
        message: 'OK',
        data: data ?? null,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
EOF_MANUAL
```

```bash
cat > src/common/interceptors/logging.interceptor.ts <<'EOF_MANUAL'
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(`${req.method} ${req.url} → ${ms}ms`);
      }),
    );
  }
}
EOF_MANUAL
```

```bash
cat > src/common/interceptors/timeout.interceptor.ts <<'EOF_MANUAL'
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { catchError, Observable, throwError, TimeoutError, timeout } from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(5000),
      catchError((err) =>
        throwError(() =>
          err instanceof TimeoutError ? new RequestTimeoutException() : err,
        ),
      ),
    );
  }
}
EOF_MANUAL
```

### 4.5 Persistencia Sequelize

> ⚙️ `transversal`

```bash
cat > src/infrastructure/database/sequelize/sequelize.factory.ts <<'EOF_MANUAL'
import { Sequelize } from 'sequelize-typescript';
import { getDbBlock } from '../../../config/environment/db-env.js';
import { IEnvConfig } from '../../../config/environment/env.interface.js';

// Los modelos se van agregando aquí a medida que se crea cada feature
// (SEG-03..SEG-09).

export const ALL_MODELS: any[] = [];

export function sequelizeFactory(cfg: IEnvConfig): Sequelize {
  const block = getDbBlock(cfg);
  const options: Record<string, unknown> = {
    dialect: cfg.dbDialect,
    host: block.host,
    port: block.port,
    username: block.username,
    password: block.password,
    database: block.name,
    models: ALL_MODELS,
    logging: false,
  };
  if (cfg.dbDialect === 'oracle' && block.connectString) {
    options.connectString = block.connectString;
  }
  return new Sequelize(options);
}
EOF_MANUAL
```

```bash
cat > src/infrastructure/database/sequelize/sequelize.module.ts <<'EOF_MANUAL'
import { Global, Logger, Module } from '@nestjs/common';
import { getDbBlock } from '../../../config/environment/db-env.js';
import { envConfig } from '../../../config/environment/env.config.js';
import { IEnvConfig } from '../../../config/environment/env.interface.js';
import { sequelizeFactory } from './sequelize.factory.js';

export const SEQUELIZE = 'SEQUELIZE';

@Global()
@Module({
  providers: [
    {
      provide: SEQUELIZE,
      inject: [envConfig.KEY],
      useFactory: async (cfg: IEnvConfig) => {
        const sequelize = sequelizeFactory(cfg);
        await sequelize.authenticate();
        await sequelize.sync({ alter: false });
        const block = getDbBlock(cfg);
        Logger.log(
          `Conexión exitosa a la base de datos (${cfg.dbDialect}) ${block.host}:${block.port}/${block.name}`,
          'Sequelize',
        );
        return sequelize;
      },
    },
  ],
  exports: [SEQUELIZE],
})
export class SequelizeModule {}
EOF_MANUAL
```

### 4.6 Health check y arranque

> ⚙️ `transversal`

```bash
cat > src/health/health.controller.ts <<'EOF_MANUAL'
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
EOF_MANUAL
```

```bash
cat > src/main.ts <<'EOF_MANUAL'
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: 'http://localhost:4200', credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new LoggingInterceptor(),
    new TimeoutInterceptor(),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Norte Creativo — Backend solo Business (manual)')
    .setDescription('API de negocio: clientes, campanias, hitos, tareas, entregables, version-entregables, aprobaciones.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3010);
}
await bootstrap();
EOF_MANUAL
```

```bash
cat > src/app.module.ts <<'EOF_MANUAL'
import { Module } from '@nestjs/common';
import { EnvironmentModule } from './config/environment/environment.module.js';
import { HealthController } from './health/health.controller.js';
import { SequelizeModule } from './infrastructure/database/sequelize/sequelize.module.js';

@Module({
  imports: [EnvironmentModule, SequelizeModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
EOF_MANUAL
```

> **Versión mínima**: en SEG-10 añadiremos `BusinessModule` + `SeedersRunner`.

> ✅ **Fin de SEG-02**: configuración, errores, interceptores y BD listos. La app arranca y conecta.

> **Checkpoint de commit:** `npm run start:dev`, verifica `curl http://localhost:3010/api/health` → `{"status":"ok"}`, y haz tu primer commit del backend manual: `feat(backend-manual): esqueleto + health + swagger`.

---

## 5. SEG-03 · Feature clientes

> **Segmento:** primera feature completa. Fija el patrón Clean Architecture que se repite en las demás. Orden: `domain → application → infrastructure → presentation`.
> Corresponde a la entidad **Cliente** del SDD (sección 4.1, fila 1).

### 5.1 Capa de dominio

> 🟢 `domain`

```bash
cat > src/features/business/clientes/domain/entities/cliente.entity.ts <<'EOF_MANUAL'
export type ClienteEstado = 'active' | 'inactive';

export interface ClienteProps {
  id?: number | null;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  estado?: ClienteEstado;
}

export class Cliente {
  readonly id: number | null;
  readonly tipoDocumento: string;
  readonly numeroDocumento: string;
  readonly nombre: string;
  readonly telefono: string | null;
  readonly email: string | null;
  readonly estado: ClienteEstado;

  constructor(props: ClienteProps) {
    this.id = props.id ?? null;
    this.tipoDocumento = props.tipoDocumento;
    this.numeroDocumento = props.numeroDocumento;
    this.nombre = props.nombre;
    this.telefono = props.telefono ?? null;
    this.email = props.email ?? null;
    this.estado = props.estado ?? 'active';
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/clientes/domain/interfaces/cliente.repository.ts <<'EOF_MANUAL'
import { Cliente } from '../entities/cliente.entity.js';

export const CLIENTE_REPOSITORY = 'IClienteRepository';

export interface IClienteRepository {
  create(cliente: Cliente): Promise<Cliente>;
  findAll(page: number, limit: number): Promise<{ items: Cliente[]; total: number }>;
  findById(id: number): Promise<Cliente | null>;
  findByNumeroDocumento(numeroDocumento: string): Promise<Cliente | null>;
  count(): Promise<number>;
}
EOF_MANUAL
```

```bash
cat > src/features/business/clientes/domain/exceptions/cliente-not-found.exception.ts <<'EOF_MANUAL'
import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class ClienteNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Cliente con id ${id} no encontrado`);
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/clientes/domain/exceptions/documento-ya-existe.exception.ts <<'EOF_MANUAL'
import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

export class DocumentoYaExisteException extends BusinessRuleException {
  constructor(numeroDocumento: string) {
    super(`Ya existe un cliente con el documento ${numeroDocumento}`);
  }
}
EOF_MANUAL
```

### 5.2 Capa de aplicación

> 🔵 `application`

```bash
cat > src/features/business/clientes/application/dto/create-cliente.dto.ts <<'EOF_MANUAL'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ example: 'NIT' })
  @IsString()
  @IsNotEmpty({ message: 'tipoDocumento es requerido' })
  @MaxLength(20)
  tipoDocumento!: string;

  @ApiProperty({ example: '900123456-7' })
  @IsString()
  @IsNotEmpty({ message: 'numeroDocumento es requerido' })
  @MaxLength(30)
  numeroDocumento!: string;

  @ApiProperty({ example: 'Postobón S.A.' })
  @IsString()
  @IsNotEmpty({ message: 'nombre es requerido' })
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @ApiPropertyOptional({ example: 'contacto@postobon.com' })
  @IsOptional()
  @IsEmail({}, { message: 'email debe ser un correo válido' })
  @MaxLength(150)
  email?: string;
}
EOF_MANUAL
```

```bash
cat > src/features/business/clientes/application/mappers/cliente.mapper.ts <<'EOF_MANUAL'
import { Cliente } from '../../domain/entities/cliente.entity.js';
import { CreateClienteDto } from '../dto/create-cliente.dto.js';

export class ClienteMapper {
  static toEntity(dto: CreateClienteDto): Cliente {
    return new Cliente({
      tipoDocumento: dto.tipoDocumento,
      numeroDocumento: dto.numeroDocumento,
      nombre: dto.nombre,
      telefono: dto.telefono ?? null,
      email: dto.email ?? null,
      estado: 'active',
    });
  }

  static toResponse(cliente: Cliente) {
    return {
      id: cliente.id,
      tipoDocumento: cliente.tipoDocumento,
      numeroDocumento: cliente.numeroDocumento,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email,
      estado: cliente.estado,
    };
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/clientes/application/use-cases/create-cliente.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { DocumentoYaExisteException } from '../../domain/exceptions/documento-ya-existe.exception.js';
import { CLIENTE_REPOSITORY } from '../../domain/interfaces/cliente.repository.js';
import type { IClienteRepository } from '../../domain/interfaces/cliente.repository.js';
import { CreateClienteDto } from '../dto/create-cliente.dto.js';
import { ClienteMapper } from '../mappers/cliente.mapper.js';
import type { Cliente } from '../../domain/entities/cliente.entity.js';

@Injectable()
export class CreateClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(dto: CreateClienteDto): Promise<Cliente> {
    const existing = await this.clienteRepository.findByNumeroDocumento(dto.numeroDocumento);
    if (existing) {
      throw new DocumentoYaExisteException(dto.numeroDocumento);
    }
    return this.clienteRepository.create(ClienteMapper.toEntity(dto));
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/clientes/application/use-cases/get-cliente-by-id.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { ClienteNotFoundException } from '../../domain/exceptions/cliente-not-found.exception.js';
import { CLIENTE_REPOSITORY } from '../../domain/interfaces/cliente.repository.js';
import type { IClienteRepository } from '../../domain/interfaces/cliente.repository.js';
import type { Cliente } from '../../domain/entities/cliente.entity.js';

@Injectable()
export class GetClienteByIdUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      throw new ClienteNotFoundException(id);
    }
    return cliente;
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/clientes/application/use-cases/list-clientes.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { CLIENTE_REPOSITORY } from '../../domain/interfaces/cliente.repository.js';
import type { IClienteRepository } from '../../domain/interfaces/cliente.repository.js';
import { ClienteMapper } from '../mappers/cliente.mapper.js';

@Injectable()
export class ListClientesUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepository: IClienteRepository,
  ) {}

  async execute(page: number, limit: number) {
    const { items, total } = await this.clienteRepository.findAll(page, limit);
    return {
      items: items.map(ClienteMapper.toResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
EOF_MANUAL
```

### 5.3 Capa de infraestructura

> 🟠 `infrastructure`

```bash
cat > src/features/business/clientes/infrastructure/persistence/models/cliente.model.ts <<'EOF_MANUAL'
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'clientes', timestamps: true })
export class ClienteModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare tipoDocumento: string;

  @Column({ type: DataType.STRING(30), allowNull: false, unique: true })
  declare numeroDocumento: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.STRING(30), allowNull: true })
  declare telefono: string | null;

  @Column({ type: DataType.STRING(150), allowNull: true })
  declare email: string | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'active' })
  declare estado: string;
}
EOF_MANUAL
```

**Registrar el modelo** en `sequelize.factory.ts` (import + `ALL_MODELS`):

```ts
import { ClienteModel } from '../../../features/business/clientes/infrastructure/persistence/models/cliente.model.js';

export const ALL_MODELS: any[] = [
  ClienteModel,
];
```

```bash
cat > src/features/business/clientes/infrastructure/persistence/repositories/cliente.repository.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { Cliente } from '../../../domain/entities/cliente.entity.js';
import type { ClienteEstado } from '../../../domain/entities/cliente.entity.js';
import { IClienteRepository } from '../../../domain/interfaces/cliente.repository.js';
import { ClienteModel } from '../models/cliente.model.js';

@Injectable()
export class ClienteRepository implements IClienteRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  private get repo() {
    return this.sequelize.getRepository(ClienteModel);
  }

  async create(cliente: Cliente): Promise<Cliente> {
    const created = await this.repo.create({
      tipoDocumento: cliente.tipoDocumento,
      numeroDocumento: cliente.numeroDocumento,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email,
      estado: cliente.estado,
    });
    return this.toDomain(created);
  }

  async findAll(page: number, limit: number) {
    const { rows, count } = await this.repo.findAndCountAll({
      offset: (page - 1) * limit,
      limit,
      order: [['id', 'ASC']],
    });
    return { items: rows.map((r) => this.toDomain(r)), total: count };
  }

  async findById(id: number): Promise<Cliente | null> {
    const found = await this.repo.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async findByNumeroDocumento(numeroDocumento: string): Promise<Cliente | null> {
    const found = await this.repo.findOne({ where: { numeroDocumento } });
    return found ? this.toDomain(found) : null;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  private toDomain(m: ClienteModel): Cliente {
    return new Cliente({
      id: m.id,
      tipoDocumento: m.tipoDocumento,
      numeroDocumento: m.numeroDocumento,
      nombre: m.nombre,
      telefono: m.telefono ?? null,
      email: m.email ?? null,
      estado: (m.estado as ClienteEstado) ?? 'active',
    });
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/clientes/infrastructure/persistence/seeders/cliente.seeder.ts <<'EOF_MANUAL'
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cliente } from '../../../domain/entities/cliente.entity.js';
import { CLIENTE_REPOSITORY } from '../../../domain/interfaces/cliente.repository.js';
import type { IClienteRepository } from '../../../domain/interfaces/cliente.repository.js';

@Injectable()
export class ClienteSeeder {
  private readonly logger = new Logger(ClienteSeeder.name);

  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepository: IClienteRepository,
  ) {}

  async seed(): Promise<void> {
    const numeroDocumento = '900123456-7';
    const existing = await this.clienteRepository.findByNumeroDocumento(numeroDocumento);
    if (existing) {
      this.logger.log('Seeder clientes: ya existía el cliente demo (idempotente)');
      return;
    }
    await this.clienteRepository.create(
      new Cliente({
        tipoDocumento: 'NIT',
        numeroDocumento,
        nombre: 'Postobón S.A.',
        telefono: '3001234567',
        email: 'contacto@postobon.com',
        estado: 'active',
      }),
    );
    this.logger.log('Seeder clientes: cliente demo creado');
  }
}
EOF_MANUAL
```

### 5.4 Capa de presentación

> 🟣 `presentation`

```bash
cat > src/features/business/clientes/presentation/http/controllers/clientes.controller.ts <<'EOF_MANUAL'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateClienteDto } from '../../../application/dto/create-cliente.dto.js';
import { ClienteMapper } from '../../../application/mappers/cliente.mapper.js';
import { CreateClienteUseCase } from '../../../application/use-cases/create-cliente.use-case.js';
import { GetClienteByIdUseCase } from '../../../application/use-cases/get-cliente-by-id.use-case.js';
import { ListClientesUseCase } from '../../../application/use-cases/list-clientes.use-case.js';

@ApiTags('clientes')
@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly createCliente: CreateClienteUseCase,
    private readonly listClientes: ListClientesUseCase,
    private readonly getCliente: GetClienteByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear cliente' })
  async create(@Body() dto: CreateClienteDto) {
    const cliente = await this.createCliente.execute(dto);
    return ClienteMapper.toResponse(cliente);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes (paginado)' })
  async list(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.listClientes.execute(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const cliente = await this.getCliente.execute(id);
    return ClienteMapper.toResponse(cliente);
  }
}
EOF_MANUAL
```

### 5.5 Módulo de la feature

```bash
cat > src/features/business/clientes/clientes.module.ts <<'EOF_MANUAL'
import { Module } from '@nestjs/common';
import { CreateClienteUseCase } from './application/use-cases/create-cliente.use-case.js';
import { GetClienteByIdUseCase } from './application/use-cases/get-cliente-by-id.use-case.js';
import { ListClientesUseCase } from './application/use-cases/list-clientes.use-case.js';
import { CLIENTE_REPOSITORY } from './domain/interfaces/cliente.repository.js';
import { ClienteRepository } from './infrastructure/persistence/repositories/cliente.repository.js';
import { ClienteSeeder } from './infrastructure/persistence/seeders/cliente.seeder.js';
import { ClientesController } from './presentation/http/controllers/clientes.controller.js';

@Module({
  controllers: [ClientesController],
  providers: [
    CreateClienteUseCase,
    ListClientesUseCase,
    GetClienteByIdUseCase,
    ClienteSeeder,
    { provide: CLIENTE_REPOSITORY, useClass: ClienteRepository },
  ],
  exports: [CLIENTE_REPOSITORY, ClienteSeeder],
})
export class ClientesModule {}
EOF_MANUAL
```

> ✅ **Fin de SEG-03**: feature `clientes` completa. El patrón se repite en SEG-04 a SEG-09.
> **Checkpoint de commit:** `feat(backend-manual): feature clientes completa (CRUD create/list/get)`.

---

## 6. SEG-04 · Feature campanias

> **Segmento:** entidad Campania, FK a Cliente. Corresponde a SDD 4.1 fila 2.

### 6.1 Capa de dominio

> 🟢 `domain`

```bash
cat > src/features/business/campanias/domain/entities/campania.entity.ts <<'EOF_MANUAL'
export interface CampaniaProps {
  id?: number | null;
  clienteId: number;
  nombre: string;
  descripcion?: string | null;
  isActive?: boolean;
}

export class Campania {
  readonly id: number | null;
  readonly clienteId: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly isActive: boolean;

  constructor(props: CampaniaProps) {
    this.id = props.id ?? null;
    this.clienteId = props.clienteId;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion ?? null;
    this.isActive = props.isActive ?? true;
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/campanias/domain/interfaces/campania.repository.ts <<'EOF_MANUAL'
import { Campania } from '../entities/campania.entity.js';

export const CAMPANIA_REPOSITORY = 'ICampaniaRepository';

export interface ICampaniaRepository {
  create(campania: Campania): Promise<Campania>;
  findAll(page: number, limit: number): Promise<{ items: Campania[]; total: number }>;
  findById(id: number): Promise<Campania | null>;
  count(): Promise<number>;
}
EOF_MANUAL
```

```bash
cat > src/features/business/campanias/domain/exceptions/campania-not-found.exception.ts <<'EOF_MANUAL'
import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class CampaniaNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Campaña con id ${id} no encontrada`);
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/campanias/domain/exceptions/campania-inactiva.exception.ts <<'EOF_MANUAL'
import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

export class CampaniaInactivaException extends BusinessRuleException {
  constructor(campaniaId: number) {
    // RN-08: una campaña inactiva no admite hitos nuevos
    super(`La campaña con id ${campaniaId} está inactiva y no admite hitos nuevos`);
  }
}
EOF_MANUAL
```

### 6.2 Capa de aplicación

> 🔵 `application` — valida que el Cliente exista antes de crear la campaña.

```bash
cat > src/features/business/campanias/application/dto/create-campania.dto.ts <<'EOF_MANUAL'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCampaniaDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'clienteId debe ser entero' })
  @Min(1, { message: 'clienteId es requerido' })
  clienteId!: number;

  @ApiProperty({ example: 'Carnaval 2026' })
  @IsString()
  @IsNotEmpty({ message: 'nombre es requerido' })
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: 'Campaña de carnaval para redes y vallas' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
EOF_MANUAL
```

```bash
cat > src/features/business/campanias/application/mappers/campania.mapper.ts <<'EOF_MANUAL'
import { Campania } from '../../domain/entities/campania.entity.js';
import { CreateCampaniaDto } from '../dto/create-campania.dto.js';

export class CampaniaMapper {
  static toEntity(dto: CreateCampaniaDto): Campania {
    return new Campania({
      clienteId: dto.clienteId,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      isActive: true,
    });
  }

  static toResponse(c: Campania) {
    return {
      id: c.id,
      clienteId: c.clienteId,
      nombre: c.nombre,
      descripcion: c.descripcion,
      isActive: c.isActive,
    };
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/campanias/application/use-cases/create-campania.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { CLIENTE_REPOSITORY } from '../../../clientes/domain/interfaces/cliente.repository.js';
import type { IClienteRepository } from '../../../clientes/domain/interfaces/cliente.repository.js';
import { ClienteNotFoundException } from '../../../clientes/domain/exceptions/cliente-not-found.exception.js';
import { CAMPANIA_REPOSITORY } from '../../domain/interfaces/campania.repository.js';
import type { ICampaniaRepository } from '../../domain/interfaces/campania.repository.js';
import type { Campania } from '../../domain/entities/campania.entity.js';
import { CreateCampaniaDto } from '../dto/create-campania.dto.js';
import { CampaniaMapper } from '../mappers/campania.mapper.js';

@Injectable()
export class CreateCampaniaUseCase {
  constructor(
    @Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepo: ICampaniaRepository,
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
  ) {}

  async execute(dto: CreateCampaniaDto): Promise<Campania> {
    const cliente = await this.clienteRepo.findById(dto.clienteId);
    if (!cliente) {
      throw new ClienteNotFoundException(dto.clienteId);
    }
    return this.campaniaRepo.create(CampaniaMapper.toEntity(dto));
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/campanias/application/use-cases/get-campania-by-id.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { CampaniaNotFoundException } from '../../domain/exceptions/campania-not-found.exception.js';
import { CAMPANIA_REPOSITORY } from '../../domain/interfaces/campania.repository.js';
import type { ICampaniaRepository } from '../../domain/interfaces/campania.repository.js';
import type { Campania } from '../../domain/entities/campania.entity.js';

@Injectable()
export class GetCampaniaByIdUseCase {
  constructor(
    @Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepo: ICampaniaRepository,
  ) {}

  async execute(id: number): Promise<Campania> {
    const campania = await this.campaniaRepo.findById(id);
    if (!campania) {
      throw new CampaniaNotFoundException(id);
    }
    return campania;
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/campanias/application/use-cases/list-campanias.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { CAMPANIA_REPOSITORY } from '../../domain/interfaces/campania.repository.js';
import type { ICampaniaRepository } from '../../domain/interfaces/campania.repository.js';
import { CampaniaMapper } from '../mappers/campania.mapper.js';

@Injectable()
export class ListCampaniasUseCase {
  constructor(
    @Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepo: ICampaniaRepository,
  ) {}

  async execute(page: number, limit: number) {
    const { items, total } = await this.campaniaRepo.findAll(page, limit);
    return {
      items: items.map(CampaniaMapper.toResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
EOF_MANUAL
```

### 6.3 Capa de infraestructura

> 🟠 `infrastructure` — modelo con FK a `clientes`.

```bash
cat > src/features/business/campanias/infrastructure/persistence/models/campania.model.ts <<'EOF_MANUAL'
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ClienteModel } from '../../../../clientes/infrastructure/persistence/models/cliente.model.js';

@Table({ tableName: 'campanias', timestamps: true })
export class CampaniaModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => ClienteModel)
  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare clienteId: number;

  @BelongsTo(() => ClienteModel)
  cliente?: ClienteModel;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descripcion: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;
}
EOF_MANUAL
```

**Registrar el modelo** en `sequelize.factory.ts`:

```ts
import { CampaniaModel } from '../../../features/business/campanias/infrastructure/persistence/models/campania.model.js';

export const ALL_MODELS: any[] = [
  ClienteModel,
  CampaniaModel,
];
```

```bash
cat > src/features/business/campanias/infrastructure/persistence/repositories/campania.repository.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { Campania } from '../../../domain/entities/campania.entity.js';
import { ICampaniaRepository } from '../../../domain/interfaces/campania.repository.js';
import { CampaniaModel } from '../models/campania.model.js';

@Injectable()
export class CampaniaRepository implements ICampaniaRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  private get repo() {
    return this.sequelize.getRepository(CampaniaModel);
  }

  async create(campania: Campania): Promise<Campania> {
    const created = await this.repo.create({
      clienteId: campania.clienteId,
      nombre: campania.nombre,
      descripcion: campania.descripcion,
      isActive: campania.isActive,
    });
    return this.toDomain(created);
  }

  async findAll(page: number, limit: number) {
    const { rows, count } = await this.repo.findAndCountAll({
      offset: (page - 1) * limit,
      limit,
      order: [['id', 'ASC']],
    });
    return { items: rows.map((r) => this.toDomain(r)), total: count };
  }

  async findById(id: number): Promise<Campania | null> {
    const found = await this.repo.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  private toDomain(m: CampaniaModel): Campania {
    return new Campania({
      id: m.id,
      clienteId: m.clienteId,
      nombre: m.nombre,
      descripcion: m.descripcion ?? null,
      isActive: m.isActive,
    });
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/campanias/infrastructure/persistence/seeders/campania.seeder.ts <<'EOF_MANUAL'
import { Inject, Injectable, Logger } from "@nestjs/common";
import { CLIENTE_REPOSITORY } from '../../../../clientes/domain/interfaces/cliente.repository.js';
import type { IClienteRepository } from '../../../../clientes/domain/interfaces/cliente.repository.js';
import { Campania } from '../../../domain/entities/campania.entity.js';
import { CAMPANIA_REPOSITORY } from '../../../domain/interfaces/campania.repository.js';
import type { ICampaniaRepository } from '../../../domain/interfaces/campania.repository.js';

@Injectable()
export class CampaniaSeeder {
  private readonly logger = new Logger(CampaniaSeeder.name);

  constructor(
    @Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepo: ICampaniaRepository,
    @Inject(CLIENTE_REPOSITORY) private readonly clienteRepo: IClienteRepository,
  ) {}

  async seed(): Promise<void> {
    const { items: clientes } = await this.clienteRepo.findAll(1, 100);
    const cliente = clientes[0];
    if (!cliente || cliente.id === null) {
      this.logger.warn('Seeder campanias: sin cliente demo; no se siembra');
      return;
    }
    const { items: campanias } = await this.campaniaRepo.findAll(1, 100);
    if (campanias.some((c) => c.nombre === 'Carnaval 2026')) {
      this.logger.log('Seeder campanias: ya existía la campaña demo (idempotente)');
      return;
    }
    await this.campaniaRepo.create(
      new Campania({
        clienteId: cliente.id,
        nombre: 'Carnaval 2026',
        descripcion: 'Campaña de carnaval para redes y vallas',
        isActive: true,
      }),
    );
    this.logger.log('Seeder campanias: campaña demo creada');
  }
}
EOF_MANUAL
```

### 6.4 Capa de presentación + módulo

> 🟣 `presentation`

```bash
cat > src/features/business/campanias/presentation/http/controllers/campanias.controller.ts <<'EOF_MANUAL'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCampaniaDto } from '../../../application/dto/create-campania.dto.js';
import { CampaniaMapper } from '../../../application/mappers/campania.mapper.js';
import { CreateCampaniaUseCase } from '../../../application/use-cases/create-campania.use-case.js';
import { GetCampaniaByIdUseCase } from '../../../application/use-cases/get-campania-by-id.use-case.js';
import { ListCampaniasUseCase } from '../../../application/use-cases/list-campanias.use-case.js';

@ApiTags('campanias')
@Controller('campanias')
export class CampaniasController {
  constructor(
    private readonly createCampania: CreateCampaniaUseCase,
    private readonly listCampanias: ListCampaniasUseCase,
    private readonly getCampania: GetCampaniaByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear campaña' })
  async create(@Body() dto: CreateCampaniaDto) {
    const campania = await this.createCampania.execute(dto);
    return CampaniaMapper.toResponse(campania);
  }

  @Get()
  @ApiOperation({ summary: 'Listar campañas (paginado)' })
  async list(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.listCampanias.execute(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener campaña por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const campania = await this.getCampania.execute(id);
    return CampaniaMapper.toResponse(campania);
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/campanias/campanias.module.ts <<'EOF_MANUAL'
import { Module } from '@nestjs/common';
import { ClientesModule } from '../clientes/clientes.module.js';
import { CreateCampaniaUseCase } from './application/use-cases/create-campania.use-case.js';
import { GetCampaniaByIdUseCase } from './application/use-cases/get-campania-by-id.use-case.js';
import { ListCampaniasUseCase } from './application/use-cases/list-campanias.use-case.js';
import { CAMPANIA_REPOSITORY } from './domain/interfaces/campania.repository.js';
import { CampaniaRepository } from './infrastructure/persistence/repositories/campania.repository.js';
import { CampaniaSeeder } from './infrastructure/persistence/seeders/campania.seeder.js';
import { CampaniasController } from './presentation/http/controllers/campanias.controller.js';

@Module({
  imports: [ClientesModule],
  controllers: [CampaniasController],
  providers: [
    CreateCampaniaUseCase,
    ListCampaniasUseCase,
    GetCampaniaByIdUseCase,
    CampaniaSeeder,
    { provide: CAMPANIA_REPOSITORY, useClass: CampaniaRepository },
  ],
  exports: [CAMPANIA_REPOSITORY, CampaniaSeeder],
})
export class CampaniasModule {}
EOF_MANUAL
```

> ✅ **Fin de SEG-04**: feature `campanias` completa (con FK a Cliente).
> **Checkpoint de commit:** `feat(backend-manual): feature campanias con FK a cliente`.

---

## 7. SEG-05 · Feature hitos

> **Segmento:** entidad Hito, FK a Campania, con el campo `estado` (ABIERTO/CERRADO/FACTURADO) que sostiene RN-01, RN-02 y RN-06. Corresponde a SDD 4.1 fila 4.

### 7.1 Capa de dominio

> 🟢 `domain` — la entidad encapsula la transición de estado del hito.

```bash
cat > src/features/business/hitos/domain/entities/hito.entity.ts <<'EOF_MANUAL'
import { HitoYaCerradoException } from '../exceptions/hito-ya-cerrado.exception.js';

export type HitoEstado = 'ABIERTO' | 'CERRADO' | 'FACTURADO';

export interface HitoProps {
  id?: number | null;
  campaniaId: number;
  nombre: string;
  descripcion?: string | null;
  estado?: HitoEstado;
  fechaCierre?: Date | null;
  isActive?: boolean;
}

export class Hito {
  readonly id: number | null;
  readonly campaniaId: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  estado: HitoEstado;
  fechaCierre: Date | null;
  readonly isActive: boolean;

  constructor(props: HitoProps) {
    this.id = props.id ?? null;
    this.campaniaId = props.campaniaId;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion ?? null;
    this.estado = props.estado ?? 'ABIERTO';
    this.fechaCierre = props.fechaCierre ?? null;
    this.isActive = props.isActive ?? true;
  }

  // RN-02: el hito se cierra automáticamente cuando todos sus entregables
  // tienen su versión más reciente APROBADA (ver feature aprobaciones).
  // RN-06: un hito cerrado no admite nuevas versiones ni aprobaciones.
  cerrar(): void {
    if (this.estado !== 'ABIERTO') {
      throw new HitoYaCerradoException(this.id);
    }
    this.estado = 'CERRADO';
    this.fechaCierre = new Date();
  }

  estaAbierto(): boolean {
    return this.estado === 'ABIERTO';
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/hitos/domain/interfaces/hito.repository.ts <<'EOF_MANUAL'
import { Hito } from '../entities/hito.entity.js';

export const HITO_REPOSITORY = 'IHitoRepository';

export interface IHitoRepository {
  create(hito: Hito): Promise<Hito>;
  findAll(page: number, limit: number): Promise<{ items: Hito[]; total: number }>;
  findById(id: number): Promise<Hito | null>;
  count(): Promise<number>;
  // Persiste el cambio de estado (usado por CerrarHitoUseCase, dentro de una transacción externa)
  actualizarEstado(id: number, estado: string, fechaCierre: Date | null): Promise<void>;
}
EOF_MANUAL
```

```bash
cat > src/features/business/hitos/domain/exceptions/hito-not-found.exception.ts <<'EOF_MANUAL'
import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class HitoNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Hito con id ${id} no encontrado`);
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/hitos/domain/exceptions/hito-ya-cerrado.exception.ts <<'EOF_MANUAL'
import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

export class HitoYaCerradoException extends BusinessRuleException {
  constructor(hitoId: number | null) {
    // RN-06: un hito cerrado no se reabre ni admite nuevas versiones/aprobaciones
    super(`El hito ${hitoId ?? '(desconocido)'} ya está cerrado`);
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/hitos/domain/exceptions/campania-inactiva-para-hito.exception.ts <<'EOF_MANUAL'
import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

export class CampaniaInactivaParaHitoException extends BusinessRuleException {
  constructor(campaniaId: number) {
    // RN-08
    super(`La campaña ${campaniaId} está inactiva; no admite hitos nuevos`);
  }
}
EOF_MANUAL
```

### 7.2 Capa de aplicación

> 🔵 `application` — valida que la Campania exista y esté activa (RN-08) antes de crear el hito.

```bash
cat > src/features/business/hitos/application/dto/create-hito.dto.ts <<'EOF_MANUAL'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateHitoDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'campaniaId debe ser entero' })
  @Min(1, { message: 'campaniaId es requerido' })
  campaniaId!: number;

  @ApiProperty({ example: 'Piezas para redes sociales' })
  @IsString()
  @IsNotEmpty({ message: 'nombre es requerido' })
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: 'Diseño de post e historias para Instagram' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
EOF_MANUAL
```

```bash
cat > src/features/business/hitos/application/mappers/hito.mapper.ts <<'EOF_MANUAL'
import { Hito } from '../../domain/entities/hito.entity.js';
import { CreateHitoDto } from '../dto/create-hito.dto.js';

export class HitoMapper {
  static toEntity(dto: CreateHitoDto): Hito {
    return new Hito({
      campaniaId: dto.campaniaId,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      estado: 'ABIERTO',
    });
  }

  static toResponse(h: Hito) {
    return {
      id: h.id,
      campaniaId: h.campaniaId,
      nombre: h.nombre,
      descripcion: h.descripcion,
      estado: h.estado,
      fechaCierre: h.fechaCierre,
      isActive: h.isActive,
    };
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/hitos/application/use-cases/create-hito.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { CAMPANIA_REPOSITORY } from '../../../campanias/domain/interfaces/campania.repository.js';
import type { ICampaniaRepository } from '../../../campanias/domain/interfaces/campania.repository.js';
import { CampaniaNotFoundException } from '../../../campanias/domain/exceptions/campania-not-found.exception.js';
import { CampaniaInactivaParaHitoException } from '../../domain/exceptions/campania-inactiva-para-hito.exception.js';
import { HITO_REPOSITORY } from '../../domain/interfaces/hito.repository.js';
import type { IHitoRepository } from '../../domain/interfaces/hito.repository.js';
import type { Hito } from '../../domain/entities/hito.entity.js';
import { CreateHitoDto } from '../dto/create-hito.dto.js';
import { HitoMapper } from '../mappers/hito.mapper.js';

@Injectable()
export class CreateHitoUseCase {
  constructor(
    @Inject(HITO_REPOSITORY) private readonly hitoRepo: IHitoRepository,
    @Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepo: ICampaniaRepository,
  ) {}

  async execute(dto: CreateHitoDto): Promise<Hito> {
    const campania = await this.campaniaRepo.findById(dto.campaniaId);
    if (!campania) {
      throw new CampaniaNotFoundException(dto.campaniaId);
    }
    if (!campania.isActive) {
      // RN-08
      throw new CampaniaInactivaParaHitoException(dto.campaniaId);
    }
    return this.hitoRepo.create(HitoMapper.toEntity(dto));
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/hitos/application/use-cases/get-hito-by-id.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { HitoNotFoundException } from '../../domain/exceptions/hito-not-found.exception.js';
import { HITO_REPOSITORY } from '../../domain/interfaces/hito.repository.js';
import type { IHitoRepository } from '../../domain/interfaces/hito.repository.js';
import type { Hito } from '../../domain/entities/hito.entity.js';

@Injectable()
export class GetHitoByIdUseCase {
  constructor(
    @Inject(HITO_REPOSITORY) private readonly hitoRepo: IHitoRepository,
  ) {}

  async execute(id: number): Promise<Hito> {
    const hito = await this.hitoRepo.findById(id);
    if (!hito) {
      throw new HitoNotFoundException(id);
    }
    return hito;
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/hitos/application/use-cases/list-hitos.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { HITO_REPOSITORY } from '../../domain/interfaces/hito.repository.js';
import type { IHitoRepository } from '../../domain/interfaces/hito.repository.js';
import { HitoMapper } from '../mappers/hito.mapper.js';

@Injectable()
export class ListHitosUseCase {
  constructor(
    @Inject(HITO_REPOSITORY) private readonly hitoRepo: IHitoRepository,
  ) {}

  async execute(page: number, limit: number) {
    const { items, total } = await this.hitoRepo.findAll(page, limit);
    return {
      items: items.map(HitoMapper.toResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
EOF_MANUAL
```

### 7.3 Capa de infraestructura

> 🟠 `infrastructure` — modelo con FK a `campanias`, campo `estado` y `fechaCierre`.

```bash
cat > src/features/business/hitos/infrastructure/persistence/models/hito.model.ts <<'EOF_MANUAL'
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CampaniaModel } from '../../../../campanias/infrastructure/persistence/models/campania.model.js';

@Table({ tableName: 'hitos', timestamps: true })
export class HitoModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => CampaniaModel)
  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare campaniaId: number;

  @BelongsTo(() => CampaniaModel)
  campania?: CampaniaModel;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descripcion: string | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'ABIERTO' })
  declare estado: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fechaCierre: Date | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;
}
EOF_MANUAL
```

**Registrar el modelo** en `sequelize.factory.ts`:

```ts
import { HitoModel } from '../../../features/business/hitos/infrastructure/persistence/models/hito.model.js';

export const ALL_MODELS: any[] = [
  ClienteModel,
  CampaniaModel,
  HitoModel,
];
```

```bash
cat > src/features/business/hitos/infrastructure/persistence/repositories/hito.repository.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { Hito } from '../../../domain/entities/hito.entity.js';
import type { HitoEstado } from '../../../domain/entities/hito.entity.js';
import { IHitoRepository } from '../../../domain/interfaces/hito.repository.js';
import { HitoModel } from '../models/hito.model.js';

@Injectable()
export class HitoRepository implements IHitoRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  private get repo() {
    return this.sequelize.getRepository(HitoModel);
  }

  async create(hito: Hito): Promise<Hito> {
    const created = await this.repo.create({
      campaniaId: hito.campaniaId,
      nombre: hito.nombre,
      descripcion: hito.descripcion,
      estado: hito.estado,
      fechaCierre: hito.fechaCierre,
      isActive: hito.isActive,
    });
    return this.toDomain(created);
  }

  async findAll(page: number, limit: number) {
    const { rows, count } = await this.repo.findAndCountAll({
      offset: (page - 1) * limit,
      limit,
      order: [['id', 'ASC']],
    });
    return { items: rows.map((r) => this.toDomain(r)), total: count };
  }

  async findById(id: number): Promise<Hito | null> {
    const found = await this.repo.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async actualizarEstado(id: number, estado: string, fechaCierre: Date | null): Promise<void> {
    await this.repo.update({ estado, fechaCierre }, { where: { id } });
  }

  private toDomain(m: HitoModel): Hito {
    return new Hito({
      id: m.id,
      campaniaId: m.campaniaId,
      nombre: m.nombre,
      descripcion: m.descripcion ?? null,
      estado: (m.estado as HitoEstado) ?? 'ABIERTO',
      fechaCierre: m.fechaCierre ?? null,
      isActive: m.isActive,
    });
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/hitos/infrastructure/persistence/seeders/hito.seeder.ts <<'EOF_MANUAL'
import { Inject, Injectable, Logger } from "@nestjs/common";
import { CAMPANIA_REPOSITORY } from '../../../../campanias/domain/interfaces/campania.repository.js';
import type { ICampaniaRepository } from '../../../../campanias/domain/interfaces/campania.repository.js';
import { Hito } from '../../../domain/entities/hito.entity.js';
import { HITO_REPOSITORY } from '../../../domain/interfaces/hito.repository.js';
import type { IHitoRepository } from '../../../domain/interfaces/hito.repository.js';

@Injectable()
export class HitoSeeder {
  private readonly logger = new Logger(HitoSeeder.name);

  constructor(
    @Inject(HITO_REPOSITORY) private readonly hitoRepo: IHitoRepository,
    @Inject(CAMPANIA_REPOSITORY) private readonly campaniaRepo: ICampaniaRepository,
  ) {}

  async seed(): Promise<void> {
    const { items: campanias } = await this.campaniaRepo.findAll(1, 100);
    const campania = campanias.find((c) => c.isActive);
    if (!campania || campania.id === null) {
      this.logger.warn('Seeder hitos: sin campaña activa; no se siembra');
      return;
    }
    const { items: hitos } = await this.hitoRepo.findAll(1, 100);
    if (hitos.some((h) => h.nombre === 'Piezas para redes sociales')) {
      this.logger.log('Seeder hitos: ya existía el hito demo (idempotente)');
      return;
    }
    await this.hitoRepo.create(
      new Hito({
        campaniaId: campania.id,
        nombre: 'Piezas para redes sociales',
        descripcion: 'Diseño de post e historias para Instagram',
        estado: 'ABIERTO',
      }),
    );
    this.logger.log('Seeder hitos: hito demo creado');
  }
}
EOF_MANUAL
```

### 7.4 Capa de presentación + módulo

> 🟣 `presentation`

```bash
cat > src/features/business/hitos/presentation/http/controllers/hitos.controller.ts <<'EOF_MANUAL'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateHitoDto } from '../../../application/dto/create-hito.dto.js';
import { HitoMapper } from '../../../application/mappers/hito.mapper.js';
import { CreateHitoUseCase } from '../../../application/use-cases/create-hito.use-case.js';
import { GetHitoByIdUseCase } from '../../../application/use-cases/get-hito-by-id.use-case.js';
import { ListHitosUseCase } from '../../../application/use-cases/list-hitos.use-case.js';

@ApiTags('hitos')
@Controller('hitos')
export class HitosController {
  constructor(
    private readonly createHito: CreateHitoUseCase,
    private readonly listHitos: ListHitosUseCase,
    private readonly getHito: GetHitoByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear hito' })
  async create(@Body() dto: CreateHitoDto) {
    const hito = await this.createHito.execute(dto);
    return HitoMapper.toResponse(hito);
  }

  @Get()
  @ApiOperation({ summary: 'Listar hitos (paginado)' })
  async list(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.listHitos.execute(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener hito por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const hito = await this.getHito.execute(id);
    return HitoMapper.toResponse(hito);
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/hitos/hitos.module.ts <<'EOF_MANUAL'
import { Module } from '@nestjs/common';
import { CampaniasModule } from '../campanias/campanias.module.js';
import { CreateHitoUseCase } from './application/use-cases/create-hito.use-case.js';
import { GetHitoByIdUseCase } from './application/use-cases/get-hito-by-id.use-case.js';
import { ListHitosUseCase } from './application/use-cases/list-hitos.use-case.js';
import { HITO_REPOSITORY } from './domain/interfaces/hito.repository.js';
import { HitoRepository } from './infrastructure/persistence/repositories/hito.repository.js';
import { HitoSeeder } from './infrastructure/persistence/seeders/hito.seeder.js';
import { HitosController } from './presentation/http/controllers/hitos.controller.js';

@Module({
  imports: [CampaniasModule],
  controllers: [HitosController],
  providers: [
    CreateHitoUseCase,
    ListHitosUseCase,
    GetHitoByIdUseCase,
    HitoSeeder,
    { provide: HITO_REPOSITORY, useClass: HitoRepository },
  ],
  exports: [HITO_REPOSITORY, HitoSeeder],
})
export class HitosModule {}
EOF_MANUAL
```

> ✅ **Fin de SEG-05**: feature `hitos` completa. El método `cerrar()` del dominio será invocado por `AprobacionesModule` en SEG-09.
> **Checkpoint de commit:** `feat(backend-manual): feature hitos con estado y regla de cierre`.

---

## 8. SEG-06 · Feature tareas

> **Segmento:** entidad Tarea, FK a Hito. Corresponde a SDD 4.1 fila 5. Mismo patrón que `campanias` (FK simple).

### 8.1 Capa de dominio

> 🟢 `domain`

```bash
cat > src/features/business/tareas/domain/entities/tarea.entity.ts <<'EOF_MANUAL'
export interface TareaProps {
  id?: number | null;
  hitoId: number;
  nombre: string;
  descripcion?: string | null;
  isActive?: boolean;
}

export class Tarea {
  readonly id: number | null;
  readonly hitoId: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly isActive: boolean;

  constructor(props: TareaProps) {
    this.id = props.id ?? null;
    this.hitoId = props.hitoId;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion ?? null;
    this.isActive = props.isActive ?? true;
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/tareas/domain/interfaces/tarea.repository.ts <<'EOF_MANUAL'
import { Tarea } from '../entities/tarea.entity.js';

export const TAREA_REPOSITORY = 'ITareaRepository';

export interface ITareaRepository {
  create(tarea: Tarea): Promise<Tarea>;
  findAll(page: number, limit: number): Promise<{ items: Tarea[]; total: number }>;
  findById(id: number): Promise<Tarea | null>;
  findByHitoId(hitoId: number): Promise<Tarea[]>;
  count(): Promise<number>;
}
EOF_MANUAL
```

```bash
cat > src/features/business/tareas/domain/exceptions/tarea-not-found.exception.ts <<'EOF_MANUAL'
import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class TareaNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Tarea con id ${id} no encontrada`);
  }
}
EOF_MANUAL
```

### 8.2 Capa de aplicación

> 🔵 `application`

```bash
cat > src/features/business/tareas/application/dto/create-tarea.dto.ts <<'EOF_MANUAL'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateTareaDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'hitoId debe ser entero' })
  @Min(1, { message: 'hitoId es requerido' })
  hitoId!: number;

  @ApiProperty({ example: 'Diseñar post de Instagram' })
  @IsString()
  @IsNotEmpty({ message: 'nombre es requerido' })
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: 'Formato cuadrado, paleta de colores del carnaval' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
EOF_MANUAL
```

```bash
cat > src/features/business/tareas/application/mappers/tarea.mapper.ts <<'EOF_MANUAL'
import { Tarea } from '../../domain/entities/tarea.entity.js';
import { CreateTareaDto } from '../dto/create-tarea.dto.js';

export class TareaMapper {
  static toEntity(dto: CreateTareaDto): Tarea {
    return new Tarea({
      hitoId: dto.hitoId,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      isActive: true,
    });
  }

  static toResponse(t: Tarea) {
    return {
      id: t.id,
      hitoId: t.hitoId,
      nombre: t.nombre,
      descripcion: t.descripcion,
      isActive: t.isActive,
    };
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/tareas/application/use-cases/create-tarea.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { HITO_REPOSITORY } from '../../../hitos/domain/interfaces/hito.repository.js';
import type { IHitoRepository } from '../../../hitos/domain/interfaces/hito.repository.js';
import { HitoNotFoundException } from '../../../hitos/domain/exceptions/hito-not-found.exception.js';
import { TAREA_REPOSITORY } from '../../domain/interfaces/tarea.repository.js';
import type { ITareaRepository } from '../../domain/interfaces/tarea.repository.js';
import type { Tarea } from '../../domain/entities/tarea.entity.js';
import { CreateTareaDto } from '../dto/create-tarea.dto.js';
import { TareaMapper } from '../mappers/tarea.mapper.js';

@Injectable()
export class CreateTareaUseCase {
  constructor(
    @Inject(TAREA_REPOSITORY) private readonly tareaRepo: ITareaRepository,
    @Inject(HITO_REPOSITORY) private readonly hitoRepo: IHitoRepository,
  ) {}

  async execute(dto: CreateTareaDto): Promise<Tarea> {
    const hito = await this.hitoRepo.findById(dto.hitoId);
    if (!hito) {
      throw new HitoNotFoundException(dto.hitoId);
    }
    return this.tareaRepo.create(TareaMapper.toEntity(dto));
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/tareas/application/use-cases/get-tarea-by-id.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { TareaNotFoundException } from '../../domain/exceptions/tarea-not-found.exception.js';
import { TAREA_REPOSITORY } from '../../domain/interfaces/tarea.repository.js';
import type { ITareaRepository } from '../../domain/interfaces/tarea.repository.js';
import type { Tarea } from '../../domain/entities/tarea.entity.js';

@Injectable()
export class GetTareaByIdUseCase {
  constructor(
    @Inject(TAREA_REPOSITORY) private readonly tareaRepo: ITareaRepository,
  ) {}

  async execute(id: number): Promise<Tarea> {
    const tarea = await this.tareaRepo.findById(id);
    if (!tarea) {
      throw new TareaNotFoundException(id);
    }
    return tarea;
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/tareas/application/use-cases/list-tareas.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { TAREA_REPOSITORY } from '../../domain/interfaces/tarea.repository.js';
import type { ITareaRepository } from '../../domain/interfaces/tarea.repository.js';
import { TareaMapper } from '../mappers/tarea.mapper.js';

@Injectable()
export class ListTareasUseCase {
  constructor(
    @Inject(TAREA_REPOSITORY) private readonly tareaRepo: ITareaRepository,
  ) {}

  async execute(page: number, limit: number) {
    const { items, total } = await this.tareaRepo.findAll(page, limit);
    return {
      items: items.map(TareaMapper.toResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
EOF_MANUAL
```

### 8.3 Capa de infraestructura

> 🟠 `infrastructure` — modelo con FK a `hitos`.

```bash
cat > src/features/business/tareas/infrastructure/persistence/models/tarea.model.ts <<'EOF_MANUAL'
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { HitoModel } from '../../../../hitos/infrastructure/persistence/models/hito.model.js';

@Table({ tableName: 'tareas', timestamps: true })
export class TareaModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => HitoModel)
  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare hitoId: number;

  @BelongsTo(() => HitoModel)
  hito?: HitoModel;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare descripcion: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;
}
EOF_MANUAL
```

**Registrar el modelo** en `sequelize.factory.ts`:

```ts
import { TareaModel } from '../../../features/business/tareas/infrastructure/persistence/models/tarea.model.js';

export const ALL_MODELS: any[] = [
  ClienteModel,
  CampaniaModel,
  HitoModel,
  TareaModel,
];
```

```bash
cat > src/features/business/tareas/infrastructure/persistence/repositories/tarea.repository.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { Tarea } from '../../../domain/entities/tarea.entity.js';
import { ITareaRepository } from '../../../domain/interfaces/tarea.repository.js';
import { TareaModel } from '../models/tarea.model.js';

@Injectable()
export class TareaRepository implements ITareaRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  private get repo() {
    return this.sequelize.getRepository(TareaModel);
  }

  async create(tarea: Tarea): Promise<Tarea> {
    const created = await this.repo.create({
      hitoId: tarea.hitoId,
      nombre: tarea.nombre,
      descripcion: tarea.descripcion,
      isActive: tarea.isActive,
    });
    return this.toDomain(created);
  }

  async findAll(page: number, limit: number) {
    const { rows, count } = await this.repo.findAndCountAll({
      offset: (page - 1) * limit,
      limit,
      order: [['id', 'ASC']],
    });
    return { items: rows.map((r) => this.toDomain(r)), total: count };
  }

  async findById(id: number): Promise<Tarea | null> {
    const found = await this.repo.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async findByHitoId(hitoId: number): Promise<Tarea[]> {
    const rows = await this.repo.findAll({ where: { hitoId }, order: [['id', 'ASC']] });
    return rows.map((r) => this.toDomain(r));
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  private toDomain(m: TareaModel): Tarea {
    return new Tarea({
      id: m.id,
      hitoId: m.hitoId,
      nombre: m.nombre,
      descripcion: m.descripcion ?? null,
      isActive: m.isActive,
    });
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/tareas/infrastructure/persistence/seeders/tarea.seeder.ts <<'EOF_MANUAL'
import { Inject, Injectable, Logger } from "@nestjs/common";
import { HITO_REPOSITORY } from '../../../../hitos/domain/interfaces/hito.repository.js';
import type { IHitoRepository } from '../../../../hitos/domain/interfaces/hito.repository.js';
import { Tarea } from '../../../domain/entities/tarea.entity.js';
import { TAREA_REPOSITORY } from '../../../domain/interfaces/tarea.repository.js';
import type { ITareaRepository } from '../../../domain/interfaces/tarea.repository.js';

@Injectable()
export class TareaSeeder {
  private readonly logger = new Logger(TareaSeeder.name);

  constructor(
    @Inject(TAREA_REPOSITORY) private readonly tareaRepo: ITareaRepository,
    @Inject(HITO_REPOSITORY) private readonly hitoRepo: IHitoRepository,
  ) {}

  async seed(): Promise<void> {
    const { items: hitos } = await this.hitoRepo.findAll(1, 100);
    const hito = hitos.find((h) => h.estaAbierto());
    if (!hito || hito.id === null) {
      this.logger.warn('Seeder tareas: sin hito abierto; no se siembra');
      return;
    }
    const tareasDelHito = await this.tareaRepo.findByHitoId(hito.id);
    if (tareasDelHito.some((t) => t.nombre === 'Diseñar post de Instagram')) {
      this.logger.log('Seeder tareas: ya existía la tarea demo (idempotente)');
      return;
    }
    await this.tareaRepo.create(
      new Tarea({
        hitoId: hito.id,
        nombre: 'Diseñar post de Instagram',
        descripcion: 'Formato cuadrado, paleta de colores del carnaval',
        isActive: true,
      }),
    );
    this.logger.log('Seeder tareas: tarea demo creada');
  }
}
EOF_MANUAL
```

### 8.4 Capa de presentación + módulo

> 🟣 `presentation`

```bash
cat > src/features/business/tareas/presentation/http/controllers/tareas.controller.ts <<'EOF_MANUAL'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTareaDto } from '../../../application/dto/create-tarea.dto.js';
import { TareaMapper } from '../../../application/mappers/tarea.mapper.js';
import { CreateTareaUseCase } from '../../../application/use-cases/create-tarea.use-case.js';
import { GetTareaByIdUseCase } from '../../../application/use-cases/get-tarea-by-id.use-case.js';
import { ListTareasUseCase } from '../../../application/use-cases/list-tareas.use-case.js';

@ApiTags('tareas')
@Controller('tareas')
export class TareasController {
  constructor(
    private readonly createTarea: CreateTareaUseCase,
    private readonly listTareas: ListTareasUseCase,
    private readonly getTarea: GetTareaByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear tarea' })
  async create(@Body() dto: CreateTareaDto) {
    const tarea = await this.createTarea.execute(dto);
    return TareaMapper.toResponse(tarea);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tareas (paginado)' })
  async list(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.listTareas.execute(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tarea por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const tarea = await this.getTarea.execute(id);
    return TareaMapper.toResponse(tarea);
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/tareas/tareas.module.ts <<'EOF_MANUAL'
import { Module } from '@nestjs/common';
import { HitosModule } from '../hitos/hitos.module.js';
import { CreateTareaUseCase } from './application/use-cases/create-tarea.use-case.js';
import { GetTareaByIdUseCase } from './application/use-cases/get-tarea-by-id.use-case.js';
import { ListTareasUseCase } from './application/use-cases/list-tareas.use-case.js';
import { TAREA_REPOSITORY } from './domain/interfaces/tarea.repository.js';
import { TareaRepository } from './infrastructure/persistence/repositories/tarea.repository.js';
import { TareaSeeder } from './infrastructure/persistence/seeders/tarea.seeder.js';
import { TareasController } from './presentation/http/controllers/tareas.controller.js';

@Module({
  imports: [HitosModule],
  controllers: [TareasController],
  providers: [
    CreateTareaUseCase,
    ListTareasUseCase,
    GetTareaByIdUseCase,
    TareaSeeder,
    { provide: TAREA_REPOSITORY, useClass: TareaRepository },
  ],
  exports: [TAREA_REPOSITORY, TareaSeeder],
})
export class TareasModule {}
EOF_MANUAL
```

> ✅ **Fin de SEG-06**: feature `tareas` completa.
> **Checkpoint de commit:** `feat(backend-manual): feature tareas con FK a hito`.

---

## 9. SEG-07 · Feature entregables

> **Segmento:** entidad Entregable, FK a Tarea. Corresponde a SDD 4.1 fila 7.

### 9.1 Capa de dominio

> 🟢 `domain`

```bash
cat > src/features/business/entregables/domain/entities/entregable.entity.ts <<'EOF_MANUAL'
export type EntregableEstado = 'EN_PROCESO' | 'ENTREGADO';

export interface EntregableProps {
  id?: number | null;
  tareaId: number;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
  total?: number | null;
  estado?: EntregableEstado;
  observaciones?: string | null;
}

export class Entregable {
  readonly id: number | null;
  readonly tareaId: number;
  readonly fechaInicio: Date | null;
  readonly fechaFin: Date | null;
  readonly total: number | null;
  readonly estado: EntregableEstado;
  readonly observaciones: string | null;

  constructor(props: EntregableProps) {
    this.id = props.id ?? null;
    this.tareaId = props.tareaId;
    this.fechaInicio = props.fechaInicio ?? null;
    this.fechaFin = props.fechaFin ?? null;
    this.total = props.total ?? null;
    this.estado = props.estado ?? 'EN_PROCESO';
    this.observaciones = props.observaciones ?? null;
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/entregables/domain/interfaces/entregable.repository.ts <<'EOF_MANUAL'
import { Entregable } from '../entities/entregable.entity.js';

export const ENTREGABLE_REPOSITORY = 'IEntregableRepository';

export interface IEntregableRepository {
  create(entregable: Entregable): Promise<Entregable>;
  findAll(page: number, limit: number): Promise<{ items: Entregable[]; total: number }>;
  findById(id: number): Promise<Entregable | null>;
  findByTareaId(tareaId: number): Promise<Entregable[]>;
  count(): Promise<number>;
}
EOF_MANUAL
```

```bash
cat > src/features/business/entregables/domain/exceptions/entregable-not-found.exception.ts <<'EOF_MANUAL'
import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class EntregableNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Entregable con id ${id} no encontrado`);
  }
}
EOF_MANUAL
```

### 9.2 Capa de aplicación

> 🔵 `application`

```bash
cat > src/features/business/entregables/application/dto/create-entregable.dto.ts <<'EOF_MANUAL'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateEntregableDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'tareaId debe ser entero' })
  @Min(1, { message: 'tareaId es requerido' })
  tareaId!: number;

  @ApiPropertyOptional({ example: 'Primer borrador subido para revisión' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
EOF_MANUAL
```

```bash
cat > src/features/business/entregables/application/mappers/entregable.mapper.ts <<'EOF_MANUAL'
import { Entregable } from '../../domain/entities/entregable.entity.js';
import { CreateEntregableDto } from '../dto/create-entregable.dto.js';

export class EntregableMapper {
  static toEntity(dto: CreateEntregableDto): Entregable {
    return new Entregable({
      tareaId: dto.tareaId,
      fechaInicio: new Date(),
      observaciones: dto.observaciones ?? null,
      estado: 'EN_PROCESO',
    });
  }

  static toResponse(e: Entregable) {
    return {
      id: e.id,
      tareaId: e.tareaId,
      fechaInicio: e.fechaInicio,
      fechaFin: e.fechaFin,
      total: e.total,
      estado: e.estado,
      observaciones: e.observaciones,
    };
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/entregables/application/use-cases/create-entregable.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { TAREA_REPOSITORY } from '../../../tareas/domain/interfaces/tarea.repository.js';
import type { ITareaRepository } from '../../../tareas/domain/interfaces/tarea.repository.js';
import { TareaNotFoundException } from '../../../tareas/domain/exceptions/tarea-not-found.exception.js';
import { ENTREGABLE_REPOSITORY } from '../../domain/interfaces/entregable.repository.js';
import type { IEntregableRepository } from '../../domain/interfaces/entregable.repository.js';
import type { Entregable } from '../../domain/entities/entregable.entity.js';
import { CreateEntregableDto } from '../dto/create-entregable.dto.js';
import { EntregableMapper } from '../mappers/entregable.mapper.js';

@Injectable()
export class CreateEntregableUseCase {
  constructor(
    @Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepo: IEntregableRepository,
    @Inject(TAREA_REPOSITORY) private readonly tareaRepo: ITareaRepository,
  ) {}

  async execute(dto: CreateEntregableDto): Promise<Entregable> {
    const tarea = await this.tareaRepo.findById(dto.tareaId);
    if (!tarea) {
      throw new TareaNotFoundException(dto.tareaId);
    }
    return this.entregableRepo.create(EntregableMapper.toEntity(dto));
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/entregables/application/use-cases/get-entregable-by-id.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { EntregableNotFoundException } from '../../domain/exceptions/entregable-not-found.exception.js';
import { ENTREGABLE_REPOSITORY } from '../../domain/interfaces/entregable.repository.js';
import type { IEntregableRepository } from '../../domain/interfaces/entregable.repository.js';
import type { Entregable } from '../../domain/entities/entregable.entity.js';

@Injectable()
export class GetEntregableByIdUseCase {
  constructor(
    @Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepo: IEntregableRepository,
  ) {}

  async execute(id: number): Promise<Entregable> {
    const entregable = await this.entregableRepo.findById(id);
    if (!entregable) {
      throw new EntregableNotFoundException(id);
    }
    return entregable;
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/entregables/application/use-cases/list-entregables.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { ENTREGABLE_REPOSITORY } from '../../domain/interfaces/entregable.repository.js';
import type { IEntregableRepository } from '../../domain/interfaces/entregable.repository.js';
import { EntregableMapper } from '../mappers/entregable.mapper.js';

@Injectable()
export class ListEntregablesUseCase {
  constructor(
    @Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepo: IEntregableRepository,
  ) {}

  async execute(page: number, limit: number) {
    const { items, total } = await this.entregableRepo.findAll(page, limit);
    return {
      items: items.map(EntregableMapper.toResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
EOF_MANUAL
```

### 9.3 Capa de infraestructura

> 🟠 `infrastructure`

```bash
cat > src/features/business/entregables/infrastructure/persistence/models/entregable.model.ts <<'EOF_MANUAL'
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { TareaModel } from '../../../../tareas/infrastructure/persistence/models/tarea.model.js';

@Table({ tableName: 'entregables', timestamps: true })
export class EntregableModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => TareaModel)
  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare tareaId: number;

  @BelongsTo(() => TareaModel)
  tarea?: TareaModel;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fechaInicio: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fechaFin: Date | null;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
  declare total: number | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'EN_PROCESO' })
  declare estado: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare observaciones: string | null;
}
EOF_MANUAL
```

**Registrar el modelo** en `sequelize.factory.ts`:

```ts
import { EntregableModel } from '../../../features/business/entregables/infrastructure/persistence/models/entregable.model.js';

export const ALL_MODELS: any[] = [
  ClienteModel,
  CampaniaModel,
  HitoModel,
  TareaModel,
  EntregableModel,
];
```

```bash
cat > src/features/business/entregables/infrastructure/persistence/repositories/entregable.repository.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { Entregable } from '../../../domain/entities/entregable.entity.js';
import type { EntregableEstado } from '../../../domain/entities/entregable.entity.js';
import { IEntregableRepository } from '../../../domain/interfaces/entregable.repository.js';
import { EntregableModel } from '../models/entregable.model.js';

@Injectable()
export class EntregableRepository implements IEntregableRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  private get repo() {
    return this.sequelize.getRepository(EntregableModel);
  }

  async create(entregable: Entregable): Promise<Entregable> {
    const created = await this.repo.create({
      tareaId: entregable.tareaId,
      fechaInicio: entregable.fechaInicio,
      fechaFin: entregable.fechaFin,
      total: entregable.total,
      estado: entregable.estado,
      observaciones: entregable.observaciones,
    });
    return this.toDomain(created);
  }

  async findAll(page: number, limit: number) {
    const { rows, count } = await this.repo.findAndCountAll({
      offset: (page - 1) * limit,
      limit,
      order: [['id', 'ASC']],
    });
    return { items: rows.map((r) => this.toDomain(r)), total: count };
  }

  async findById(id: number): Promise<Entregable | null> {
    const found = await this.repo.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async findByTareaId(tareaId: number): Promise<Entregable[]> {
    const rows = await this.repo.findAll({ where: { tareaId }, order: [['id', 'ASC']] });
    return rows.map((r) => this.toDomain(r));
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  private toDomain(m: EntregableModel): Entregable {
    return new Entregable({
      id: m.id,
      tareaId: m.tareaId,
      fechaInicio: m.fechaInicio ?? null,
      fechaFin: m.fechaFin ?? null,
      total: m.total ? Number(m.total) : null,
      estado: (m.estado as EntregableEstado) ?? 'EN_PROCESO',
      observaciones: m.observaciones ?? null,
    });
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/entregables/infrastructure/persistence/seeders/entregable.seeder.ts <<'EOF_MANUAL'
import { Inject, Injectable, Logger } from "@nestjs/common";
import { TAREA_REPOSITORY } from '../../../../tareas/domain/interfaces/tarea.repository.js';
import type { ITareaRepository } from '../../../../tareas/domain/interfaces/tarea.repository.js';
import { Entregable } from '../../../domain/entities/entregable.entity.js';
import { ENTREGABLE_REPOSITORY } from '../../../domain/interfaces/entregable.repository.js';
import type { IEntregableRepository } from '../../../domain/interfaces/entregable.repository.js';

@Injectable()
export class EntregableSeeder {
  private readonly logger = new Logger(EntregableSeeder.name);

  constructor(
    @Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepo: IEntregableRepository,
    @Inject(TAREA_REPOSITORY) private readonly tareaRepo: ITareaRepository,
  ) {}

  async seed(): Promise<void> {
    const { items: tareas } = await this.tareaRepo.findAll(1, 100);
    const tarea = tareas[0];
    if (!tarea || tarea.id === null) {
      this.logger.warn('Seeder entregables: sin tarea demo; no se siembra');
      return;
    }
    const existentes = await this.entregableRepo.findByTareaId(tarea.id);
    if (existentes.length > 0) {
      this.logger.log('Seeder entregables: ya existía el entregable demo (idempotente)');
      return;
    }
    await this.entregableRepo.create(
      new Entregable({
        tareaId: tarea.id,
        fechaInicio: new Date(),
        observaciones: 'Primer borrador subido para revisión',
        estado: 'EN_PROCESO',
      }),
    );
    this.logger.log('Seeder entregables: entregable demo creado');
  }
}
EOF_MANUAL
```

### 9.4 Capa de presentación + módulo

> 🟣 `presentation`

```bash
cat > src/features/business/entregables/presentation/http/controllers/entregables.controller.ts <<'EOF_MANUAL'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateEntregableDto } from '../../../application/dto/create-entregable.dto.js';
import { EntregableMapper } from '../../../application/mappers/entregable.mapper.js';
import { CreateEntregableUseCase } from '../../../application/use-cases/create-entregable.use-case.js';
import { GetEntregableByIdUseCase } from '../../../application/use-cases/get-entregable-by-id.use-case.js';
import { ListEntregablesUseCase } from '../../../application/use-cases/list-entregables.use-case.js';

@ApiTags('entregables')
@Controller('entregables')
export class EntregablesController {
  constructor(
    private readonly createEntregable: CreateEntregableUseCase,
    private readonly listEntregables: ListEntregablesUseCase,
    private readonly getEntregable: GetEntregableByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear entregable' })
  async create(@Body() dto: CreateEntregableDto) {
    const entregable = await this.createEntregable.execute(dto);
    return EntregableMapper.toResponse(entregable);
  }

  @Get()
  @ApiOperation({ summary: 'Listar entregables (paginado)' })
  async list(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.listEntregables.execute(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener entregable por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const entregable = await this.getEntregable.execute(id);
    return EntregableMapper.toResponse(entregable);
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/entregables/entregables.module.ts <<'EOF_MANUAL'
import { Module } from '@nestjs/common';
import { TareasModule } from '../tareas/tareas.module.js';
import { CreateEntregableUseCase } from './application/use-cases/create-entregable.use-case.js';
import { GetEntregableByIdUseCase } from './application/use-cases/get-entregable-by-id.use-case.js';
import { ListEntregablesUseCase } from './application/use-cases/list-entregables.use-case.js';
import { ENTREGABLE_REPOSITORY } from './domain/interfaces/entregable.repository.js';
import { EntregableRepository } from './infrastructure/persistence/repositories/entregable.repository.js';
import { EntregableSeeder } from './infrastructure/persistence/seeders/entregable.seeder.js';
import { EntregablesController } from './presentation/http/controllers/entregables.controller.js';

@Module({
  imports: [TareasModule],
  controllers: [EntregablesController],
  providers: [
    CreateEntregableUseCase,
    ListEntregablesUseCase,
    GetEntregableByIdUseCase,
    EntregableSeeder,
    { provide: ENTREGABLE_REPOSITORY, useClass: EntregableRepository },
  ],
  exports: [ENTREGABLE_REPOSITORY, EntregableSeeder],
})
export class EntregablesModule {}
EOF_MANUAL
```

> ✅ **Fin de SEG-07**: feature `entregables` completa.
> **Checkpoint de commit:** `feat(backend-manual): feature entregables con FK a tarea`.

---

## 10. SEG-08 · Feature version-entregables

> **Segmento:** entidad VersionEntregable, FK a Entregable, con `numeroVersion` para distinguir v1, v2, v3. Corresponde a SDD 4.1 fila 8.

### 10.1 Capa de dominio

> 🟢 `domain`

```bash
cat > src/features/business/version-entregables/domain/entities/version-entregable.entity.ts <<'EOF_MANUAL'
export type VersionEstado = 'EN_REVISION' | 'APROBADA' | 'RECHAZADA';

export interface VersionEntregableProps {
  id?: number | null;
  entregableId: number;
  numeroVersion: number;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
  total?: number | null;
  estado?: VersionEstado;
  observaciones?: string | null;
}

export class VersionEntregable {
  readonly id: number | null;
  readonly entregableId: number;
  readonly numeroVersion: number;
  readonly fechaInicio: Date | null;
  readonly fechaFin: Date | null;
  readonly total: number | null;
  estado: VersionEstado;
  readonly observaciones: string | null;

  constructor(props: VersionEntregableProps) {
    this.id = props.id ?? null;
    this.entregableId = props.entregableId;
    this.numeroVersion = props.numeroVersion;
    this.fechaInicio = props.fechaInicio ?? null;
    this.fechaFin = props.fechaFin ?? null;
    this.total = props.total ?? null;
    this.estado = props.estado ?? 'EN_REVISION';
    this.observaciones = props.observaciones ?? null;
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/version-entregables/domain/interfaces/version-entregable.repository.ts <<'EOF_MANUAL'
import { VersionEntregable } from '../entities/version-entregable.entity.js';

export const VERSION_ENTREGABLE_REPOSITORY = 'IVersionEntregableRepository';

export interface IVersionEntregableRepository {
  create(version: VersionEntregable): Promise<VersionEntregable>;
  findById(id: number): Promise<VersionEntregable | null>;
  findByEntregableId(entregableId: number): Promise<VersionEntregable[]>;
  // Última versión (mayor numeroVersion) de un entregable — la usa CerrarHito
  findUltimaVersion(entregableId: number): Promise<VersionEntregable | null>;
  countByEntregableId(entregableId: number): Promise<number>;
}
EOF_MANUAL
```

```bash
cat > src/features/business/version-entregables/domain/exceptions/version-not-found.exception.ts <<'EOF_MANUAL'
import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class VersionNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Versión de entregable con id ${id} no encontrada`);
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/version-entregables/domain/exceptions/version-aprobada-inmutable.exception.ts <<'EOF_MANUAL'
import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

export class VersionAprobadaInmutableException extends BusinessRuleException {
  constructor(versionId: number) {
    // RN-04: una versión aprobada no se puede modificar
    super(`La versión ${versionId} ya está APROBADA y no se puede modificar`);
  }
}
EOF_MANUAL
```

### 10.2 Capa de aplicación

> 🔵 `application` — el número de versión se calcula solo (última + 1).

```bash
cat > src/features/business/version-entregables/application/dto/create-version-entregable.dto.ts <<'EOF_MANUAL'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateVersionEntregableDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'entregableId debe ser entero' })
  @Min(1, { message: 'entregableId es requerido' })
  entregableId!: number;

  @ApiPropertyOptional({ example: 'Versión corregida según comentarios del cliente' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
EOF_MANUAL
```

```bash
cat > src/features/business/version-entregables/application/mappers/version-entregable.mapper.ts <<'EOF_MANUAL'
import { VersionEntregable } from '../../domain/entities/version-entregable.entity.js';

export class VersionEntregableMapper {
  static toResponse(v: VersionEntregable) {
    return {
      id: v.id,
      entregableId: v.entregableId,
      numeroVersion: v.numeroVersion,
      fechaInicio: v.fechaInicio,
      fechaFin: v.fechaFin,
      total: v.total,
      estado: v.estado,
      observaciones: v.observaciones,
    };
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/version-entregables/application/use-cases/create-version-entregable.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { ENTREGABLE_REPOSITORY } from '../../../entregables/domain/interfaces/entregable.repository.js';
import type { IEntregableRepository } from '../../../entregables/domain/interfaces/entregable.repository.js';
import { EntregableNotFoundException } from '../../../entregables/domain/exceptions/entregable-not-found.exception.js';
import { VersionEntregable } from '../../domain/entities/version-entregable.entity.js';
import { VERSION_ENTREGABLE_REPOSITORY } from '../../domain/interfaces/version-entregable.repository.js';
import type { IVersionEntregableRepository } from '../../domain/interfaces/version-entregable.repository.js';
import { CreateVersionEntregableDto } from '../dto/create-version-entregable.dto.js';

@Injectable()
export class CreateVersionEntregableUseCase {
  constructor(
    @Inject(VERSION_ENTREGABLE_REPOSITORY)
    private readonly versionRepo: IVersionEntregableRepository,
    @Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepo: IEntregableRepository,
  ) {}

  async execute(dto: CreateVersionEntregableDto): Promise<VersionEntregable> {
    const entregable = await this.entregableRepo.findById(dto.entregableId);
    if (!entregable) {
      throw new EntregableNotFoundException(dto.entregableId);
    }
    const totalVersiones = await this.versionRepo.countByEntregableId(dto.entregableId);
    const version = new VersionEntregable({
      entregableId: dto.entregableId,
      numeroVersion: totalVersiones + 1,
      fechaInicio: new Date(),
      observaciones: dto.observaciones ?? null,
      estado: 'EN_REVISION',
    });
    return this.versionRepo.create(version);
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/version-entregables/application/use-cases/get-version-by-id.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { VersionNotFoundException } from '../../domain/exceptions/version-not-found.exception.js';
import { VERSION_ENTREGABLE_REPOSITORY } from '../../domain/interfaces/version-entregable.repository.js';
import type { IVersionEntregableRepository } from '../../domain/interfaces/version-entregable.repository.js';
import type { VersionEntregable } from '../../domain/entities/version-entregable.entity.js';

@Injectable()
export class GetVersionByIdUseCase {
  constructor(
    @Inject(VERSION_ENTREGABLE_REPOSITORY)
    private readonly versionRepo: IVersionEntregableRepository,
  ) {}

  async execute(id: number): Promise<VersionEntregable> {
    const version = await this.versionRepo.findById(id);
    if (!version) {
      throw new VersionNotFoundException(id);
    }
    return version;
  }
}
EOF_MANUAL
```

### 10.3 Capa de infraestructura

> 🟠 `infrastructure`

```bash
cat > src/features/business/version-entregables/infrastructure/persistence/models/version-entregable.model.ts <<'EOF_MANUAL'
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { EntregableModel } from '../../../../entregables/infrastructure/persistence/models/entregable.model.js';

@Table({ tableName: 'version_entregables', timestamps: true })
export class VersionEntregableModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => EntregableModel)
  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare entregableId: number;

  @BelongsTo(() => EntregableModel)
  entregable?: EntregableModel;

  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare numeroVersion: number;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fechaInicio: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fechaFin: Date | null;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
  declare total: number | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'EN_REVISION' })
  declare estado: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare observaciones: string | null;
}
EOF_MANUAL
```

**Registrar el modelo** en `sequelize.factory.ts`:

```ts
import { VersionEntregableModel } from '../../../features/business/version-entregables/infrastructure/persistence/models/version-entregable.model.js';

export const ALL_MODELS: any[] = [
  ClienteModel,
  CampaniaModel,
  HitoModel,
  TareaModel,
  EntregableModel,
  VersionEntregableModel,
];
```

```bash
cat > src/features/business/version-entregables/infrastructure/persistence/repositories/version-entregable.repository.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { VersionEntregable } from '../../../domain/entities/version-entregable.entity.js';
import type { VersionEstado } from '../../../domain/entities/version-entregable.entity.js';
import { IVersionEntregableRepository } from '../../../domain/interfaces/version-entregable.repository.js';
import { VersionEntregableModel } from '../models/version-entregable.model.js';

@Injectable()
export class VersionEntregableRepository implements IVersionEntregableRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  private get repo() {
    return this.sequelize.getRepository(VersionEntregableModel);
  }

  async create(version: VersionEntregable): Promise<VersionEntregable> {
    const created = await this.repo.create({
      entregableId: version.entregableId,
      numeroVersion: version.numeroVersion,
      fechaInicio: version.fechaInicio,
      fechaFin: version.fechaFin,
      total: version.total,
      estado: version.estado,
      observaciones: version.observaciones,
    });
    return this.toDomain(created);
  }

  async findById(id: number): Promise<VersionEntregable | null> {
    const found = await this.repo.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async findByEntregableId(entregableId: number): Promise<VersionEntregable[]> {
    const rows = await this.repo.findAll({
      where: { entregableId },
      order: [['numeroVersion', 'ASC']],
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findUltimaVersion(entregableId: number): Promise<VersionEntregable | null> {
    const found = await this.repo.findOne({
      where: { entregableId },
      order: [['numeroVersion', 'DESC']],
    });
    return found ? this.toDomain(found) : null;
  }

  async countByEntregableId(entregableId: number): Promise<number> {
    return this.repo.count({ where: { entregableId } });
  }

  private toDomain(m: VersionEntregableModel): VersionEntregable {
    return new VersionEntregable({
      id: m.id,
      entregableId: m.entregableId,
      numeroVersion: m.numeroVersion,
      fechaInicio: m.fechaInicio ?? null,
      fechaFin: m.fechaFin ?? null,
      total: m.total ? Number(m.total) : null,
      estado: (m.estado as VersionEstado) ?? 'EN_REVISION',
      observaciones: m.observaciones ?? null,
    });
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/version-entregables/infrastructure/persistence/seeders/version-entregable.seeder.ts <<'EOF_MANUAL'
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ENTREGABLE_REPOSITORY } from '../../../../entregables/domain/interfaces/entregable.repository.js';
import type { IEntregableRepository } from '../../../../entregables/domain/interfaces/entregable.repository.js';
import { VersionEntregable } from '../../../domain/entities/version-entregable.entity.js';
import { VERSION_ENTREGABLE_REPOSITORY } from '../../../domain/interfaces/version-entregable.repository.js';
import type { IVersionEntregableRepository } from '../../../domain/interfaces/version-entregable.repository.js';

@Injectable()
export class VersionEntregableSeeder {
  private readonly logger = new Logger(VersionEntregableSeeder.name);

  constructor(
    @Inject(VERSION_ENTREGABLE_REPOSITORY)
    private readonly versionRepo: IVersionEntregableRepository,
    @Inject(ENTREGABLE_REPOSITORY) private readonly entregableRepo: IEntregableRepository,
  ) {}

  async seed(): Promise<void> {
    const { items: entregables } = await this.entregableRepo.findAll(1, 100);
    const entregable = entregables[0];
    if (!entregable || entregable.id === null) {
      this.logger.warn('Seeder version-entregables: sin entregable demo; no se siembra');
      return;
    }
    const existentes = await this.versionRepo.findByEntregableId(entregable.id);
    if (existentes.length > 0) {
      this.logger.log('Seeder version-entregables: ya existía la versión demo (idempotente)');
      return;
    }
    await this.versionRepo.create(
      new VersionEntregable({
        entregableId: entregable.id,
        numeroVersion: 1,
        fechaInicio: new Date(),
        observaciones: 'Primera versión para revisión del cliente',
        estado: 'EN_REVISION',
      }),
    );
    this.logger.log('Seeder version-entregables: versión demo creada');
  }
}
EOF_MANUAL
```

### 10.4 Capa de presentación + módulo

> 🟣 `presentation`

```bash
cat > src/features/business/version-entregables/presentation/http/controllers/version-entregables.controller.ts <<'EOF_MANUAL'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateVersionEntregableDto } from '../../../application/dto/create-version-entregable.dto.js';
import { VersionEntregableMapper } from '../../../application/mappers/version-entregable.mapper.js';
import { CreateVersionEntregableUseCase } from '../../../application/use-cases/create-version-entregable.use-case.js';
import { GetVersionByIdUseCase } from '../../../application/use-cases/get-version-by-id.use-case.js';

@ApiTags('version-entregables')
@Controller('version-entregables')
export class VersionEntregablesController {
  constructor(
    private readonly createVersion: CreateVersionEntregableUseCase,
    private readonly getVersion: GetVersionByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear nueva versión de un entregable (numeroVersion automático)' })
  async create(@Body() dto: CreateVersionEntregableDto) {
    const version = await this.createVersion.execute(dto);
    return VersionEntregableMapper.toResponse(version);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener versión por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const version = await this.getVersion.execute(id);
    return VersionEntregableMapper.toResponse(version);
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/version-entregables/version-entregables.module.ts <<'EOF_MANUAL'
import { Module } from '@nestjs/common';
import { EntregablesModule } from '../entregables/entregables.module.js';
import { CreateVersionEntregableUseCase } from './application/use-cases/create-version-entregable.use-case.js';
import { GetVersionByIdUseCase } from './application/use-cases/get-version-by-id.use-case.js';
import { VERSION_ENTREGABLE_REPOSITORY } from './domain/interfaces/version-entregable.repository.js';
import { VersionEntregableRepository } from './infrastructure/persistence/repositories/version-entregable.repository.js';
import { VersionEntregableSeeder } from './infrastructure/persistence/seeders/version-entregable.seeder.js';
import { VersionEntregablesController } from './presentation/http/controllers/version-entregables.controller.js';

@Module({
  imports: [EntregablesModule],
  controllers: [VersionEntregablesController],
  providers: [
    CreateVersionEntregableUseCase,
    GetVersionByIdUseCase,
    VersionEntregableSeeder,
    { provide: VERSION_ENTREGABLE_REPOSITORY, useClass: VersionEntregableRepository },
  ],
  exports: [VERSION_ENTREGABLE_REPOSITORY, VersionEntregableSeeder],
})
export class VersionEntregablesModule {}
EOF_MANUAL
```

> ✅ **Fin de SEG-08**: feature `version-entregables` completa. `findUltimaVersion` es la pieza que usa CerrarHito para saber si un entregable está resuelto.
> **Checkpoint de commit:** `feat(backend-manual): feature version-entregables con numeroVersion automatico`.

---

## 11. SEG-09 · Feature aprobaciones (cierre automático de hito)

> **Segmento:** la operación **transaccional** central del proyecto. Registrar una aprobación puede disparar el cierre del hito, de forma atómica. Implementa RN-01, RN-02, RN-05 y RN-06 del SDD. Es el equivalente de `sales` en StoreLab, pero en vez de descontar stock, **cierra un hito** cuando entra la última aprobación pendiente.

### 11.1 Capa de dominio

> 🟢 `domain`

```bash
cat > src/features/business/aprobaciones/domain/entities/aprobacion.entity.ts <<'EOF_MANUAL'
export type AprobacionEstado = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface AprobacionProps {
  id?: number | null;
  versionEntregableId: number;
  estado: AprobacionEstado;
  aprobadorId: number;
  comentario?: string | null;
  fecha?: Date;
}

export class Aprobacion {
  readonly id: number | null;
  readonly versionEntregableId: number;
  readonly estado: AprobacionEstado;
  readonly aprobadorId: number;
  readonly comentario: string | null;
  readonly fecha: Date;

  constructor(props: AprobacionProps) {
    this.id = props.id ?? null;
    this.versionEntregableId = props.versionEntregableId;
    this.estado = props.estado;
    this.aprobadorId = props.aprobadorId;
    this.comentario = props.comentario ?? null;
    this.fecha = props.fecha ?? new Date();
  }
}
EOF_MANUAL
```

**Servicio de dominio `CierreHitoEvaluator`:** encapsula RN-02 (cuándo un hito debe cerrarse). Es el equivalente al `SaleCalculator` de StoreLab, pero para tu regla de negocio.

```bash
cat > src/features/business/aprobaciones/domain/services/cierre-hito-evaluator.ts <<'EOF_MANUAL'
export interface EntregableConEstado {
  entregableId: number;
  ultimaVersionEstado: 'EN_REVISION' | 'APROBADA' | 'RECHAZADA' | null;
}

export class CierreHitoEvaluator {
  // RN-01 + RN-02: el hito se cierra si y solo si TODOS los entregables
  // tienen su ultima version en estado APROBADA. Basta un RECHAZADA o
  // EN_REVISION (o ausente) para que el hito permanezca ABIERTO.
  debeCerrarHito(entregables: EntregableConEstado[]): boolean {
    if (entregables.length === 0) {
      return false;
    }
    return entregables.every((e) => e.ultimaVersionEstado === 'APROBADA');
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/aprobaciones/domain/interfaces/aprobacion.repository.ts <<'EOF_MANUAL'
import { Aprobacion } from '../entities/aprobacion.entity.js';

export const APROBACION_REPOSITORY = 'IAprobacionRepository';

export interface RegistrarAprobacionResultado {
  aprobacion: Aprobacion;
  hitoCerrado: boolean;
  hitoId: number | null;
  fechaCierre: Date | null;
}

export interface IAprobacionRepository {
  // Operación transaccional completa: registra la aprobación y,
  // si corresponde, cierra el hito — todo en una sola transacción.
  registrarYEvaluarCierre(aprobacion: Aprobacion): Promise<RegistrarAprobacionResultado>;
  findById(id: number): Promise<Aprobacion | null>;
}
EOF_MANUAL
```

```bash
cat > src/features/business/aprobaciones/domain/exceptions/version-no-encontrada.exception.ts <<'EOF_MANUAL'
import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class VersionNoEncontradaException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Versión de entregable con id ${id} no encontrada`);
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/aprobaciones/domain/exceptions/hito-cerrado-no-admite-aprobacion.exception.ts <<'EOF_MANUAL'
import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

export class HitoCerradoNoAdmiteAprobacionException extends BusinessRuleException {
  constructor(hitoId: number) {
    // RN-06: un hito cerrado no admite nuevas versiones ni aprobaciones
    super(`El hito ${hitoId} ya está cerrado y no admite nuevas aprobaciones`);
  }
}
EOF_MANUAL
```

### 11.2 Capa de aplicación

> 🔵 `application` — el caso de uso orquesta: valida la versión, valida el rol (RN-05, simplificado sin RBAC real), delega el registro transaccional al repositorio.

```bash
cat > src/features/business/aprobaciones/application/dto/create-aprobacion.dto.ts <<'EOF_MANUAL'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateAprobacionDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'versionEntregableId debe ser entero' })
  @Min(1, { message: 'versionEntregableId es requerido' })
  versionEntregableId!: number;

  @ApiProperty({ example: 'APROBADA', enum: ['APROBADA', 'RECHAZADA'] })
  @IsIn(['APROBADA', 'RECHAZADA'], { message: 'estado debe ser APROBADA o RECHAZADA' })
  estado!: 'APROBADA' | 'RECHAZADA';

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'aprobadorId debe ser entero' })
  @Min(1, { message: 'aprobadorId es requerido' })
  aprobadorId!: number;

  @ApiPropertyOptional({ example: 'Aprobado, listo para publicar' })
  @IsOptional()
  @IsString()
  comentario?: string;
}
EOF_MANUAL
```

```bash
cat > src/features/business/aprobaciones/application/mappers/aprobacion.mapper.ts <<'EOF_MANUAL'
import { RegistrarAprobacionResultado } from '../../domain/interfaces/aprobacion.repository.js';

export class AprobacionMapper {
  static toResponse(resultado: RegistrarAprobacionResultado) {
    return {
      id: resultado.aprobacion.id,
      versionEntregableId: resultado.aprobacion.versionEntregableId,
      estado: resultado.aprobacion.estado,
      aprobadorId: resultado.aprobacion.aprobadorId,
      comentario: resultado.aprobacion.comentario,
      fecha: resultado.aprobacion.fecha,
      hitoCerrado: resultado.hitoCerrado,
      hitoId: resultado.hitoId,
      fechaCierre: resultado.fechaCierre,
    };
  }
}
EOF_MANUAL
```

**El caso de uso — equivalente a `CreateSaleUseCase` de StoreLab:**

```bash
cat > src/features/business/aprobaciones/application/use-cases/registrar-aprobacion.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { Aprobacion } from '../../domain/entities/aprobacion.entity.js';
import {
  APROBACION_REPOSITORY,
  RegistrarAprobacionResultado,
} from '../../domain/interfaces/aprobacion.repository.js';
import type { IAprobacionRepository } from '../../domain/interfaces/aprobacion.repository.js';
import { CreateAprobacionDto } from '../dto/create-aprobacion.dto.js';

@Injectable()
export class RegistrarAprobacionUseCase {
  constructor(
    @Inject(APROBACION_REPOSITORY) private readonly aprobacionRepo: IAprobacionRepository,
  ) {}

  async execute(dto: CreateAprobacionDto): Promise<RegistrarAprobacionResultado> {
    // RN-05 (simplificada, sin RBAC real todavía): en esta fase no se valida
    // el rol del aprobadorId contra la tabla de roles — eso se añade cuando
    // se implemente RBAC. Aquí solo se registra quién aprobó.
    const aprobacion = new Aprobacion({
      versionEntregableId: dto.versionEntregableId,
      estado: dto.estado,
      aprobadorId: dto.aprobadorId,
      comentario: dto.comentario ?? null,
    });

    // El repositorio hace, en una sola transacción:
    // 1) valida que la versión exista y su hito no esté cerrado (RN-06)
    // 2) inserta la aprobación
    // 3) si es RECHAZADA -> retorna (el hito sigue ABIERTO, RN-01)
    // 4) si es APROBADA -> evalúa si TODOS los entregables del hito están
    //    aprobados (RN-02, vía CierreHitoEvaluator) y, si es así, cierra el hito
    return this.aprobacionRepo.registrarYEvaluarCierre(aprobacion);
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/aprobaciones/application/use-cases/get-aprobacion-by-id.use-case.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { VersionNoEncontradaException } from '../../domain/exceptions/version-no-encontrada.exception.js';
import { APROBACION_REPOSITORY } from '../../domain/interfaces/aprobacion.repository.js';
import type { IAprobacionRepository } from '../../domain/interfaces/aprobacion.repository.js';
import type { Aprobacion } from '../../domain/entities/aprobacion.entity.js';

@Injectable()
export class GetAprobacionByIdUseCase {
  constructor(
    @Inject(APROBACION_REPOSITORY) private readonly aprobacionRepo: IAprobacionRepository,
  ) {}

  async execute(id: number): Promise<Aprobacion> {
    const aprobacion = await this.aprobacionRepo.findById(id);
    if (!aprobacion) {
      throw new VersionNoEncontradaException(id);
    }
    return aprobacion;
  }
}
EOF_MANUAL
```

### 11.3 Capa de infraestructura — el corazón transaccional

> 🟠 `infrastructure` — aquí vive la transacción que implementa CerrarHito tal como está descrito en la sección 6 del SDD.

```bash
cat > src/features/business/aprobaciones/infrastructure/persistence/models/aprobacion.model.ts <<'EOF_MANUAL'
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { VersionEntregableModel } from '../../../../version-entregables/infrastructure/persistence/models/version-entregable.model.js';

@Table({ tableName: 'aprobaciones', timestamps: true })
export class AprobacionModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @ForeignKey(() => VersionEntregableModel)
  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare versionEntregableId: number;

  @BelongsTo(() => VersionEntregableModel)
  versionEntregable?: VersionEntregableModel;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'PENDIENTE' })
  declare estado: string;

  @Column({ type: DataType.INTEGER.UNSIGNED, allowNull: false })
  declare aprobadorId: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare comentario: string | null;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  declare fecha: Date;
}
EOF_MANUAL
```

**Registrar el modelo** en `sequelize.factory.ts`:

```ts
import { AprobacionModel } from '../../../features/business/aprobaciones/infrastructure/persistence/models/aprobacion.model.js';

export const ALL_MODELS: any[] = [
  ClienteModel,
  CampaniaModel,
  HitoModel,
  TareaModel,
  EntregableModel,
  VersionEntregableModel,
  AprobacionModel,
];
```

**El repositorio transaccional.** Es el archivo más importante del manual: implementa el flujo exacto de la sección 6 del SDD (los 8 pasos de CerrarHito), usando `sequelize.transaction` con bloqueo de filas, igual que `SaleRepository` en StoreLab pero con tu lógica de negocio.

```bash
cat > src/features/business/aprobaciones/infrastructure/persistence/repositories/aprobacion.repository.ts <<'EOF_MANUAL'
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { EntregableModel } from '../../../../entregables/infrastructure/persistence/models/entregable.model.js';
import { HitoModel } from '../../../../hitos/infrastructure/persistence/models/hito.model.js';
import { TareaModel } from '../../../../tareas/infrastructure/persistence/models/tarea.model.js';
import { VersionEntregableModel } from '../../../../version-entregables/infrastructure/persistence/models/version-entregable.model.js';
import { Aprobacion } from '../../../domain/entities/aprobacion.entity.js';
import type { AprobacionEstado } from '../../../domain/entities/aprobacion.entity.js';
import { CierreHitoEvaluator } from '../../../domain/services/cierre-hito-evaluator.js';
import type { EntregableConEstado } from '../../../domain/services/cierre-hito-evaluator.js';
import { HitoCerradoNoAdmiteAprobacionException } from '../../../domain/exceptions/hito-cerrado-no-admite-aprobacion.exception.js';
import { VersionNoEncontradaException } from '../../../domain/exceptions/version-no-encontrada.exception.js';
import {
  IAprobacionRepository,
  RegistrarAprobacionResultado,
} from '../../../domain/interfaces/aprobacion.repository.js';
import { AprobacionModel } from '../models/aprobacion.model.js';

@Injectable()
export class AprobacionRepository implements IAprobacionRepository {
  private readonly evaluator = new CierreHitoEvaluator();

  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  async registrarYEvaluarCierre(aprobacion: Aprobacion): Promise<RegistrarAprobacionResultado> {
    return this.sequelize.transaction(async (t) => {
      const aprobacionRepo = this.sequelize.getRepository(AprobacionModel);
      const versionRepo = this.sequelize.getRepository(VersionEntregableModel);
      const entregableRepo = this.sequelize.getRepository(EntregableModel);
      const tareaRepo = this.sequelize.getRepository(TareaModel);
      const hitoRepo = this.sequelize.getRepository(HitoModel);

      // Paso 3 del SDD: identificar a qué hito pertenece la versión aprobada
      // (Version -> Entregable -> Tarea -> Hito), bloqueando el hito para
      // evitar condiciones de carrera si dos aprobaciones llegan casi juntas.
      const version = await versionRepo.findByPk(aprobacion.versionEntregableId, {
        transaction: t,
      });
      if (!version) {
        throw new VersionNoEncontradaException(aprobacion.versionEntregableId);
      }
      const entregable = await entregableRepo.findByPk(version.entregableId, { transaction: t });
      const tarea = await tareaRepo.findByPk(entregable!.tareaId, { transaction: t });
      const hito = await hitoRepo.findByPk(tarea!.hitoId, {
        transaction: t,
        lock: Transaction.LOCK.UPDATE,
      });

      // RN-06: un hito cerrado no admite nuevas versiones ni aprobaciones.
      if (hito!.estado !== 'ABIERTO') {
        throw new HitoCerradoNoAdmiteAprobacionException(hito!.id);
      }

      // Paso 2 del SDD: registrar la aprobación (APROBADA o RECHAZADA).
      const createdAprobacion = await aprobacionRepo.create(
        {
          versionEntregableId: aprobacion.versionEntregableId,
          estado: aprobacion.estado,
          aprobadorId: aprobacion.aprobadorId,
          comentario: aprobacion.comentario,
          fecha: aprobacion.fecha,
        },
        { transaction: t },
      );

      // También se refleja el veredicto en la versión (para que
      // findUltimaVersion / consultas posteriores lo vean directo).
      await version.update({ estado: aprobacion.estado }, { transaction: t });

      const dominioAprobacion = new Aprobacion({
        id: createdAprobacion.id,
        versionEntregableId: createdAprobacion.versionEntregableId,
        estado: createdAprobacion.estado as AprobacionEstado,
        aprobadorId: createdAprobacion.aprobadorId,
        comentario: createdAprobacion.comentario,
        fecha: createdAprobacion.fecha,
      });

      // RN-01: si fue RECHAZADA, el hito NO se cierra. Se aborta aquí
      // (dentro de la misma transacción, que igual se confirma porque el
      // registro del rechazo sí debe persistir).
      if (aprobacion.estado === 'RECHAZADA') {
        return {
          aprobacion: dominioAprobacion,
          hitoCerrado: false,
          hitoId: null,
          fechaCierre: null,
        };
      }

      // Paso 4 del SDD: revisar TODOS los entregables del hito y el estado
      // de la última versión de cada uno.
      const tareasDelHito = await tareaRepo.findAll({
        where: { hitoId: hito!.id },
        transaction: t,
      });
      const entregablesDelHito = await entregableRepo.findAll({
        where: { tareaId: tareasDelHito.map((tt) => tt.id) },
        transaction: t,
      });

      const estados: EntregableConEstado[] = [];
      for (const e of entregablesDelHito) {
        const ultima = await versionRepo.findOne({
          where: { entregableId: e.id },
          order: [['numeroVersion', 'DESC']],
          transaction: t,
        });
        estados.push({
          entregableId: e.id,
          ultimaVersionEstado: (ultima?.estado as any) ?? null,
        });
      }

      // Paso 5/6 del SDD (vía CierreHitoEvaluator = RN-02):
      // si TODOS están APROBADOS, se cierra el hito en esta misma transacción.
      const debeCerrar = this.evaluator.debeCerrarHito(estados);

      if (!debeCerrar) {
        return {
          aprobacion: dominioAprobacion,
          hitoCerrado: false,
          hitoId: null,
          fechaCierre: null,
        };
      }

      const fechaCierre = new Date();
      await hito!.update(
        { estado: 'CERRADO', fechaCierre },
        { transaction: t },
      );

      return {
        aprobacion: dominioAprobacion,
        hitoCerrado: true,
        hitoId: hito!.id,
        fechaCierre,
      };
    });
  }

  async findById(id: number): Promise<Aprobacion | null> {
    const repo = this.sequelize.getRepository(AprobacionModel);
    const found = await repo.findByPk(id);
    if (!found) {
      return null;
    }
    return new Aprobacion({
      id: found.id,
      versionEntregableId: found.versionEntregableId,
      estado: found.estado as AprobacionEstado,
      aprobadorId: found.aprobadorId,
      comentario: found.comentario,
      fecha: found.fecha,
    });
  }
}
EOF_MANUAL
```

> La transacción hace **todo o nada**, igual que `sales` en StoreLab: bloquea el hito (`FOR UPDATE`), inserta la aprobación, evalúa si cierra, y si algo falla en cualquier paso, revierte todo. La diferencia con StoreLab: en vez de descontar stock, esta transacción **cierra un hito**.

### 11.4 Capa de presentación + módulo

> 🟣 `presentation`

```bash
cat > src/features/business/aprobaciones/presentation/http/controllers/aprobaciones.controller.ts <<'EOF_MANUAL'
import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAprobacionDto } from '../../../application/dto/create-aprobacion.dto.js';
import { AprobacionMapper } from '../../../application/mappers/aprobacion.mapper.js';
import { GetAprobacionByIdUseCase } from '../../../application/use-cases/get-aprobacion-by-id.use-case.js';
import { RegistrarAprobacionUseCase } from '../../../application/use-cases/registrar-aprobacion.use-case.js';

@ApiTags('aprobaciones')
@Controller('aprobaciones')
export class AprobacionesController {
  constructor(
    private readonly registrarAprobacion: RegistrarAprobacionUseCase,
    private readonly getAprobacion: GetAprobacionByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Registrar aprobación o rechazo (cierra el hito automáticamente si es la última pendiente)',
  })
  async create(@Body() dto: CreateAprobacionDto) {
    const resultado = await this.registrarAprobacion.execute(dto);
    return AprobacionMapper.toResponse(resultado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener aprobación por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getAprobacion.execute(id);
  }
}
EOF_MANUAL
```

```bash
cat > src/features/business/aprobaciones/aprobaciones.module.ts <<'EOF_MANUAL'
import { Module } from '@nestjs/common';
import { EntregablesModule } from '../entregables/entregables.module.js';
import { HitosModule } from '../hitos/hitos.module.js';
import { TareasModule } from '../tareas/tareas.module.js';
import { VersionEntregablesModule } from '../version-entregables/version-entregables.module.js';
import { GetAprobacionByIdUseCase } from './application/use-cases/get-aprobacion-by-id.use-case.js';
import { RegistrarAprobacionUseCase } from './application/use-cases/registrar-aprobacion.use-case.js';
import { APROBACION_REPOSITORY } from './domain/interfaces/aprobacion.repository.js';
import { AprobacionRepository } from './infrastructure/persistence/repositories/aprobacion.repository.js';
import { AprobacionesController } from './presentation/http/controllers/aprobaciones.controller.js';

@Module({
  imports: [VersionEntregablesModule, EntregablesModule, TareasModule, HitosModule],
  controllers: [AprobacionesController],
  providers: [
    RegistrarAprobacionUseCase,
    GetAprobacionByIdUseCase,
    { provide: APROBACION_REPOSITORY, useClass: AprobacionRepository },
  ],
  exports: [APROBACION_REPOSITORY],
})
export class AprobacionesModule {}
EOF_MANUAL
```

> ✅ **Fin de SEG-09**: feature `aprobaciones` completa — **la capacidad integrada CerrarHito de la Semana 04 queda implementada**.
> **Checkpoint de commit:** `feat(backend-manual): feature aprobaciones con cierre automatico de hito (CerrarHito)`.

---

## 12. SEG-10 · Integración, seeders y demo

> **Segmento:** conectar las 7 features, sembrar datos en cadena y verificar el flujo completo de CerrarHito.

### 12.1 Módulo agregador `business.module.ts`

```bash
cat > src/features/business/business.module.ts <<'EOF_MANUAL'
import { Module } from '@nestjs/common';
import { AprobacionesModule } from './aprobaciones/aprobaciones.module.js';
import { CampaniasModule } from './campanias/campanias.module.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { EntregablesModule } from './entregables/entregables.module.js';
import { HitosModule } from './hitos/hitos.module.js';
import { TareasModule } from './tareas/tareas.module.js';
import { VersionEntregablesModule } from './version-entregables/version-entregables.module.js';

@Module({
  imports: [
    ClientesModule,
    CampaniasModule,
    HitosModule,
    TareasModule,
    EntregablesModule,
    VersionEntregablesModule,
    AprobacionesModule,
  ],
  exports: [
    ClientesModule,
    CampaniasModule,
    HitosModule,
    TareasModule,
    EntregablesModule,
    VersionEntregablesModule,
    AprobacionesModule,
  ],
})
export class BusinessModule {}
EOF_MANUAL
```

### 12.2 Seeders (datos de arranque, en orden de dependencia)

```bash
cat > src/infrastructure/database/seeders/seeders.runner.ts <<'EOF_MANUAL'
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { CampaniaSeeder } from '../../../features/business/campanias/infrastructure/persistence/seeders/campania.seeder.js';
import { ClienteSeeder } from '../../../features/business/clientes/infrastructure/persistence/seeders/cliente.seeder.js';
import { EntregableSeeder } from '../../../features/business/entregables/infrastructure/persistence/seeders/entregable.seeder.js';
import { HitoSeeder } from '../../../features/business/hitos/infrastructure/persistence/seeders/hito.seeder.js';
import { TareaSeeder } from '../../../features/business/tareas/infrastructure/persistence/seeders/tarea.seeder.js';
import { VersionEntregableSeeder } from '../../../features/business/version-entregables/infrastructure/persistence/seeders/version-entregable.seeder.js';

@Injectable()
export class SeedersRunner implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedersRunner.name);

  constructor(
    private readonly clienteSeeder: ClienteSeeder,
    private readonly campaniaSeeder: CampaniaSeeder,
    private readonly hitoSeeder: HitoSeeder,
    private readonly tareaSeeder: TareaSeeder,
    private readonly entregableSeeder: EntregableSeeder,
    private readonly versionEntregableSeeder: VersionEntregableSeeder,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.clienteSeeder.seed();
    await this.campaniaSeeder.seed();
    await this.hitoSeeder.seed();
    await this.tareaSeeder.seed();
    await this.entregableSeeder.seed();
    await this.versionEntregableSeeder.seed();
    this.logger.log(
      'Seeders business ejecutados en orden: clientes → campanias → hitos → tareas → entregables → version-entregables',
    );
  }
}
EOF_MANUAL
```

> Nota: `aprobaciones` no tiene seeder — se registra manualmente en la demo (sección 12.4) para poder observar el cierre del hito en vivo.

### 12.3 `app.module.ts` final (con BusinessModule y SeedersRunner)

```bash
cat > src/app.module.ts <<'EOF_MANUAL'
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
EOF_MANUAL
```

### 12.4 Pruebas con Vitest (e2e mínima)

```bash
cat > vitest.config.ts <<'EOF_MANUAL'
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
  },
});
EOF_MANUAL
```

```bash
cat > vitest.config.e2e.ts <<'EOF_MANUAL'
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
  },
});
EOF_MANUAL
```

```bash
mkdir -p test
cat > test/health.e2e-spec.ts <<'EOF_MANUAL'
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  afterEach(async () => {
    await app.close();
  });
});
EOF_MANUAL
```

### 12.5 Ejecutar y probar el negocio completo

```bash
npm run start:dev
```

**La cadena completa, de arriba a abajo — cada curl construye sobre el anterior:**

```bash
# Health
curl http://localhost:3010/api/health

# 1. Crear cliente
curl -X POST http://localhost:3010/api/clientes -H 'Content-Type: application/json' \
  -d '{"tipoDocumento":"NIT","numeroDocumento":"900123456-7","nombre":"Postobón S.A.","email":"contacto@postobon.com"}'

# 2. Crear campaña (usa el id del cliente creado, ej. 1)
curl -X POST http://localhost:3010/api/campanias -H 'Content-Type: application/json' \
  -d '{"clienteId":1,"nombre":"Carnaval 2026","descripcion":"Campaña de carnaval"}'

# 3. Crear hito (usa el id de la campaña, ej. 1)
curl -X POST http://localhost:3010/api/hitos -H 'Content-Type: application/json' \
  -d '{"campaniaId":1,"nombre":"Piezas para redes sociales"}'

# 4. Crear tarea (usa el id del hito, ej. 1)
curl -X POST http://localhost:3010/api/tareas -H 'Content-Type: application/json' \
  -d '{"hitoId":1,"nombre":"Diseñar post de Instagram"}'

# 5. Crear entregable (usa el id de la tarea, ej. 1)
curl -X POST http://localhost:3010/api/entregables -H 'Content-Type: application/json' \
  -d '{"tareaId":1,"observaciones":"Primer borrador"}'

# 6. Crear versión del entregable (usa el id del entregable, ej. 1) — numeroVersion sale automático (1)
curl -X POST http://localhost:3010/api/version-entregables -H 'Content-Type: application/json' \
  -d '{"entregableId":1,"observaciones":"Versión 1 lista para revisión"}'

# 7a. DEMO DE RECHAZO — aprobar con estado RECHAZADA: el hito debe seguir ABIERTO
curl -X POST http://localhost:3010/api/aprobaciones -H 'Content-Type: application/json' \
  -d '{"versionEntregableId":1,"estado":"RECHAZADA","aprobadorId":1,"comentario":"Cambiar el color de fondo"}'
# Respuesta esperada: { ..., "hitoCerrado": false, "hitoId": null }

# 7b. Crear una segunda versión corregida (numeroVersion sale automático: 2)
curl -X POST http://localhost:3010/api/version-entregables -H 'Content-Type: application/json' \
  -d '{"entregableId":1,"observaciones":"Versión 2, color corregido"}'

# 7c. DEMO DE CIERRE — aprobar la versión 2 (id 2): como es el único
# entregable del hito y ya queda APROBADO, el hito se cierra automáticamente
curl -X POST http://localhost:3010/api/aprobaciones -H 'Content-Type: application/json' \
  -d '{"versionEntregableId":2,"estado":"APROBADA","aprobadorId":1,"comentario":"Aprobado, listo para publicar"}'
# Respuesta esperada: { ..., "hitoCerrado": true, "hitoId": 1, "fechaCierre": "..." }

# 8. Verificar que el hito quedó CERRADO
curl http://localhost:3010/api/hitos/1
# estado: "CERRADO", fechaCierre: no nulo

# 9. DEMO DE RN-06 — intentar aprobar de nuevo sobre el hito ya cerrado debe fallar con 409
curl -X POST http://localhost:3010/api/aprobaciones -H 'Content-Type: application/json' \
  -d '{"versionEntregableId":2,"estado":"APROBADA","aprobadorId":1}'
# Respuesta esperada: 409 — "El hito 1 ya está cerrado y no admite nuevas aprobaciones"
```

> Esta secuencia demuestra en vivo los tres casos que el SDD exige como AC de la capacidad CerrarHito: **cierre automático** (7c), **rechazo que no cierra** (7a), y **hito cerrado que no se reabre** (9, RN-06).

> ✅ **Fin de SEG-10**: negocio completo y funcional. Las 7 features conectadas, seeders en cadena, y CerrarHito verificado con los tres escenarios de la sección 6 del SDD.

---

## Cierre

Construiste el backend manual de **Norte Creativo — solo Business**, segmento por segmento y capa por capa:

- **SEG-01..SEG-02**: base transversal (config validada, errores uniformes, envelope, Sequelize multi-motor, health).
- **SEG-03..SEG-08**: las 6 entidades de la cadena (`clientes → campanias → hitos → tareas → entregables → version-entregables`), cada una con Clean Architecture completa.
- **SEG-09**: la feature `aprobaciones`, transaccional, que implementa la capacidad integrada **CerrarHito** exactamente como está descrita en la sección 6 del SDD (RN-01, RN-02, RN-06).
- **SEG-10**: integración, seeders en cadena, y demo de los tres escenarios de negocio.

Cada segmento corresponde a un commit propio en tu bitácora manual. `Presupuesto`, `Factura` y `FacturaHito` quedan para una siguiente fase, al igual que RBAC.
