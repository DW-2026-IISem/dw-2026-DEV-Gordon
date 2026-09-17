> **Workspace:** `backend_IA` (Norte Creativo) · **Pista:** solo Business (7 issues) · **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-02 — Entorno Sequelize y common

**Naturaleza:** práctico
**Issue GitHub:** `#1`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:*Carlos Zarate*
**Dependencias:** ISS-01 en **Hecho**
**Commit esperado:** `feat(iss-02): entorno Sequelize y common` con `Refs #1`

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, la app validará su `.env` al arrancar y se conectará a la base de datos `norte_creativo` del motor indicado por `DB_DIALECT`, con logger y filtro de errores comunes, para que las features siguientes persistan datos sin configurar nada más.

**SPEC**
- `src/config/environment/`: carga y **validación** del `.env` (falla rápido, con mensaje que **nombra la variable** faltante del bloque del dialecto activo).
- `src/infrastructure/database/sequelize/sequelize.factory.ts`: crea la instancia según `DB_DIALECT` leyendo **solo** el bloque `DB_<MOTOR>_*` correspondiente; `ALL_MODELS = []` (aún sin modelos); `sequelize.sync({ alter: false })`.
- `sequelize.module.ts` global que expone la instancia al resto de la app.
- `src/common/exceptions/` con la jerarquía `ApplicationException(statusCode)` → `EntityNotFoundException (404)`, `DomainException (400)`, `BusinessRuleException (409)`; `src/common/filters/global-exception.filter.ts` y `src/common/interceptors/` (`logging`, `timeout`, `response`).
- **Envelope de respuesta:** `ResponseInterceptor` envuelve toda respuesta exitosa en `{ statusCode, message, data, timestamp }`; los listados paginados van en `data.items[]` + `data.meta`. Por eso `GET /api/health` pasa a responder `{ …, "data": { "status": "ok" } }` y los AC de ISS-03…ISS-06 hablan de `data.<campo>`.
- **Fail-fast real:** el módulo de Sequelize inyecta el namespace tipado `envConfig.KEY` (no `ConfigService`) para que la validación del `.env` ocurra **antes** de intentar conectar.
- `.env.example` **versionado** y `.env` **local** con el contrato completo.
- Base de datos vacía `norte_creativo` creada **por el desarrollador** antes de Verificación (ya existe del backend_manual; puede reusarse o crear `norte_creativo_ia` para aislar los dos backends).

**REQ**
- `sync({ alter: false })`. Nunca `force: true` ni `alter: true`.
- Contrato `.env`: `DB_DIALECT` + bloques `DB_MYSQL_*` / `DB_POSTGRES_*` / `DB_MSSQL_*` / `DB_ORACLE_*`. **No** `DB_HOST` / `DB_USERNAME` genéricos.
- Fuera de alcance: Clientes, Campanias, Hitos, Tareas, Entregables, Versiones, Aprobaciones, Auth, RBAC. No adelantar ISS-03.
- `.env` no se commitea. `.env.example` sí, sin credenciales reales.
- Puerto 3011. Los motores viven en `../databases_engines/` (Postgres en 5433, no 5432).

**AC:**
- [x] **AC-1** Dado un `.env` con `DB_DIALECT=mysql`, bloque `DB_MYSQL_*` completo y la BD `norte_creativo` existente; cuando **el desarrollador** ejecuta `npm run start:dev`; entonces el log muestra la conexión a la BD como exitosa y la app queda escuchando en `3011`.
- [x] **AC-2** Dado una **copia** del `.env` a la que se le quitó una variable crítica del bloque activo (`DB_MYSQL_HOST`, `DB_MYSQL_USERNAME` o `DB_MYSQL_NAME`); cuando se arranca la app con esa copia; entonces el boot **falla antes de conectar** (sin `ECONNREFUSED`) con un mensaje `Error de configuración: …` que nombra la variable faltante; y al restaurar el `.env` original vuelve a arrancar.
- [x] **AC-3** Dado el código fuente; cuando se busca `sync(`; entonces la única llamada es `sync({ alter: false })` y no existe `force: true` en ningún archivo.
- [x] **AC-4** Dado el repositorio; cuando se revisa `git status` y `.env.example`; entonces `.env` **no** aparece para commit y `.env.example` contiene `DB_DIALECT` y los cuatro bloques completos.

**Checklist interno:**
- [x] Env tipado y validado (por dialecto activo)
- [x] `.env.example` multi-motor + `.env` local
- [x] Factory Sequelize multi-dialecto (`mysql2`, `pg`, `tedious`, `oracledb`)
- [x] Módulo Sequelize global
- [ ] `GlobalExceptionFilter` + interceptores registrados en `main.ts`
- [ ] Sin features de negocio ni Auth

---

## 2. Revisión de AC

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|  19/07  | Carlos Z | Revisor de AC | OBJ, SPEC, REQ, AC | este archivo   |          | pendiente |

---

## 3. IA usada 

**Herramienta / modelo:** Claude Code - modelo sonnet 5 high.

**Fecha:** (17/09)

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-02, no del backend entero.

Implementa los AC de docs/trazabilidad/ISS-02.md.

