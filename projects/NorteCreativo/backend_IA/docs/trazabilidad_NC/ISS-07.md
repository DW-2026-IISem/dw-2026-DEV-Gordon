> **Workspace:** `backend_IA` (Norte Creativo) · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-07 — Feature aprobaciones (CerrarHito transaccional) + integración final

**Naturaleza:** práctico (desarrollo de software backend)
**Issue GitHub:** `#__`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:**
**Dependencias:** ISS-06 en **Hecho**
**Commit esperado:** `feat(iss-07): feature aprobaciones (CerrarHito) + integracion final` con `Refs #__`

> El estado del issue **vive en el tablero Kanban**, no en este archivo.
> **Issue clave del proyecto.** Aquí vive la capacidad integrada CerrarHito (sección 6 del SDD) — la operación transaccional que cierra un hito automáticamente cuando entra la última aprobación. Verificar con calma.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, registrar una aprobación podrá cerrar el hito automáticamente y de forma atómica cuando todos los entregables del hito tengan su última versión APROBADA, y el backend expondrá Swagger en `/api/docs` con todas las features integradas.

**SPEC (qué debe quedar):**
- Feature `src/features/business/aprobaciones/` con las cuatro capas.
- **Dominio:** entidad `Aprobacion` pura (`id`, `versionEntregableId`, `estado` [PENDIENTE|APROBADA|RECHAZADA], `aprobadorId`, `comentario?`, `fecha`); servicio de dominio `CierreHitoEvaluator` con `debeCerrarHito(entregables)` (RN-01 + RN-02: cierra sii TODOS los entregables tienen su última versión APROBADA); interfaz `IAprobacionRepository` con `registrarYEvaluarCierre` (operación transaccional) y `RegistrarAprobacionResultado`; excepciones `VersionNoEncontradaException`, `HitoCerradoNoAdmiteAprobacionException` (RN-06).
- **Aplicación:** `CreateAprobacionDto` (`versionEntregableId`, `estado` [APROBADA|RECHAZADA], `aprobadorId` requeridos; `comentario` opcional), mapper (expone `hitoCerrado`, `hitoId`, `fechaCierre`), use-cases `RegistrarAprobacion`, `GetAprobacionById`.
- **Infraestructura:** `AprobacionModel` (tabla `aprobaciones`, FK a `version_entregables`) en `ALL_MODELS`; `AprobacionRepository` con el método transaccional `registrarYEvaluarCierre` que:
  1. sube Version → Entregable → Tarea → Hito (bloqueando el hito con `LOCK.UPDATE`);
  2. si el hito no está ABIERTO → 409 (RN-06);
  3. registra la aprobación y refleja el estado en la versión;
  4. si es RECHAZADA → el hito sigue ABIERTO (RN-01);
  5. si es APROBADA → evalúa con `CierreHitoEvaluator`; si todos aprobados → cierra el hito (estado CERRADO + fechaCierre);
  6. todo dentro de una `sequelize.transaction` (atómico).
- **Presentación:** `AprobacionesController` con `POST /api/aprobaciones`, `GET /api/aprobaciones/:id`.
- `AprobacionesModule` (importa Version, Entregables, Tareas, Hitos) en `BusinessModule`.
- **Integración final:** `SeedersRunner` (OnApplicationBootstrap) que siembra en orden clientes → campanias → hitos → tareas → entregables → version-entregables; `SwaggerModule` en `main.ts` sirviendo `/api/docs`.

