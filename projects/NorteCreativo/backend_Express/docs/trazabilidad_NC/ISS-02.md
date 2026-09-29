> **Workspace:** `backend_express` (Norte Creativo) · **Pista:** Business Express + TypeScript (7 issues) ·  **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-02 — Infraestructura de base de datos (Sequelize multi-motor)

**Naturaleza:** práctico
**Issue GitHub:** `#2`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-01 en **Hecho**
**Commit esperado:** `feat(iss-02): infraestructura BD Sequelize Refs #2`

---

## 1. SDD

**OBJ:** Al finalizar, la app se conectará a la base `norte_creativo_express` del motor indicado por `DB_ENGINE`, fallando con un mensaje claro si el motor no está soportado.

**SPEC (qué debe quedar):**
- Drivers del manual §3.1: `sequelize`, `mysql2`, `pg`, `pg-hstore`, `tedious`, `oracledb`.
- `.env` local y `.env.example` versionado con `PORT=3012`, `DB_ENGINE=mysql` y bloques `MYSQL_*`, `POSTGRES_*`, `MSSQL_*`, `ORACLE_*` (convención del manual Express).
- Valores Norte Creativo (motores de `../databases_engines/`): MySQL `localhost:3306` usuario `root`; Postgres `localhost:5433` usuario `nc_admin`; SQL Server `localhost:1433` usuario `sa`; Oracle `localhost:1521` usuario `system` base `XEPDB1`. Base en MySQL/Postgres/MSSQL: **`norte_creativo_express`** (separada de los backends NestJS).
- `src/database/db.ts` del manual §3.2 exportando `sequelize`, `getDatabaseInfo`, `testConnection`, con **los cuatro motores** en `dbConfigurations` (el manual solo trae mysql y postgres).
- `App.dbConnection()` llama `testConnection()` (sin `sync` todavía, no hay modelos).
- `src/database/seeders/` existe vacía (`.gitkeep`).

**REQ (restricciones):**
- La base `norte_creativo_express` la crea **el desarrollador** antes de verificar.
- La contraseña real solo va en `.env`; `.env.example` sin contraseñas.
- No modelos, no `sync`, no `force`/`alter`. No adelantar ISS-03.

**AC:**
- [x] **AC-1** Dado `.env.example`; cuando se revisa; entonces tiene `PORT=3012`, `DB_ENGINE` y los cuatro bloques sin contraseñas, y `.env` no aparece en `git status`.
- [x] **AC-2** Dado el proyecto; cuando `npx tsc --noEmit`; entonces no hay errores.
- [x] **AC-3** Dado MySQL arriba y la base creada; cuando `npm run dev`; entonces el log muestra `Conexión exitosa a MYSQL` y el servidor queda en 3012.
- [x] **AC-4** Dado `DB_ENGINE=foo` en una copia del `.env`; cuando se arranca; entonces falla con `Motor de base de datos no soportado: foo`; al restaurar vuelve a conectar.
- [x] **AC-5** Dado `src/database/seeders/`; cuando se lista; entonces existe y no contiene `*.seeder.ts` ni runner.

**Checklist interno (IA, En curso):**
- [x] Drivers instalados
- [x] .env + .env.example (4 bloques)
- [x] db.ts multi-motor
- [x] dbConnection → testConnection
- [x] seeders/ reservada

---

## 2. Revisión de AC

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

---

## 3. IA usada

**Herramienta / modelo:** Claude Code - Sonnet 5

**Fecha:** 28/09/26

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-02, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-02.md siguiendo docs/manual.md seccion 3 (ISS-02), adaptado a Norte Creativo.

Instala los drivers del manual seccion 3.1 (sequelize, mysql2, pg, pg-hstore, tedious, oracledb).
Crea .env.example (versionado, SIN contraseñas) y actualiza .env local con:
PORT=3012, DB_ENGINE=mysql,
MYSQL_HOST=localhost MYSQL_USER=root MYSQL_PASSWORD= MYSQL_NAME=norte_creativo_express MYSQL_PORT=3306,
POSTGRES_HOST=localhost POSTGRES_USER=nc_admin POSTGRES_PASSWORD= POSTGRES_NAME=norte_creativo_express POSTGRES_PORT=5433,
MSSQL_HOST=localhost MSSQL_USER=sa MSSQL_PASSWORD= MSSQL_NAME=norte_creativo_express MSSQL_PORT=1433,
ORACLE_HOST=localhost ORACLE_USER=system ORACLE_PASSWORD= ORACLE_NAME=XEPDB1 ORACLE_PORT=1521.
En .env (no en .env.example) deja las contraseñas vacias para que yo las llene; no inventes contraseñas.
Crea src/database/db.ts como el manual seccion 3.2 (exporta sequelize, getDatabaseInfo, testConnection) pero con los
CUATRO motores en dbConfigurations (mysql, postgres, mssql, oracle). Si DB_ENGINE no esta soportado, lanza
"Motor de base de datos no soportado: <valor>".
En src/config/index.ts, dbConnection() debe llamar testConnection(). Todavia NO hay modelos ni sync.
Deja src/database/seeders/ con un .gitkeep.

Prohibido: modelos de negocio, sync, force, alter. NO adelantes ISS-03. Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | .env.example y git status | AC-1 | (Evidencia en Proceso.md) | `cat .env.example` y `git status --short` |
|       | compilación | AC-2 | (Evidencia en Proceso.md) | `npx tsc --noEmit` |
|       | log de conexión | AC-3 | (Evidencia en Proceso.md) | `npm run dev` |
|       | log de fallo | AC-4 | (Evidencia en Proceso.md) | `cp .env .env.bak && sed -i 's/^DB_ENGINE=.*/DB_ENGINE=foo/' .env && npm run dev` luego `mv .env.bak .env` |
|       | carpeta | AC-5 | (pEvidencia en Proceso.md) | `ls -la src/database/seeders` |

**Commit (hash):** `feat(iss-02): infraestructura BD Sequelize` con `Refs #2`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «Muéstrame dónde se elige el motor en `db.ts` y qué pasa si `DB_ENGINE` trae un valor que no existe». «¿Por qué la base se llama `norte_creativo_express` y no se comparte con los backends NestJS?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|28/09/2026|CarlosZ|Revisor|Todos|Proceso.md|          |Terminado|

**Respuesta del autor (ajuste o justificación):**

el motor se elige en db.ts, hay un objeto dbConfigurations con una clave por motor (mysql, postgres,
mssql, oracle), cada una con su host, usuario, password, base y puerto leidos del env correspondiente,
selectedEngine toma el valor de DB_ENGINE y selectedConfig busca esa clave en el objeto

si DB_ENGINE trae un valor que no existe en el objeto, selectedConfig da undefined y el codigo lanza
throw new Error antes de intentar conectar, asi el fallo es claro y no un error crudo de sequelize
tratando de conectarse a un host vacio

la base se llama norte_creativo_express y no se comparte con los backends nestjs porque son tres
implementaciones distintas del mismo proyecto (manual, ia, express) y si compartieran tablas un bug
en una podria ensuciar los datos de otra sin que se note, con bases separadas cada backend se puede
probar de forma aislada

---

## 6. Gate

**Estado:** Completo
**Trazabilidad final:** proceso.md
