# Norte Creativo — Backend IA

API REST en NestJS (Clean Architecture, Sequelize) para la gestión de clientes, campañas, hitos, tareas, entregables y sus versiones, con el flujo de aprobaciones que cierra un hito automáticamente cuando todos sus entregables quedan aprobados.

## Descripción

El dominio modela la cadena de trabajo de una agencia:

```
Cliente → Campaña → Hito → Tarea → Entregable → VersionEntregable → Aprobación
```

Cada versión de un entregable se aprueba o se rechaza. Cuando **todas** las últimas versiones de **todos** los entregables de un hito quedan `APROBADA`, el hito se cierra solo (`estado: CERRADO`, `fechaCierre` con la fecha real) dentro de una única transacción atómica — no hay ningún endpoint que "cierre" el hito a mano.

El proyecto sigue Clean Architecture por feature (`domain` / `application` / `infrastructure` / `presentation`), sin ORM ni framework filtrándose al dominio: las entidades son clases TypeScript puras.

## Requisitos

- Node.js 22+
- npm
- Un motor de base de datos accesible (MySQL, PostgreSQL, SQL Server u Oracle — el proyecto soporta los cuatro, ver `.env.example`). Esta guía usa **MySQL**, que es el dialecto con el que se probó toda la cadena.
- Docker (opcional, si usas los contenedores de `../databases_engines`)

## Creación de la base de datos

Este backend usa su **propia** base de datos, separada de `backend_manual` (que usa `norte_creativo`), para poder correr ambos backends contra el mismo motor sin pisarse:

```sql
CREATE DATABASE IF NOT EXISTS norte_creativo_ia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Si usas el `docker-compose.yml` de `../databases_engines`, el contenedor `nc-mysql` ya expone MySQL en `localhost:3306` con las credenciales de root definidas en su `.env`; solo falta crear esta base adicional con el comando de arriba.

## Configuración del `.env`

Copia `.env.example` a `.env` y completa **solo** el bloque del motor que vayas a usar (el que indiques en `DB_DIALECT`):

```bash
cp .env.example .env
```

Ejemplo para MySQL:

```env
PORT=3011
DB_DIALECT=mysql

DB_MYSQL_HOST=localhost
DB_MYSQL_PORT=3306
DB_MYSQL_USERNAME=root
DB_MYSQL_PASSWORD=tu_password
DB_MYSQL_NAME=norte_creativo_ia
```

La app valida el `.env` **al arrancar**, antes de intentar conectarse: si falta una variable del bloque activo, el proceso termina de inmediato con `Error de configuración: falta o es inválida la variable DB_MYSQL_HOST` (o la que corresponda), sin llegar a lanzar un `ECONNREFUSED`. El `.env` nunca se commitea (está en `.gitignore`); `.env.example` sí, sin credenciales reales.

## Arranque

```bash
npm install
npm run start:dev
```

`start:dev` libera primero el puerto 3011 (`scripts/free-port.js`, útil si quedó un proceso previo colgado) y luego arranca Nest en modo watch. Al iniciar:

1. Se valida el `.env`.
2. Se conecta a la base de datos y se sincronizan las tablas (`sequelize.sync({ alter: false })` — crea lo que falte, nunca borra ni altera columnas existentes).
3. Corre el `SeedersRunner`, que siembra datos demo **en orden de dependencia**: `clientes → campañas → hitos → tareas → entregables → version-entregables`. Cada seeder usa `findOrCreate`, así que reiniciar la app no duplica nada. **Aprobaciones no se siembra** (no hay un dato demo que no altere el estado del hito demo).

Otros scripts:

```bash
npm run build       # compila a dist/
npm run start:prod  # corre dist/main.js
npm run free:port   # libera el puerto 3011 manualmente
```

## Endpoints

Prefijo global: `/api`. Todas las respuestas exitosas quedan envueltas en `{ statusCode, message, data, timestamp }`; los listados van en `data.items[]` + `data.meta`.

| Feature | Endpoints |
|---|---|
| Health | `GET /api/health` |
| Clientes | `GET /api/clientes` · `GET /api/clientes/:id` · `POST /api/clientes` |
| Campañas | `GET /api/campanias` · `GET /api/campanias/:id` · `POST /api/campanias` |
| Hitos | `GET /api/hitos` · `GET /api/hitos/:id` · `POST /api/hitos` |
| Tareas | `GET /api/tareas` · `GET /api/tareas/:id` · `POST /api/tareas` |
| Entregables | `GET /api/entregables` · `GET /api/entregables/:id` · `POST /api/entregables` |
| Versiones de entregable | `GET /api/version-entregables/:id` · `POST /api/version-entregables` (sin listado; `numeroVersion` se calcula solo, nunca lo envía el cliente) |
| Aprobaciones | `GET /api/aprobaciones/:id` · `POST /api/aprobaciones` (puede cerrar el hito automáticamente) |

Errores comunes en todas las features: `400` (payload inválido o con campos no permitidos), `404` (FK o id inexistente), `409` (regla de negocio: documento duplicado, campaña inactiva, hito ya cerrado).

## Swagger

Con la app corriendo:

```
http://localhost:3011/api/docs
```

Documenta las 7 features de negocio (Clientes, Campañas, Hitos, Tareas, Entregables, Versiones de entregable, Aprobaciones) más Health.

## Libreto de la demo (cierre automático de hito)

Con la app arrancada y usando los datos que tú mismo crees (los `id` de ejemplo abajo van a variar en tu base):

```bash
# 1. Cliente
curl -s -X POST localhost:3011/api/clientes -H 'Content-Type: application/json' \
  -d '{"tipoDocumento":"NIT","numeroDocumento":"900222333-4","nombre":"Alpina S.A."}'
