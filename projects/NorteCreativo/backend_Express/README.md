# Norte Creativo — Backend Express

API REST en Express 5 + TypeScript + Sequelize para la cadena de trabajo de la agencia:

```
Cliente → Campaña → Hito → Tarea → Entregable → VersionEntregable → Aprobación
```

Cada versión de un entregable se aprueba o se rechaza. Cuando **todos** los entregables de un hito tienen su **última versión** `APROBADA`, el hito se cierra solo (`estado: CERRADO`, `fecha_cierre`) dentro de una única transacción. **Ningún endpoint cierra un hito a mano**: `estado` y `fecha_cierre` en el body de `POST/PUT/PATCH /api/hitos` responden `400`.

Las rutas de **administración de seguridad** (`usuarios`, `roles`, `recursos`, `asignaciones-rol`, `concesiones-rol`) exigen **JWT + RBAC** (ver «Acceso a la API»). Las rutas de **negocio** siguen **SIN AUTH** hasta ISS-21.

## Requisitos y arranque

- Node.js 22+ y un motor de base de datos (MySQL por defecto; ver `DB_ENGINE` en `.env.example`).

```bash
cp .env.example .env        # completa el bloque del motor que uses
npm install
npm run dev                 # http://localhost:3012 (sync automático de tablas, sin force ni alter)
npm run db:seed             # opcional: datos de ejemplo (idempotente)
```

Documentación interactiva: `http://localhost:3012/api/docs` (JSON en `/api/docs.json`).
Cada feature trae su carpeta `http/` con peticiones para el cliente REST de VS Code.

## Endpoints

| Recurso | Ruta base | Operaciones |
|---|---|---|
| Clientes | `/api/clientes` | CRUD + `PATCH /:id/deactivate` |
| Campañas | `/api/campanias` | CRUD + `PATCH /:id/deactivate` |
| Hitos | `/api/hitos` | CRUD + `PATCH /:id/deactivate` (el estado no es editable) |
| Tareas | `/api/tareas` | CRUD + `PATCH /:id/deactivate` |
| Entregables | `/api/entregables` | CRUD + `PATCH /:id/deactivate` |
| Versiones de entregable | `/api/version-entregables` | CRUD + `PATCH /:id/deactivate` (`numero_version` y `estado` los controla el sistema) |
| Aprobaciones | `/api/aprobaciones` | `POST`, `GET`, `GET /:id` (registro de auditoría: sin PUT, PATCH ni DELETE) |
| Usuarios | `/api/usuarios` | CRUD + `PATCH /:id/deactivate` (la contraseña se hashea con bcrypt y nunca se devuelve; `username` y `email` únicos → `409`) |
| Roles | `/api/roles` | CRUD + `PATCH /:id/deactivate` (nombre único en mayúsculas → `409`) |
| Recursos | `/api/recursos` | CRUD + `PATCH /:id/deactivate` (`(method, path)` único → `409`; el path es un patrón con `:id`) |
| Asignaciones de rol | `/api/asignaciones-rol` | `GET`, `GET /:id`, `POST` (asignar; si estaba inactiva la reactiva), `PATCH /:id/deactivate` (retirar, lógico), `PATCH /:id/reactivate` |
| Concesiones de rol | `/api/concesiones-rol` | `GET` (filtros `?role_id=` y `?resource_id=`), `GET /:id`, `POST` (conceder; si estaba inactiva la reactiva), `PATCH /:id/deactivate` (revocar, lógico), `PATCH /:id/reactivate` |

## Usuarios de laboratorio

`npm run db:seed` siembra (de forma idempotente, por `username`) un usuario por cada rol de Norte Creativo. Son **solo para práctica en local**; no uses estas contraseñas en ningún entorno real. Cada uno recibe su rol con el seeder (ver la matriz de concesiones). Las rutas aún no están protegidas (ISS-18 e ISS-21).

| username | email | contraseña de laboratorio |
|---|---|---|
| `admin` | `admin@norte-creativo.example` | `Admin123!` |
| `cuentas` | `cuentas@norte-creativo.example` | `Cuentas123!` |
| `creativo` | `creativo@norte-creativo.example` | `Creativo123!` |
| `aprobador` | `aprobador@norte-creativo.example` | `Aprobador123!` |
| `finanzas` | `finanzas@norte-creativo.example` | `Finanzas123!` |

