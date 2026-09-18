> **Workspace:** `backend_IA` (Norte Creativo) · **Pista:** solo Business (7 issues) · **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-06 — Features tareas + entregables + version-entregables CA

**Naturaleza:** práctico (desarrollo de software backend)
**Issue GitHub:** `#__`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-05 en **Hecho**
**Commit esperado:** `feat(iss-06): features tareas, entregables y version-entregables CA` con `Refs #6`

---

## 1. SDD 

**OBJ:** Al finalizar, existirá la cadena completa Tarea → Entregable → VersionEntregable, cada una con su CRUD mínimo y sus FK validadas, para que ISS-07 pueda recorrerla al evaluar el cierre del hito.

**SPEC (qué debe quedar):**

**Feature `tareas/`** (FK a Hito)
- Dominio: `Tarea` pura (`id`, `hitoId`, `nombre`, `descripcion?`, `isActive`); `ITareaRepository` (incluye `findByHitoId`); `TareaNotFoundException`.
- Aplicación: `CreateTareaDto`, mapper, use-cases `CreateTarea` (valida Hito existe → 404), `ListTareas`, `GetTareaById`.
- Infraestructura: `TareaModel` (tabla `tareas`, FK a `hitos`) en `ALL_MODELS`; repo; seeder.
- Presentación: `TareasController` (`GET`, `GET/:id`, `POST /api/tareas`).
- `TareasModule` (importa `HitosModule`).

**Feature `entregables/`** (FK a Tarea)
- Dominio: `Entregable` puro (`id`, `tareaId`, `fechaInicio?`, `fechaFin?`, `total?`, `estado`, `observaciones?`); `IEntregableRepository` (incluye `findByTareaId`); `EntregableNotFoundException`.
- Aplicación: `CreateEntregableDto` (`tareaId` requerido), mapper, use-cases `CreateEntregable` (valida Tarea existe), `ListEntregables`, `GetEntregableById`.
- Infraestructura: `EntregableModel` (tabla `entregables`, FK a `tareas`) en `ALL_MODELS`; repo; seeder.
- Presentación: `EntregablesController` (`GET`, `GET/:id`, `POST /api/entregables`).
- `EntregablesModule` (importa `TareasModule`).

**Feature `version-entregables/`** (FK a Entregable)
- Dominio: `VersionEntregable` pura (`id`, `entregableId`, `numeroVersion`, `fechaInicio?`, `fechaFin?`, `total?`, `estado` [EN_REVISION|APROBADA|RECHAZADA], `observaciones?`); `IVersionEntregableRepository` (incluye `findByEntregableId`, `findUltimaVersion`, `countByEntregableId`); `VersionNotFoundException`, `VersionAprobadaInmutableException` (RN-04).
- Aplicación: `CreateVersionEntregableDto` (`entregableId` requerido; `numeroVersion` se calcula solo = última + 1), mapper, use-cases `CreateVersionEntregable` (valida Entregable existe), `GetVersionById`.
- Infraestructura: `VersionEntregableModel` (tabla `version_entregables`, FK a `entregables`, unique `(entregableId, numeroVersion)`) en `ALL_MODELS`; repo con `findUltimaVersion`; seeder.
- Presentación: `VersionEntregablesController` (`GET/:id`, `POST /api/version-entregables`).
- `VersionEntregablesModule` (importa `EntregablesModule`).

Las tres registradas en `BusinessModule`.

**REQ (restricciones):**
- Entidades de dominio puras. `numeroVersion` automático (no lo envía el cliente).
- Sin JWT/Auth. No adelantar ISS-07 (aprobaciones).

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x ] **AC-1** Dado el seeder corrido; cuando `GET /api/tareas`; entonces responde `200` con ≥ 1 tarea, sin duplicar al reiniciar.
- [x] **AC-2** Dado un `hitoId` existente; cuando `POST /api/tareas`; entonces `201`. Con `hitoId` inexistente → `404`.
- [x] **AC-3** Dado un `tareaId` existente; cuando `POST /api/entregables`; entonces `201`. Con `tareaId` inexistente → `404`.
- [x] **AC-4** Dado un `entregableId` existente; cuando `POST /api/version-entregables` dos veces sobre el mismo entregable; entonces la primera crea `numeroVersion: 1` y la segunda `numeroVersion: 2` (automático).
- [x] **AC-5** Dado cualquier payload sin su FK requerida o con campo no permitido; cuando se hace el POST; entonces responde `400`.
- [x] **AC-6** Dado las tres entidades de dominio; cuando se inspeccionan; entonces son TypeScript puro (sin Sequelize/NestJS/extends Model).

**Checklist interno (IA, En curso):**
- [x] tareas: 4 capas + `ALL_MODELS` + módulo
- [x] entregables: 4 capas + `ALL_MODELS` + módulo
- [x] version-entregables: 4 capas + `numeroVersion` automático + `ALL_MODELS` + módulo
- [x] las tres en `BusinessModule`, respetando el orden de imports

---

## 2. Revisión de AC 

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|17/09 | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo   |          | pendiente |

---

## 3. IA usada 

**Herramienta / modelo:** Claude Code - modelo sonnet 5 high.

**Fecha:** (17/09)

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-06, no del backend entero.

Implementa los AC de docs/trazabilidad/ISS-06.md. Son TRES features en cadena, mismo patron de FK simple ya usado
en campanias/hitos; hazlas en este orden porque cada una depende de la anterior.