Entorno: src/config/environment con validacion al arrancar (class-validator sobre process.env) que exige SOLO las
variables del bloque del DB_DIALECT activo y falla con un mensaje "Error de configuracion: ..." que nombra la variable faltante.
Sequelize: src/infrastructure/database/sequelize/sequelize.factory.ts multi-dialecto (mysql | postgres | mssql | oracle)
con ALL_MODELS = [] y sequelize.sync({ alter: false }); sequelize.module.ts global cuyo useFactory inyecta el namespace
tipado envConfig.KEY (NO ConfigService) para que la validacion ocurra ANTES de intentar conectar.
Common: src/common/exceptions (ApplicationException con statusCode; EntityNotFoundException 404, DomainException 400,
BusinessRuleException 409), src/common/filters/global-exception.filter.ts que lee ese statusCode,
src/common/interceptors/{logging,timeout,response}.interceptor.ts. ResponseInterceptor envuelve toda respuesta exitosa en
{ statusCode, message, data, timestamp }. Todo registrado en main.ts.
Escribe .env.example Y actualiza el .env local con el contrato:
DB_DIALECT + bloques DB_MYSQL_*, DB_POSTGRES_*, DB_MSSQL_*, DB_ORACLE_*. NO uses DB_HOST / DB_USERNAME genericos.
La base de datos se llama norte_creativo_ia. Instala los drivers: mysql2, pg, tedious, oracledb.

Prohibido: force: true, alter: true, modelos de negocio (Cliente, Campania, Hito, Tarea, Entregable, VersionEntregable,
Aprobacion), Auth, Users, JWT Token, RBAC. NO adelantes ISS-03.
NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI 

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 17/09 | log de arranque con conexión OK | AC-1 | [5:20:56 PM] Starting compilation in watch mode...[5:20:59 PM] Found 0 errors. Watching for file changes.[Nest] 6020  - 09/17/2026, 5:21:00 PM     LOG [NestFactory] Starting Nest application... | `npm run start:dev` |
| 17/09 | log de fallo explícito | AC-2 | Error de configuracion: falta o es invalida la bariable DB_MYSQL_HOST | copia del `.env` sin `DB_MYSQL_HOST` |
| 17/09 | búsqueda en código | AC-3 | `sequelize.factory.ts:<línea>` | `rg -n "sync\(|force" src` |
| 17/09 | estado de git | AC-4 | Ver en proceso md | `git status --short` y `cat .env.example` |

**Commit (hash):** Completo — `feat(iss-02): entorno Sequelize y common` · `Refs #2`
**Autoevaluación de AC:** Completo (AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí)

---

## 5. Revisión humana del resultado

Preguntas guía: abrir el factory y pedir «muéstrame dónde se elige el dialecto y dónde está `alter: false`»; «¿qué pasa si `DB_DIALECT=postgres` y falta `DB_POSTGRES_HOST`?».

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
| 17/09 | Carlos Z | Revisor: El proyecto se ejecuto con normalidad en el puerto 3011 logro conexion con la BD y  marco todos los AC como exitosos |   Todos   |     Imagenes Adjuntas al proceso.md     | Todo funcional |  Issue marcada como terminada  |

**Respuesta del autor (ajuste o justificación):**

El dialecto se elige en sequelize.factory.ts, ahi hay un switch (o if) sobre DB_DIALECT que arma la configuracion segun el motor: mysql, postgres, mssql u oracle ,cada rama lee SOLO el bloque de variables de ese motor (DB_MYSQL_, DB_POSTGRES_), nunca las de los otros tres, por eso puedo cambiar de motor tocando una sola variable sin que me pida configurar los cuatro.

El alter false esta en sequelize.module.ts, en el useFactory que crea la conexion, en la linea sequelize.sync({ alter: false }). Se ejecuta una sola vez al levantar la app esa opcion le dice a sequelize que solo cree las tablas que no existen, pero que nunca modifique ni borre columnas existentes por su cuenta si tocara alter: true, correria el riesgo de que un cambio en una entidad me reescriba una columna con datos reales sin que yo lo decidiera explicitamente.

Si DB_DIALECT=postgres y falta DB_POSTGRES_HOST, la app no debe ni intentar conectarse, la validacion en env.validation.ts corre antes de que sequelize.module.ts arranque, y como esta atada al dialecto activo, si el bloque postgres esta incompleto lanza un error de configuracion que nombra la variable que falta (DB_POSTGRES_HOST es requerida). El boot se detiene ahi mismo, con un mensaje claro, y nunca llega a intentar el connect, por eso nunca deberia verse un ECONNREFUSED en este caso, que seria el sintoma de que la validacion no esta corriendo antes de la conexion, lo probe quitando DB_MYSQL_HOST de mi .env real y efectivamente fallo antes de conectar, sin ECONNREFUSED, y al restaurar el .env volvio a arrancar normal


---

## 6. Gate

**Estado:** aprobado 

**Conclusión:** se cumplieron todos los AC, se pasa al issue #3

**Trazabilidad final:** [enlace al Issue)](https://github.com/DW-2026-IISem/dw-2026-DEV-Gordon/issues/2)