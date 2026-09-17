> **Workspace:** `backend_IA` (Norte Creativo) · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-02 — Entorno Sequelize y common

**Naturaleza:** práctico (desarrollo de software backend)
**Issue GitHub:** `#__`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:**
**Dependencias:** ISS-01 en **Hecho**
**Commit esperado:** `feat(iss-02): entorno Sequelize y common` con `Refs #__`

> El estado del issue **vive en el tablero Kanban**, no en este archivo.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, la app validará su `.env` al arrancar y se conectará a la base de datos `norte_creativo` del motor indicado por `DB_DIALECT`, con logger y filtro de errores comunes, para que las features siguientes persistan datos sin configurar nada más.

**SPEC (qué debe quedar):**
- `src/config/environment/`: carga y **validación** del `.env` (falla rápido, con mensaje que **nombra la variable** faltante del bloque del dialecto activo).
- `src/infrastructure/database/sequelize/sequelize.factory.ts`: crea la instancia según `DB_DIALECT` leyendo **solo** el bloque `DB_<MOTOR>_*` correspondiente; `ALL_MODELS = []` (aún sin modelos); `sequelize.sync({ alter: false })`.
- `sequelize.module.ts` global que expone la instancia al resto de la app.
- `src/common/exceptions/` con la jerarquía `ApplicationException(statusCode)` → `EntityNotFoundException (404)`, `DomainException (400)`, `BusinessRuleException (409)`; `src/common/filters/global-exception.filter.ts` y `src/common/interceptors/` (`logging`, `timeout`, `response`).
- **Envelope de respuesta:** `ResponseInterceptor` envuelve toda respuesta exitosa en `{ statusCode, message, data, timestamp }`; los listados paginados van en `data.items[]` + `data.meta`. Por eso `GET /api/health` pasa a responder `{ …, "data": { "status": "ok" } }` y los AC de ISS-03…ISS-06 hablan de `data.<campo>`.
- **Fail-fast real:** el módulo de Sequelize inyecta el namespace tipado `envConfig.KEY` (no `ConfigService`) para que la validación del `.env` ocurra **antes** de intentar conectar.
- `.env.example` **versionado** y `.env` **local** con el contrato completo.
- Base de datos vacía `norte_creativo` creada **por el desarrollador** antes de Verificación (ya existe del backend_manual; puede reusarse o crear `norte_creativo_ia` para aislar los dos backends).

**REQ (restricciones):**
- `sync({ alter: false })`. Nunca `force: true` ni `alter: true`.
- Contrato `.env`: `DB_DIALECT` + bloques `DB_MYSQL_*` / `DB_POSTGRES_*` / `DB_MSSQL_*` / `DB_ORACLE_*`. **No** `DB_HOST` / `DB_USERNAME` genéricos.
- Fuera de alcance: Clientes, Campanias, Hitos, Tareas, Entregables, Versiones, Aprobaciones, Auth, RBAC. No adelantar ISS-03.
- `.env` no se commitea. `.env.example` sí, sin credenciales reales.
- Puerto 3011. Los motores viven en `../databases_engines/` (Postgres en 5433, no 5432).

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [ ] **AC-1** Dado un `.env` con `DB_DIALECT=mysql`, bloque `DB_MYSQL_*` completo y la BD `norte_creativo` existente; cuando **el desarrollador** ejecuta `npm run start:dev`; entonces el log muestra la conexión a la BD como exitosa y la app queda escuchando en `3011`.
- [ ] **AC-2** Dado una **copia** del `.env` a la que se le quitó una variable crítica del bloque activo (`DB_MYSQL_HOST`, `DB_MYSQL_USERNAME` o `DB_MYSQL_NAME`); cuando se arranca la app con esa copia; entonces el boot **falla antes de conectar** (sin `ECONNREFUSED`) con un mensaje `Error de configuración: …` que nombra la variable faltante; y al restaurar el `.env` original vuelve a arrancar.
- [ ] **AC-3** Dado el código fuente; cuando se busca `sync(`; entonces la única llamada es `sync({ alter: false })` y no existe `force: true` en ningún archivo.
- [ ] **AC-4** Dado el repositorio; cuando se revisa `git status` y `.env.example`; entonces `.env` **no** aparece para commit y `.env.example` contiene `DB_DIALECT` y los cuatro bloques completos.

**Checklist interno (IA, En curso):**
- [ ] Env tipado y validado (por dialecto activo)
- [ ] `.env.example` multi-motor + `.env` local
- [ ] Factory Sequelize multi-dialecto (`mysql2`, `pg`, `tedious`, `oracledb`)
- [ ] Módulo Sequelize global
- [ ] `GlobalExceptionFilter` + interceptores registrados en `main.ts`
- [ ] Sin features de negocio ni Auth

---

## 2. Revisión de AC — autoriza **En curso**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           | OBJ, SPEC, REQ, AC | este archivo   |          | pendiente |

---

## 3. IA usada — se diligencia en **En curso**

**Herramienta / modelo:** Claude Code
**Fecha:** (pendiente)
**Prompt enviado** (copiado **tal cual** del Guion):

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
La base de datos se llama norte_creativo. Instala los drivers: mysql2, pg, tedious, oracledb.

Prohibido: force: true, alter: true, modelos de negocio (Cliente, Campania, Hito, Tarea, Entregable, VersionEntregable,
Aprobacion), Auth, Users, JWT Token, RBAC. NO adelantes ISS-03.
NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

**Ajustes o correcciones que hiciste a lo generado:** (pendiente)

---

## 4. EVI — se diligencia en **Verificación**

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | log de arranque con conexión OK | AC-1 | (pegar líneas del log) | `npm run start:dev` |
|       | log de fallo explícito | AC-2 | (pegar el mensaje de error) | copia del `.env` sin `DB_MYSQL_HOST` |
|       | búsqueda en código | AC-3 | `sequelize.factory.ts:<línea>` | `rg -n "sync\(|force" src` |
|       | estado de git | AC-4 | (salida) | `git status --short` y `cat .env.example` |

**Commit (hash):** pendiente — `feat(iss-02): entorno Sequelize y common` · `Refs #__`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: abrir el factory y pedir «muéstrame dónde se elige el dialecto y dónde está `alter: false`»; «¿qué pasa si `DB_DIALECT=postgres` y falta `DB_POSTGRES_HOST`?».

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

---

## 6. Gate — decide **Hecho**

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