En la base, `password` se guarda como hash bcrypt (`$2…`); la API jamás la devuelve.

## Acceso a la API (3 modalidades)

| Modalidad | Middlewares | Exige | Error |
|---|---|---|---|
| **OPEN** | — | nada | — |
| **JWT** | `authenticate` | token válido y usuario activo | `401` |
| **JWT + RBAC** | `authenticate` + `authorize` | token + concesión activa para el `(method, path)` | `401` / `403` |

- Hoy en **JWT + RBAC**: `/api/usuarios`, `/api/roles`, `/api/recursos`, `/api/asignaciones-rol` y `/api/concesiones-rol`.
- Hoy **OPEN**: `/api/health`, `/api/docs` y `/api/docs.json`, y todavía las rutas de negocio (se protegen en ISS-21). El login se construye después; por ahora el token se firma con el script de desarrollo.
- `authenticate` (`src/features/auth/access/`): exige `Authorization: Bearer <token>`, verifica el JWT (HS256, `iss`, `aud`, `exp`) y **revalida el usuario en la base** en cada petición (inexistente o inactivo → `401`).
- `authorize`: **deny by default**. Consulta en cada petición, **sin caché**, la cadena `users → role_users → roles → resource_roles → resources` con `status = active` en cada eslabón y compara con el patrón (`/api/usuarios/:id` casa con `/api/usuarios/5`). Sin concesión → `403`. Por eso dar o retirar una concesión (o un rol, o una asignación) surte efecto en la **siguiente petición**, sin reiniciar el servidor.

Token de desarrollo (**solo pruebas locales**; lee `JWT_SECRET` del `.env` y consulta la base):

```bash
npx ts-node scripts/dev-token.ts admin        # imprime el access token; prueba también finanzas, cuentas, creativo, aprobador
curl -i -H "Authorization: Bearer <token>" http://localhost:3012/api/usuarios
```

## Roles y catálogo de recursos

`npm run db:seed` siembra, de forma determinista y reconciliadora (reejecutarlo no cambia los conteos):

- **5 roles:** `ADMIN`, `CUENTAS`, `CREATIVO`, `CLIENTE_APROBADOR`, `FINANZAS`.
- **76 recursos** (`src/features/auth/resources/resource-catalog.ts`): un `(method, path)` por endpoint de negocio y de administración de seguridad. Quedan fuera los abiertos (`/api/health`, `/api/docs`).
- **5 asignaciones** (un usuario de laboratorio por rol) y las **concesiones** de la matriz de abajo.

Un rol o un recurso por sí solos **no conceden nada**: el permiso es la fila de `resource_roles` (concesión). Para comprobar que el catálogo cubre todas las rutas reales:

```bash
npx ts-node scripts/check-resource-catalog.ts
```

## Matriz de concesiones por rol

Decisión de diseño a partir de los actores del SDD; está expresada sobre `resource-catalog.ts` en `src/features/auth/resource-roles/role-matrix.ts` y la aplica el seeder con `reconcileRole` (transaccional e idempotente: reejecutar no duplica filas y deja inactivo lo que salga de la matriz).

Leyenda: **L** lectura (`GET` listado y `GET /:id`) · **C** crear (`POST`) · **U** actualizar (`PUT` y `PATCH /:id`) · **D** eliminar (`DELETE` y `PATCH /:id/deactivate`) · `—` sin acceso.

| Recurso | ADMIN | CUENTAS | CREATIVO | CLIENTE_APROBADOR | FINANZAS |
|---|---|---|---|---|---|
| clientes | LCUD | L | — | — | L |
| campañas | LCUD | LCUD | L | L | L |
| hitos | LCUD | LCUD | L | L | L |
| tareas | LCUD | LCUD | L | — | — |
| entregables | LCUD | L | LCU | L | — |
| version-entregables | LCUD | L | LCU | L | — |
| aprobaciones | L C | L | — | L C | — |
| usuarios, roles, recursos, asignaciones-rol, concesiones-rol | LCUD (en `asignaciones-rol` y `concesiones-rol`: L, C, retirar/revocar y reactivar) | — | — | — | — |
| **Concesiones activas** | **76** | **29** | **16** | **11** | **6** |

