# Trazabilidad — backend_express (Norte Creativo · Semana 07)

Express 5 + TypeScript + Sequelize, estructura por features, **SIN AUTH**.
Manual base del docente: `docs/manual.md` (StoreLab Express), adaptado a Norte Creativo.

## Datos del entorno

| Dato | Valor |
|---|---|
| Carpeta | `projects/NorteCreativo/backend_express/` |
| Puerto | **3012** (3010 manual NestJS, 3011 IA NestJS) |
| Motor por defecto | MySQL (`nc-mysql`, `localhost:3306`, usuario `root`) |
| Base de datos | `norte_creativo_express` (separada de los backends NestJS) |
| Variables | Convención del manual Express: `DB_ENGINE` + `MYSQL_*`, `POSTGRES_*`, `MSSQL_*`, `ORACLE_*` |

Crear la base antes del ISS-02:

```bash
docker exec -it nc-mysql mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS norte_creativo_express CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## Mapeo StoreLab → Norte Creativo

| StoreLab (manual) | Norte Creativo | API |
|---|---|---|
| Client | Cliente (sin password) | `/api/clientes` |
| ProductType | Campania (FK a Cliente) | `/api/campanias` |
| Product | Hito (FK a Campania, estado) | `/api/hitos` |
| — (patrón de relación) | Tarea (FK a Hito) | `/api/tareas` |
| — | Entregable (FK a Tarea) | `/api/entregables` |
| — | VersionEntregable (FK a Entregable, versionado) | `/api/version-entregables` |
| Sale (transaccional) | Aprobacion (cierre automático de hito) | `/api/aprobaciones` |

StoreLab es la guía del **patrón**; el alcance es el dominio completo de Norte Creativo (sin RBAC), igual que en los backends NestJS.

## ISS del backend

| ISS | Qué construye | Sección del manual |
|---|---|---|
| ISS-01 | Esqueleto Express + TS, puerto 3012, `/api/health` | §2 |
| ISS-02 | Sequelize multi-motor, `.env`, `db.ts` | §3 |
| ISS-03 | Cliente CRUD completo (GET, POST, PUT, PATCH, DELETE físico/lógico) | §4–§8 |
| ISS-04 | Seeders Faker + runner `npm run db:seed` | §9 |
| ISS-05 | Swagger registry `/api/docs` | §10 |
| ISS-06 | Campania CRUD + relación con Cliente + seeder + swagger | §11–§12 |
| ISS-07 | Hito CRUD + relación con Campania + RN-08 + invariantes de estado | §12 |
| ISS-08 | Tarea CRUD + relación con Hito | §11–§12 |
| ISS-09 | Entregable CRUD + relación con Tarea | §11–§12 |
| ISS-10 | VersionEntregable: número automático, RN-04, RN-06 | §11–§12 |
| ISS-11 | Aprobacion + CerrarHito transaccional (RN-01, RN-02, RN-06) | §13 (patrón transaccional de Sale) |

## Cruce con las actividades de Moodle (D1–D6)

| Actividad | Se demuestra con | Evidencia |
|---|---|---|
| D1. Clients con reglas y seeder | ISS-03 + ISS-04 | AC de cliente (201/400/404/409) + seed idempotente |
| D2. ProductTypes con seeder | ISS-06 | Campania + FK + seed |
| D3. Products con persistencia | ISS-07 | Hito + FK + estado + seed |
| D4. Invariantes de negocio | ISS-03, ISS-06, ISS-07, ISS-10, ISS-11 | `numero_documento` único (409), cliente inactivo (409), RN-08 campaña inactiva (409), hito nace ABIERTO, versión numerada automática, versión aprobada inmutable (RN-04), hito cerrado no admite versiones ni aprobaciones (RN-06), cierre automático (RN-01/RN-02) |
| D5. Decisiones de diseño | `docs/sdd.md` | decisiones listadas abajo |
| D6. SDD + Kanban | `docs/sdd.md`, `docs/kanban.md` | WIP=1, un commit por ISS |

## Decisiones de diseño (insumo para D5)

1. **Cliente sin password.** En StoreLab el cliente también es usuario; en Norte Creativo no lo es (los usuarios son otra entidad, Semana 06).
2. **Base separada** `norte_creativo_express`, para no mezclar tablas con los backends NestJS.
3. **`db.ts` con los cuatro motores** (el manual solo configura mysql y postgres), para ser consistente con `databases_engines/`.
4. **Códigos 400/404/409** en vez del 500 genérico del manual, para que las invariantes sean verificables (D4).
5. **Status por defecto `active`** (el manual usa `inactive` para Client); con `inactive` la regla de "cliente activo" bloquearía todo.
6. **Nueva regla en Campania**: no se crea campaña para un cliente inactivo (análoga a "no producto con tipo inactivo").
7. **Invariantes de estado del Hito en el controller**: la estructura del manual Express no tiene capa de dominio (a diferencia de la Clean Architecture usada en NestJS), así que RN-06/RN-08 se aplican en el controller antes del insert.
8. **Dominio completo, no solo 3 entidades.** StoreLab es la guía del patrón; Norte Creativo necesita toda su cadena para ser funcional, igual que en NestJS.
9. **CerrarHito en el controller de aprobaciones con transacción y `LOCK.UPDATE`**, y la regla de cierre aislada en un evaluador puro (`cierre-hito.evaluator.ts`), porque la estructura del manual Express del curso (modelo + controller + rutas, sin repositorio ni capa de dominio) ubica la transacción de ventas en el controller.
10. **El estado del hito y de la versión solo lo cambia una aprobación.** Enviar `estado` por HTTP responde 400 (en NestJS lo rechazaba el whitelist del DTO).
11. **Aprobaciones inmutables**: solo POST y GET, sin update ni delete, porque son registro de auditoría.

## Convención de commits (guía Semana 07)

`[S07][#NN] <acción>` + `Refs #NN` — un commit por ISS cerrado.