**REQ (restricciones):**
- La operación de cierre es **atómica**: si algo falla, no queda nada a medias.
- La regla de cierre (RN-02) vive en `CierreHitoEvaluator` (dominio), no en el repositorio.
- Sin JWT real (RN-05 simplificada: se registra `aprobadorId` pero no se valida su rol contra RBAC todavía; eso queda para fase siguiente).

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [ ] **AC-1** Dado un hito con un único entregable cuya última versión está EN_REVISION; cuando `POST /api/aprobaciones` con `estado: APROBADA` sobre esa versión; entonces responde `201` con `data.hitoCerrado: true`, `data.hitoId` y `data.fechaCierre`, y el hito queda `CERRADO` en BD.
- [ ] **AC-2** Dado un hito con dos entregables, uno aprobado y otro aún EN_REVISION; cuando se aprueba solo uno; entonces responde `201` con `data.hitoCerrado: false` y el hito sigue `ABIERTO`.
- [ ] **AC-3** Dado una versión; cuando `POST /api/aprobaciones` con `estado: RECHAZADA`; entonces responde `201`, `data.hitoCerrado: false`, y el hito sigue `ABIERTO` (RN-01).
- [ ] **AC-4** Dado un hito ya `CERRADO`; cuando `POST /api/aprobaciones` sobre una versión de ese hito; entonces responde `409` (RN-06) y el hito no cambia.
- [ ] **AC-5** Dado un `versionEntregableId` inexistente; cuando `POST /api/aprobaciones`; entonces responde `404`.
- [ ] **AC-6** Dado la app arrancada; cuando se abre `GET http://localhost:3011/api/docs`; entonces Swagger carga y lista las 7 features.
- [ ] **AC-7** Dado `domain/entities/aprobacion.entity.ts` y `domain/services/cierre-hito-evaluator.ts`; cuando se inspeccionan; entonces son TypeScript puro (sin Sequelize/NestJS).

**Checklist interno (IA, En curso):**
- [ ] domain (entidad, `CierreHitoEvaluator`, interface con resultado, excepciones)
- [ ] application (DTO, mapper con hitoCerrado, use-cases)
- [ ] infrastructure (model, repo transaccional con LOCK) + `ALL_MODELS`
- [ ] presentation (controller)
- [ ] `AprobacionesModule` en `BusinessModule`
- [ ] `SeedersRunner` en orden de dependencia
- [ ] `SwaggerModule` en `main.ts` → `/api/docs`

---

## 2. Revisión de AC — autoriza **En curso**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           | OBJ, SPEC, REQ, AC | este archivo   |          | pendiente |

---

## 3. IA usada — se diligencia en **En curso**

**Herramienta / modelo:** Claude Code
**Fecha:** (pendiente)
**Prompt enviado:**

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-07, no del backend entero.

Implementa los AC de docs/trazabilidad/ISS-07.md. Aprobaciones + cierre de hito es UN solo agregado transaccional,
mas la integracion final del backend.

Dominio: entidad PURA Aprobacion (id, versionEntregableId, estado [PENDIENTE|APROBADA|RECHAZADA], aprobadorId,
comentario?, fecha); servicio de dominio CierreHitoEvaluator con debeCerrarHito(entregables: {entregableId, ultimaVersionEstado}[])
que devuelve true SOLO si TODOS los entregables tienen ultimaVersionEstado === 'APROBADA' (si la lista esta vacia,
devuelve false). IAprobacionRepository con registrarYEvaluarCierre(aprobacion) -> RegistrarAprobacionResultado
{ aprobacion, hitoCerrado, hitoId, fechaCierre }. Excepciones VersionNoEncontradaException (404),
HitoCerradoNoAdmiteAprobacionException (409).

Aplicacion: CreateAprobacionDto (versionEntregableId, estado [APROBADA|RECHAZADA], aprobadorId requeridos; comentario
opcional). Use-case RegistrarAprobacion delega TODO el flujo transaccional al repositorio. GetAprobacionById.

