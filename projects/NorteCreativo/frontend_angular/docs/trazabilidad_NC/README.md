# Trazabilidad — frontend (Norte Creativo · Angular 22)

Angular 22 (standalone + Signals) + PrimeNG 22 (tema Aura) + Tailwind CSS 4.
Consume `projects/NorteCreativo/backend_Express` (Express 5 + TypeScript + Sequelize, JWT + RBAC).
Guía base del docente: `guia_front.docx` (StoreLab Express II · Frontend) y https://tecnogua.com/academic/site/frontend2026/express/, adaptadas a Norte Creativo.

## Datos del entorno

| Dato | Valor |
|---|---|
| Carpeta del frontend | `projects/NorteCreativo/frontend/` |
| Proyecto Angular | `front-norte-creativo` |
| Puerto del frontend | **4200** |
| Backend | `projects/NorteCreativo/backend_Express`, puerto **3012** |
| URL de la API | `http://localhost:3012/api` |
| Swagger | `http://localhost:3012/api/docs` |
| Clave de sesión en `localStorage` | `nortecreativo.session.v1` |
| Bitácora | `frontend/docs/proceso.md` |

## Mapeo StoreLab → Norte Creativo

Es el mismo mapeo del backend (`backend_Express/docs/trazabilidad_NC/README.md`): ProductType → Campania, Product → Hito, Sale (transaccional) → Aprobacion.

| ISS | StoreLab (docente) | Norte Creativo | API que consume |
|---|---|---|---|
| ISS-00 | Requisitos previos | Requisitos + interruptor `AUTH_ENABLED` en el backend | `/api/sesion`, `/api/permisos` |
| ISS-01 | Bootstrap + 01A esqueleto + 01B menú | Igual, con el menú de Norte Creativo | — |
| ISS-02 | Núcleo, modelos, servicios, SessionStore, directiva, Shell | Igual, con las 7 entidades y auth de Norte Creativo | todas |
| ISS-03 | CRUD clientes | CRUD clientes | `/api/clientes` |
| ISS-04 | CRUD tipos de producto | CRUD campañas (relación con cliente) | `/api/campanias` |
| ISS-05 | Productos + relación + stock bajo | Hitos y tareas (+ conteo de hitos abiertos) | `/api/hitos`, `/api/tareas` |
| ISS-06 | Ventas y detalle (cabecera + líneas) | Entregables y versiones (detalle enrutado) | `/api/entregables`, `/api/version-entregables` |
| ISS-07 | Detalle de ventas, dashboard, cierre Fase I | Aprobaciones (CerrarHito), dashboard, cierre Fase I | `/api/aprobaciones` + lecturas |
| ISS-08 | JWT, perfil y permisos efectivos | Igual | `/api/sesion/*`, `/api/permisos` |
| ISS-09 | Guards y RBAC estructural | Igual, con los 5 roles | — |
| ISS-10 | Administración RBAC | Igual + `GET /api/usuarios/:id/permisos` en el backend | `/api/usuarios`, `/api/roles`, `/api/recursos`, `/api/asignaciones-rol`, `/api/concesiones-rol` |
| ISS-11 | Build, calidad y problemas | Igual, con el recorrido de una campaña hasta el cierre del hito | todas |

StoreLab es la guía del **patrón**; el alcance es el dominio completo de Norte Creativo. Facturación queda fuera.

## Fases

| Fase | ISS | Interruptores |
|---|---|---|
| I · Fundamentos y Business | ISS-00 a ISS-07 | `requireAuth: false` en los dos environments y `AUTH_ENABLED=false` en el backend |
| II · Auth/RBAC | ISS-08 a ISS-11 | los dos en `true` |

La guía construye la Fase I contra el backend "antes de ISS-13". Aquí se usa el interruptor `AUTH_ENABLED` del sitio del docente (ISS-00), para no volver a una versión vieja del backend. `POST /api/aprobaciones` exige JWT siempre (RN-05).

## Usuarios del seeder del backend

| Usuario | Password | Rol | Permisos (antes de ISS-10) | Permisos (desde ISS-10) |
|---|---|---|---:|---:|
| `admin` | `Admin123!` | ADMIN | 85 | 86 |
| `cuentas` | `Cuentas123!` | CUENTAS | 36 | 36 |
| `creativo` | `Creativo123!` | CREATIVO | 16 | 16 |
| `aprobador` | `Aprobador123!` | CLIENTE_APROBADOR | 11 | 11 |
| `finanzas` | `Finanzas123!` | FINANZAS | 11 | 11 |

El catálogo tiene 86 recursos (87 desde ISS-10, por `GET /api/usuarios/:id/permisos`). ADMIN recibe todos menos `POST /api/aprobaciones`, que es solo de CLIENTE_APROBADOR.

## Diferencias con el contrato de StoreLab

| Tema | StoreLab | Norte Creativo |
|---|---|---|
| Sobre de respuesta | inglés (`{ clients }`, `{ client }`) | español (`{ clientes }`, `{ cliente }`, `{ versiones }`, `{ version }`…) |
| Perfil | `{ user }` | `{ usuario }` con `roles[]` |
| Permisos | `{ permissions: [{ resource_id, method, path, role_id, role_name }] }` (una fila por rol) | `{ total, permisos: [{ method, path, roles }] }` (una fila por permiso, con sus roles) |
| Operación transaccional | `POST /api/ventas` | `POST /api/aprobaciones` → `{ aprobacion, hito_cerrado, hito_id, fecha_cierre }`; el aprobador sale del JWT |
| Cambio de contraseña | `PATCH /api/usuarios/:id/password` | no existe (fuera de alcance) |

## Cómo se llenan los ISS

- Secciones 1 y 3 listas. El prompt de la sección 3 se pega tal cual en Claude Code.
- Sección 2 y la fila de la sección 5 ya tienen al revisor; cuando revises, pon la fecha y cambia `pendiente`.
- La "Respuesta del autor" de la sección 5 ya viene escrita. Si al verificar sale algo distinto, agrega una línea `ajuste: …` al final.
- En la sección 4, `#NN` se cambia por el número real del Issue en GitHub, igual en el commit.
- Autoevaluación y Gate pasan a `completado` cuando los AC estén comprobados.

## Convención de commits

`feat(front-iss-NN): <acción> Refs #NN` — un commit por ISS cerrado.