1) Feature src/features/business/tareas: entidad Tarea PURA (id, hitoId, nombre, descripcion?, isActive);
ITareaRepository (incluye findByHitoId); TareaNotFoundException. TareaModel (tabla tareas, FK a hitos) en ALL_MODELS.
CreateTareaDto (hitoId y nombre requeridos). Use-case CreateTarea verifica que hitoId exista (-> 404). ListTareas,
GetTareaById. Controller GET /api/tareas, GET /api/tareas/:id, POST /api/tareas. Seeder idempotente sobre un hito
existente. TareasModule importa HitosModule.

2) Feature src/features/business/entregables: entidad Entregable PURA (id, tareaId, fechaInicio?, fechaFin?, total?,
estado default EN_PROCESO, observaciones?); IEntregableRepository (incluye findByTareaId); EntregableNotFoundException.
EntregableModel (tabla entregables, FK a tareas) en ALL_MODELS. CreateEntregableDto (tareaId requerido, observaciones
opcional). Use-case CreateEntregable verifica que tareaId exista (-> 404). ListEntregables, GetEntregableById.
Controller GET /api/entregables, GET /api/entregables/:id, POST /api/entregables. Seeder idempotente sobre una tarea
existente. EntregablesModule importa TareasModule.

3) Feature src/features/business/version-entregables: entidad VersionEntregable PURA (id, entregableId, numeroVersion,
fechaInicio?, fechaFin?, total?, estado [EN_REVISION|APROBADA|RECHAZADA] default EN_REVISION, observaciones?);
IVersionEntregableRepository (incluye findByEntregableId, findUltimaVersion, countByEntregableId); VersionNotFoundException.
VersionEntregableModel (tabla version_entregables, FK a entregables, UNIQUE(entregableId, numeroVersion)) en ALL_MODELS.
CreateVersionEntregableDto (entregableId requerido; observaciones opcional). Use-case CreateVersionEntregable verifica
que entregableId exista (-> 404) y calcula numeroVersion automaticamente como countByEntregableId + 1 (el cliente NUNCA
envia numeroVersion). GetVersionById. Controller GET /api/version-entregables/:id, POST /api/version-entregables.
Seeder idempotente que crea la version 1 de un entregable existente. VersionEntregablesModule importa EntregablesModule.

Las tres modulos se registran en BusinessModule, en orden: TareasModule, EntregablesModule, VersionEntregablesModule.

Prohibido: Auth, Users, JWT Token, guards, RBAC; entidades que extiendan Model; force: true. NO adelantes ISS-07
(aprobaciones/cierre de hito).
NO toques docs/.

Al final entrega tres listas: archivos tocados; como verifico cada AC (de las tres features); que quedo fuera de alcance.
```

**Ajustes o correcciones que hiciste a lo generado:** Completado

---

## 4. EVI 

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|17/09  | log + conteo | AC-1 | Ver proceso.md ISS 6 procedimiento | `npm run start:dev` ×2 |
|17/09  | HTTP 201/404 tareas | AC-2 | Ver proceso.md ISS 6 procedimiento | `curl` POST /api/tareas con hitoId válido e inválido |
|17/09  | HTTP 201/404 entregables | AC-3 | Ver proceso.md ISS 6 procedimiento | `curl` POST /api/entregables |
|17/09  | numeroVersion automático | AC-4 | Ver proceso.md ISS 6 procedimiento | `curl` POST /api/version-entregables ×2 mismo entregable |
|17/09  | HTTP 400 | AC-5 | Ver proceso.md ISS 6 procedimiento | `curl` sin FK requerida |
|17/09  | archivos fuente | AC-6 | 3 rutas `.../domain/entities/*.entity.ts` | `rg -n "sequelize|@nestjs|extends Model" <rutas>` |

**Commit (hash):** completado — `feat(iss-06): features tareas, entregables y version-entregables CA` · `Refs #6`
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿dónde se calcula el `numeroVersion` y por qué no lo manda el cliente?»; «señala en las tres features qué se repite del patrón de ISS-03/04».

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|17/09  |Carlos Z|Revisor|Todos|en proceso.md |          |          |

**Respuesta del autor (ajuste o justificación):**

el numeroversion se calcula en create-version-entregable.use-case.ts, en application, antes de crear la
version llama a iversionentregablerepository.countbyentregableid(entregableid), cuenta cuantas versiones
tiene ya ese entregable, y le suma 1, ese numero es el que se guarda.

no lo manda el cliente porque el createversionentregabledto no tiene el campo numeroversion, si el cliente lo manda igual, whitelist lo rechaza con 400, la razon de fondo es que si el cliente pudiera mandar cualquier numero, podria mandar version 1 dos veces o saltarse numeros, y el conteo de versiones dejaria de ser confiable, calculandolo el propio backend siempre queda consecutivo y sin huecos,

lo que se repite del patron de iss-03/04 en las tres features (tareas, entregables, version-entregables):
cada una tiene sus cuatro capas (domain, application, infrastructure, presentation), la entidad de dominio es ts plano sin sequelize ni nestjs, el use-case de creacion inyecta el repositorio propio mas el
repositorio de la feature padre para validar la fk antes de insertar (tareas valida hitoid contra
ihitorepository, entregables valida tareaid contra itarearepository, version-entregables valida
entregableid contra ientregablerepository), y cada modulo importa el modulo padre e y se registra en
businessmodule en orden de dependencia.

lo unico que cambia entre las tres y clientes/campanias es que estas no tienen una regla de negocio extra
como el rn-08 de hitos, son fk simple sin nada mas, y version-entregables suma el calculo de numeroversion que las otras dos no necesitan.

---

## 6. Gate — decide **Hecho**

**Estado:** aprobado 

**Conclusión:** se cumplieron todos los AC, se pasa al issue #6

**Trazabilidad final:** [enlace al Issue)](https://github.com/DW-2026-IISem/dw-2026-DEV-Gordon/issues/5)
