## PROCESO.MD 
### BITACORA GENERAL DE LA CONSTRUCCION DEL BACKEND NESTJS DE NORTE CREATIVO - SOLO BUSINESS
### ESTUDIANTE: CARLOS H. ZARATE

---

## FASE 0 - REQUISITOS PREVIOS

Empezamos verificando que versiones de nodejs, npm y nest tenemos instalados en el wsl / linux

Comando:
```bash
node -v && npm -v && nest --version
```

Salida: 
![alt text](images/proceso-1789436742029.png)

---

## SEG-01 - Esqueleto de NestJs Arrancable

Se busca crear un backend basico y en blanco, sin ninguna feature, listo para ejecutar nuestras implementaciones requeridas

### 01.1 Creacion de carpeta del proyecto 

```bash
mkdir -p backend_manual
chmod -R 777 backend_manual
cd backend_manual
```

### 01.2 Crear el proyecto base con nest new

Entramos a la ruta /dw-2026-DEV-Gordon/projects/NorteCreativo/backend_manual y usamos el comando siguiente para crear el backend ahi dentro

Comando:
```bash
nest new . --package-manager npm --skip-git
```

Salida:
![alt text](images/proceso-1789438397555.png)

### 01.3 Convertir a ESM y definir los scripts

Comando:
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
Salida:
![alt text](images/proceso-1789438629783.png)

### 01.4 Instalar dependencias adicionales

Comando:
```bash
npm install @nestjs/swagger \
  sequelize sequelize-typescript mysql2 pg oracledb tedious \
  class-validator class-transformer dotenv

npm install -D @types/supertest \
  vitest @vitest/coverage-v8 vite-tsconfig-paths supertest \
  oxlint source-map-support
```
Salida: 
![alt text](images/proceso-1789438750098.png)
![alt text](images/proceso-1789438846763.png)

### 01.5 Configurar Typescript y tooling

Comando:
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
Salida: 
![alt text](images/proceso-1789439052910.png)
![alt text](images/proceso-1789439071807.png)
![alt text](images/proceso-1789439093934.png)

### 01.6 Script auxiliar y variables de entorno

comando:
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
Para el backend_manual usare el puerto 3010, diferente al backend_ia para no tener choques si llego a ejecutar ambos backends a la vez.

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

con el siguiente comando podemos copiar lo hecho en el env example a un env determinado

```bash
cp .env.example .env
```
Salida:
![alt text](images/proceso-1789440354021.png)

### 01.7 Estructura de carpetas

comando:

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

Salida: 

![alt text](images/proceso-1789440417344.png)
![alt text](images/proceso-1789440478709.png)

### Commit #1 - El proyecto arranca aun sin features definidas

Esta en el puerto 3000, porque en este punto esta con el main.ts generico

![alt text](images/proceso-1789440674809.png)
![alt text](images/proceso-1789440666164.png)
---