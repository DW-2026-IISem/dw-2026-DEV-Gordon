# Norte Creativo — Backend Express

API REST en Express 5 + TypeScript + Sequelize para la cadena de trabajo de la agencia:

```
Cliente → Campaña → Hito → Tarea → Entregable → VersionEntregable → Aprobación
```

Cada versión de un entregable se aprueba o se rechaza. Cuando **todos** los entregables de un hito tienen su **última versión** `APROBADA`, el hito se cierra solo (`estado: CERRADO`, `fecha_cierre`) dentro de una única transacción. **Ningún endpoint cierra un hito a mano**: `estado` y `fecha_cierre` en el body de `POST/PUT/PATCH /api/hitos` responden `400`.

Todos los endpoints son **SIN AUTH** (no hay autenticación en este backend).

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

## Usuarios de laboratorio

`npm run db:seed` siembra (de forma idempotente, por `username`) un usuario por cada rol de Norte Creativo. Son **solo para práctica en local**; no uses estas contraseñas en ningún entorno real. Todavía no tienen roles asignados (ISS-17) y `/api/usuarios` aún no está protegido (ISS-18 e ISS-21).

| username | email | contraseña de laboratorio |
|---|---|---|
| `admin` | `admin@norte-creativo.example` | `Admin123!` |
| `cuentas` | `cuentas@norte-creativo.example` | `Cuentas123!` |
| `creativo` | `creativo@norte-creativo.example` | `Creativo123!` |
| `aprobador` | `aprobador@norte-creativo.example` | `Aprobador123!` |
| `finanzas` | `finanzas@norte-creativo.example` | `Finanzas123!` |

En la base, `password` se guarda como hash bcrypt (`$2…`); la API jamás la devuelve.

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