# -> data.id = 10

# 2. Campaña (usa el id del cliente)
curl -s -X POST localhost:3011/api/campanias -H 'Content-Type: application/json' \
  -d '{"clienteId":10,"nombre":"Relanzamiento de marca"}'
# -> data.id = 7

# 3. Hito (usa el id de la campaña)
curl -s -X POST localhost:3011/api/hitos -H 'Content-Type: application/json' \
  -d '{"campaniaId":7,"nombre":"Pauta redes sociales"}'
# -> data.id = 7, data.estado = "ABIERTO"

# 4. Tarea (usa el id del hito)
curl -s -X POST localhost:3011/api/tareas -H 'Content-Type: application/json' \
  -d '{"hitoId":7,"nombre":"Diseño de banners"}'
# -> data.id = 8

# 5. Entregable (usa el id de la tarea)
curl -s -X POST localhost:3011/api/entregables -H 'Content-Type: application/json' \
  -d '{"tareaId":8}'
# -> data.id = 9, data.estado = "EN_PROCESO"

# 6. Versión 1 del entregable
curl -s -X POST localhost:3011/api/version-entregables -H 'Content-Type: application/json' \
  -d '{"entregableId":9}'
# -> data.id = 13, data.numeroVersion = 1

# 7. Rechazar la versión 1 -> el hito SIGUE abierto (RN-01)
curl -s -X POST localhost:3011/api/aprobaciones -H 'Content-Type: application/json' \
  -d '{"versionEntregableId":13,"estado":"RECHAZADA","aprobadorId":1,"comentario":"Falta ajustar la paleta de colores"}'
# -> data.hitoCerrado = false

curl -s localhost:3011/api/hitos/7
# -> data.estado = "ABIERTO"

# 8. Versión 2 (corrige lo rechazado)
curl -s -X POST localhost:3011/api/version-entregables -H 'Content-Type: application/json' \
  -d '{"entregableId":9,"observaciones":"Corrige paleta de colores"}'
# -> data.id = 14, data.numeroVersion = 2  (automático: última + 1)

# 9. Aprobar la versión 2 -> es la única versión vigente del único entregable
#    del hito, así que el hito se CIERRA automáticamente en la misma transacción
curl -s -X POST localhost:3011/api/aprobaciones -H 'Content-Type: application/json' \
  -d '{"versionEntregableId":14,"estado":"APROBADA","aprobadorId":1,"comentario":"Aprobado, listo para publicar"}'
# -> data.hitoCerrado = true, data.hitoId = 7, data.fechaCierre = "2026-09-18T02:51:57.327Z"

curl -s localhost:3011/api/hitos/7
# -> data.estado = "CERRADO", data.fechaCierre presente

# 10. Intentar aprobar de nuevo sobre ese hito ya cerrado -> 409 (RN-06)
curl -s -X POST localhost:3011/api/version-entregables -H 'Content-Type: application/json' \
  -d '{"entregableId":9}'
# -> data.id = 15, numeroVersion = 3 (crear una versión SÍ se permite; aprobarla ya no)

curl -s -i -X POST localhost:3011/api/aprobaciones -H 'Content-Type: application/json' \
  -d '{"versionEntregableId":15,"estado":"APROBADA","aprobadorId":1}'
# -> HTTP 409 {"message":"El hito con id 7 no está ABIERTO y no admite nuevas aprobaciones"}
```

Este es exactamente el recorrido verificado en el desarrollo de ISS-07 (los `id` de esta guía son reales de esa sesión de prueba).

### Qué demuestra cada paso

- **Paso 7** — rechazar una versión registra la aprobación (queda en la tabla `aprobaciones`) pero **no** toca el hito.
- **Paso 9** — aprobar la última versión pendiente de un hito con un solo entregable dispara el cierre automático: todo ocurre dentro de una única transacción de Sequelize (`sequelize.transaction`) que bloquea la fila del hito con `LOCK.UPDATE` mientras evalúa y, si corresponde, actualiza su estado — si cualquier paso falla, no queda nada a medias.
- **Paso 10** — un hito `CERRADO` rechaza cualquier aprobación nueva con `409`, aunque la versión y el entregable existan y sean válidos.

## Notas de alcance

- Sin autenticación: no existe `src/features/auth` ni `src/config/jwt`, y `package.json` no depende de `@nestjs/jwt`, `passport`, `passport-jwt` ni `bcrypt`. El campo `aprobadorId` se registra tal cual lo envía el cliente, sin validar su rol contra RBAC (queda para una fase posterior).
- Sin `sync({ force: true })` ni `alter: true` en ningún lugar del código — las tablas se crean si no existen, nunca se destruyen ni se alteran automáticamente.