Infraestructura: AprobacionModel (tabla aprobaciones, FK a version_entregables) en ALL_MODELS. AprobacionRepository
implementa registrarYEvaluarCierre dentro de UNA SOLA transaccion Sequelize (sequelize.transaction(async t => ...)):
1) sube Version -> Entregable -> Tarea -> Hito, bloqueando el Hito con lock: t.LOCK.UPDATE;
2) si el hito no esta ABIERTO -> lanza HitoCerradoNoAdmiteAprobacionException (409);
3) crea la Aprobacion y actualiza el estado en la Version;
4) si estado === RECHAZADA -> retorna { hitoCerrado: false } sin tocar el hito (la aprobacion SI queda persistida);
5) si estado === APROBADA -> recorre TODAS las tareas del hito y sus entregables, obtiene la ultima version de
cada uno, usa CierreHitoEvaluator.debeCerrarHito(...); si es true, actualiza el hito a estado=CERRADO,
fechaCierre=ahora, y retorna { hitoCerrado: true, hitoId, fechaCierre }; si es false, retorna { hitoCerrado: false }.
Cualquier error -> rollback total.

Presentacion: POST /api/aprobaciones (201, la respuesta incluye hitoCerrado/hitoId/fechaCierre), GET /api/aprobaciones/:id.
Errores: 400 DTO invalido; 404 version inexistente; 409 hito ya cerrado.
AprobacionesModule importa VersionEntregablesModule, EntregablesModule, TareasModule, HitosModule; se registra en BusinessModule.

Integracion final: orquestador de seeders en src/infrastructure/database/seeders que ejecute en orden
clientes -> campanias -> hitos -> tareas -> entregables -> version-entregables, idempotente en conjunto
(arrancar dos veces deja los mismos conteos). Aprobaciones NO se siembra.
Swagger activo en /api/docs con las 7 features.
README.md: descripcion, requisitos, creacion de la BD, configuracion de .env, arranque, endpoints, Swagger,
y el libreto de la demo (cliente -> campania -> hito -> tarea -> entregable -> version 1 -> aprobar RECHAZADA
(hito sigue abierto) -> version 2 -> aprobar APROBADA (hito se cierra) -> intentar aprobar de nuevo sobre ese
hito -> 409).
Verifica y reporta que NO existe src/features/auth ni src/config/jwt y que package.json no tiene @nestjs/jwt,
passport, passport-jwt ni bcrypt.

Prohibido: Auth nuevo, demo de login, RBAC real, force: true.
NO toques docs/.

Al final entrega tres listas: archivos tocados; como verifico cada AC (incluye el caso de cierre automatico y
el de rechazo); que quedo fuera de alcance.
```

**Ajustes o correcciones que hiciste a lo generado:** (pendiente)

---

## 4. EVI — se diligencia en **Verificación**

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | HTTP 201 hitoCerrado:true | AC-1 | (respuesta) | crear cadena completa (cliente→...→version), luego `curl` POST /api/aprobaciones estado APROBADA |
|       | HTTP 201 hitoCerrado:false | AC-2 | (respuesta) | hito con 2 entregables, aprobar solo 1 |
|       | HTTP 201 rechazo | AC-3 | (respuesta) | `curl` POST estado RECHAZADA |
|       | HTTP 409 hito cerrado | AC-4 | (respuesta) | aprobar sobre hito ya cerrado |
|       | HTTP 404 | AC-5 | (respuesta) | `curl` con versionEntregableId inexistente |
|       | Swagger carga | AC-6 | (captura de /api/docs) | abrir navegador en localhost:3011/api/docs |
|       | archivos fuente | AC-7 | `.../aprobacion.entity.ts`, `.../cierre-hito-evaluator.ts` | `rg -n "sequelize|@nestjs|extends Model" <rutas>` |

**Commit (hash):** pendiente — `feat(iss-07): feature aprobaciones (CerrarHito) + integracion final` · `Refs #__`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Revisión **estricta** (es la pieza central): el desarrollador debe explicar el flujo completo de `registrarYEvaluarCierre`, por qué se bloquea el hito con `LOCK.UPDATE`, por qué la regla RN-02 vive en `CierreHitoEvaluator` y no en el repositorio, y qué garantiza la atomicidad. Si no puede explicarlo → **devolución**.

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

---

## 6. Gate — decide **Hecho**

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