Usuarios de laboratorio → rol: `admin` → ADMIN, `cuentas` → CUENTAS, `creativo` → CREATIVO, `aprobador` → CLIENTE_APROBADOR, `finanzas` → FINANZAS.

## CerrarHito: cómo funciona

`POST /api/aprobaciones` con `{ "version_entregable_id", "estado": "APROBADA" | "RECHAZADA", "aprobador_id", "comentario"? }` ejecuta, en **una sola transacción**:

1. Busca versión → entregable → tarea → hito (`404` si la versión no existe). El hito se lee con `LOCK.UPDATE` para serializar aprobaciones concurrentes.
2. Si el hito no está `ABIERTO` → `409` (RN-06).
3. Crea la aprobación y copia el veredicto a `version_entregables.estado`.
4. `RECHAZADA` → `hito_cerrado: false` (la aprobación queda guardada, el hito sigue abierto).
5. `APROBADA` → toma la última versión (`numero_version` DESC) de cada entregable del hito y llama a `debeCerrarHito` (`cierre-hito.evaluator.ts`, función pura). Si devuelve `true`, el hito pasa a `CERRADO` con `fecha_cierre`.
6. Cualquier error revierte todo.

Respuesta `201`: `{ aprobacion, hito_cerrado, hito_id, fecha_cierre }`.

## Libreto de la demo

Con el servidor levantado y una base **vacía** (los ids valen `1` porque son los primeros registros de cada tabla; si no, sustitúyelos por los que devuelva cada respuesta).

```bash
B=http://localhost:3012/api
H='Content-Type: application/json'

# 1. cliente -> campaña -> hito -> tarea -> entregable
curl -s -X POST $B/clientes   -H "$H" -d '{"tipo_documento":"NIT","numero_documento":"900123","nombre":"Cafe Andino","email":"contacto@cafeandino.com"}'
curl -s -X POST $B/campanias  -H "$H" -d '{"cliente_id":1,"nombre":"Lanzamiento otoño"}'
curl -s -X POST $B/hitos      -H "$H" -d '{"campania_id":1,"nombre":"Piezas de redes"}'
curl -s -X POST $B/tareas     -H "$H" -d '{"hito_id":1,"nombre":"Diseñar banner"}'
curl -s -X POST $B/entregables -H "$H" -d '{"tarea_id":1,"total":1500}'

# 2. version 1 (nace EN_REVISION)
curl -s -X POST $B/version-entregables -H "$H" -d '{"entregable_id":1}'

# 3. RECHAZADA -> 201, hito_cerrado:false; el hito sigue ABIERTO
curl -s -X POST $B/aprobaciones -H "$H" -d '{"version_entregable_id":1,"estado":"RECHAZADA","aprobador_id":1,"comentario":"Ajustar colores"}'
curl -s $B/hitos/1                    # estado: ABIERTO

# 4. version 2 (numero_version 2, EN_REVISION)
curl -s -X POST $B/version-entregables -H "$H" -d '{"entregable_id":1}'

# 5. APROBADA -> 201, hito_cerrado:true; el hito queda CERRADO con fecha_cierre
curl -s -X POST $B/aprobaciones -H "$H" -d '{"version_entregable_id":2,"estado":"APROBADA","aprobador_id":1,"comentario":"Cumple el brief"}'
curl -s $B/hitos/1                    # estado: CERRADO

# 6. nueva aprobacion sobre ese hito -> 409 (RN-06), nada cambia
curl -s -i -X POST $B/aprobaciones -H "$H" -d '{"version_entregable_id":2,"estado":"APROBADA","aprobador_id":1}'

# Extra: nadie cierra un hito a mano -> 400
curl -s -i -X PATCH $B/hitos/1 -H "$H" -d '{"estado":"CERRADO"}'
```

Para ver que un hito con varios entregables **no** se cierra hasta que todos estén aprobados, crea un segundo entregable en la misma tarea (o en otra del mismo hito) con su versión 1 y aprueba solo una de las dos: la respuesta trae `hito_cerrado: false`.
