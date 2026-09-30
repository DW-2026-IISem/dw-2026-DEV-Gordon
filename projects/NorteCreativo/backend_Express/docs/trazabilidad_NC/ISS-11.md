> **Workspace:** `backend_express` (Norte Creativo) · **Pista:** Business Express + TypeScript (11 issues) · **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-11 — Feature aprobacion — cierre automático de hito (CerrarHito transaccional)

**Naturaleza:** práctico
**Issue GitHub:** `#10`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-10 en **Hecho**
**Commit esperado:** `feat(iss-10): feature aprobacion CerrarHito Refs #10`

---

## 1. SDD

**OBJ:** Al finalizar, registrar una aprobación podrá cerrar el hito automáticamente y de forma atómica cuando todos sus entregables tengan su última versión APROBADA, igual que la capacidad integrada del backend IA.

**SPEC (qué debe quedar):**
- Feature `src/features/business/aprobacion/` (API `/api/aprobaciones`).
- **Modelo** `Aprobacion` (tabla `aprobaciones`): `version_entregable_id` (FK), `estado` (ENUM `PENDIENTE|APROBADA|RECHAZADA`), `aprobador_id` (INTEGER, sin FK: no hay tabla de usuarios aún), `comentario?`, `fecha` (default ahora), `status`.
- **Evaluador puro** `cierre-hito.evaluator.ts` con `debeCerrarHito(entregables)`: `true` solo si **todos** tienen su última versión `APROBADA`; lista vacía → `false` (RN-01 + RN-02).
- **Controller** `create` con **una sola transacción** (`sequelize.transaction`):
  1. Versión → Entregable → Tarea → Hito, bloqueando el hito con `lock: t.LOCK.UPDATE`.
  2. Hito no `ABIERTO` → `409` (RN-06).
  3. Crea la aprobación y copia el veredicto a `version_entregables.estado`.
  4. `RECHAZADA` → responde `hito_cerrado: false` (el hito sigue abierto, RN-01).
  5. `APROBADA` → recorre tareas y entregables del hito, toma la última versión de cada uno (`numero_version` DESC) y evalúa; si cierra → hito `CERRADO` + `fecha_cierre`.
  6. Error en cualquier paso → rollback total.
- Respuesta `201 { aprobacion, hito_cerrado, hito_id, fecha_cierre }`.
- Solo `POST`, `GET` y `GET /:id`: la aprobación es un registro de auditoría, **no se edita ni se borra** (misma decisión que NestJS).
- **Ajuste al feature hito**: `create`, `updatePut` y `updatePatch` de hito responden `400` si el body trae `estado` o `fecha_cierre`. Nadie cierra un hito a mano; solo lo cierra la aprobación (Decisión #2 del proceso).
- Sin seeder de aprobaciones (se prueban en vivo). Swagger registrado.

**REQ (restricciones):**
- Operación atómica: nada queda a medias.
- La regla de cierre vive en el evaluador, no mezclada con SQL.
- RN-05 simplificada: se registra `aprobador_id` sin validar rol (RBAC fuera de alcance).

**AC:**
- [ ] **AC-1** Dado un hito con un único entregable y su versión `EN_REVISION`; cuando `POST /api/aprobaciones` `APROBADA`; entonces `201` con `hito_cerrado: true`, `hito_id` y `fecha_cierre`, y el hito queda `CERRADO` en BD.
- [ ] **AC-2** Dado un hito con dos entregables; cuando se aprueba la versión de solo uno; entonces `201` con `hito_cerrado: false` y el hito sigue `ABIERTO`.
- [ ] **AC-3** Dado una versión; cuando se registra `RECHAZADA`; entonces `201`, `hito_cerrado: false`, la versión queda `RECHAZADA` y el hito sigue `ABIERTO`.
- [ ] **AC-4** Dado un hito `CERRADO`; cuando se registra una aprobación sobre una de sus versiones; entonces `409` y nada cambia.
- [ ] **AC-5** Dado un `version_entregable_id` inexistente; cuando `POST`; entonces `404`. Con `estado` distinto de `APROBADA|RECHAZADA` → `400`.
- [ ] **AC-6** Dado un hito; cuando `PATCH /api/hitos/:id` con `"estado":"CERRADO"`; entonces `400` (el estado solo lo cambia una aprobación).
- [ ] **AC-7** Dado `cierre-hito.evaluator.ts`; cuando se inspecciona; entonces no importa Sequelize ni Express (función pura).

**Checklist interno (IA, En curso):**
- [ ] Modelo Aprobacion
- [ ] Evaluador puro
- [ ] Transacción con LOCK.UPDATE
- [ ] RN-01, RN-02, RN-06
- [ ] Respuesta con hito_cerrado
- [ ] Solo POST/GET (sin update/delete)
- [ ] Ajuste hito: estado no editable por HTTP
- [ ] Swagger

---

## 2. Revisión de AC

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

---

## 3. IA usada

**Herramienta / modelo:** Claude Code - sonet 5.5

**Fecha:** 29/09/2026

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-11, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-11.md. Es la capacidad integrada CerrarHito, con las MISMAS decisiones del
backend NestJS IA (../backend_IA), adaptada a la estructura del manual Express del curso (modelo + controller + rutas, sin repositorio ni capa de dominio; la transaccion va en el controller, como en product-sale.controller.ts del manual, seccion 13.2b).

Feature src/features/business/aprobacion: model, controller, routes, associations, cierre-hito.evaluator.ts, swagger y http/.
Modelo Aprobacion (tabla aprobaciones, timestamps true): version_entregable_id INTEGER requerido FK a version_entregables.id,
estado ENUM(PENDIENTE,APROBADA,RECHAZADA) requerido, aprobador_id INTEGER requerido (SIN FK, no hay tabla de usuarios),
comentario TEXT opcional, fecha DATE default ahora, status ENUM(active,inactive) default active.
Associations: VersionEntregable.hasMany(Aprobacion, as "aprobaciones") y Aprobacion.belongsTo(VersionEntregable, as "version"), importado antes del sync.

cierre-hito.evaluator.ts: funcion PURA debeCerrarHito(entregables: { entregable_id: number; ultima_version_estado: string | null }[]): boolean,
true SOLO si todos tienen ultima_version_estado === 'APROBADA'; si la lista esta vacia devuelve false. No importa sequelize ni express.

AprobacionController.create dentro de UNA sola transaccion: await sequelize.transaction(async (t) => { ... }):
1) Busca la version (404 si no existe), su entregable, su tarea y su hito; el hito con { transaction: t, lock: t.LOCK.UPDATE }.
2) Si el hito no esta ABIERTO -> 409 "El hito ya esta cerrado y no admite nuevas aprobaciones" (RN-06).
3) Crea la aprobacion y actualiza version_entregables.estado con el mismo veredicto, ambas con { transaction: t }.
4) Si estado es RECHAZADA -> responde hito_cerrado false (la aprobacion SI queda guardada).
5) Si es APROBADA -> trae todas las tareas del hito, todos sus entregables y la ultima version de cada uno
   (order numero_version DESC), arma la lista y llama debeCerrarHito. Si es true, actualiza el hito a estado CERRADO y
   fecha_cierre = ahora dentro de la transaccion.
6) Cualquier error -> rollback automatico.
Validacion: estado distinto de APROBADA o RECHAZADA -> 400; faltan version_entregable_id o aprobador_id -> 400.
Respuesta 201: { aprobacion, hito_cerrado, hito_id, fecha_cierre }.
Rutas SIN AUTH: POST /api/aprobaciones, GET /api/aprobaciones, GET /api/aprobaciones/:id. NO hay PUT, PATCH ni DELETE:
la aprobacion es un registro de auditoria inmutable.

AJUSTE OBLIGATORIO al feature hito (src/features/business/hito/hito.controller.ts): create, updatePut y updatePatch deben
responder 400 si el body trae estado o fecha_cierre ("el estado del hito solo lo cambia una aprobacion"). Actualiza tambien
hito.swagger.ts para no documentar esos campos como editables. No cambies nada mas del hito.

Sin seeder de aprobaciones. aprobacionSwagger registrado en src/swagger/index.ts.
Actualiza el README del backend con el libreto de la demo: cliente -> campania -> hito -> tarea -> entregable -> version 1 ->
RECHAZADA (hito sigue ABIERTO) -> version 2 -> APROBADA (hito CERRADO) -> nueva aprobacion sobre ese hito -> 409.

Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS, force, alter. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | cierre automático | AC-1 | (pegar salida o ruta a captura) | crear cadena nueva (hito → tarea → entregable → versión) y `curl -i -X POST localhost:3012/api/aprobaciones -H 'Content-Type: application/json' -d '{"version_entregable_id":ID,"estado":"APROBADA","aprobador_id":1}'` |
|       | hito sigue abierto | AC-2 | (pegar salida o ruta a captura) | hito con 2 entregables, aprobar solo 1 |
|       | rechazo | AC-3 | (pegar salida o ruta a captura) | POST con `"estado":"RECHAZADA"` + `GET /api/hitos/ID` |
|       | HTTP 409 RN-06 | AC-4 | (pegar salida o ruta a captura) | repetir el POST sobre el hito ya cerrado |
|       | HTTP 404 / 400 | AC-5 | (pegar salida o ruta a captura) | POST con `version_entregable_id: 999999` y POST con `"estado":"QUIZAS"` |
|       | HTTP 400 hito | AC-6 | (pegar salida o ruta a captura) | `curl -i -X PATCH localhost:3012/api/hitos/1 -H 'Content-Type: application/json' -d '{"estado":"CERRADO"}'` |
|       | evaluador puro | AC-7 | (pegar salida o ruta a captura) | `grep -n "sequelize\|express" src/features/business/aprobacion/cierre-hito.evaluator.ts` (vacío) |

**Commit (hash):** `feat(iss-10): feature aprobacion CerrarHito Refs #10`
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «Explica paso a paso qué hace la transacción y por qué se bloquea el hito con `LOCK.UPDATE`». «¿Por qué la regla de cierre vive en un evaluador aparte y no dentro del controller?». «¿En qué se diferencia esta implementación de la de NestJS, donde la transacción vivía en el repositorio?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

la transaccion vive en aprobacion.controller.ts, en el create, hace esto en orden, abre una transaccion, busca la
version y sube por la cadena version, entregable, tarea y hito, el hito lo lee con lock update, si el hito no
esta abierto responde 409 (rn-06), si esta abierto crea la aprobacion y copia el veredicto a la version, si fue
rechazada responde hito_cerrado false y ahi termina (rn-01), si fue aprobada trae todas las tareas del hito, todos
sus entregables y la ultima version de cada uno, se las pasa al evaluador, y si el evaluador dice que todas estan
aprobadas actualiza el hito a cerrado con fecha_cierre (rn-02), si todo sale bien hace commit y si algo falla en
cualquier paso hace rollback y no queda nada a medias

el hito se bloquea con lock update porque dos aprobaciones pueden llegar casi al mismo tiempo, por ejemplo las
dos ultimas versiones pendientes de un hito, sin el lock cada transaccion podria leer que falta una version por
aprobar, ninguna cerraria el hito, y quedaria abierto aunque ya esta todo aprobado, con el lock la segunda
transaccion espera a que termine la primera y cuando lee ya ve el estado real

la regla de cierre vive en cierre-hito.evaluator.ts porque es una funcion pura, recibe la lista de entregables con
el estado de su ultima version y devuelve true o false, no importa sequelize ni express, asi la regla se entiende
y se prueba sola, sin base de datos ni http, y el controller solo se encarga de armar los datos y guardar el
resultado, si la regla estuviera mezclada con los queries habria que levantar todo para probar un caso como el de
la lista vacia

la diferencia con nestjs es donde vive cada cosa, alla la transaccion estaba en el repositorio
(infrastructure) y la regla en un servicio de dominio, el use case solo delegaba, aca el controller hace todo, abre
la transaccion, consulta los modelos de sequelize directo y llama al evaluador, es lo mismo que hace el manual del
docente en product-sale.controller.ts, la contra es que el controller queda mezclando http, transaccion y queries,
y ya no se puede cambiar de orm sin tocarlo, lo unico que quedo separado es el evaluador
---

## 6. Gate

**Estado:** completado
**Trazabilidad final:** completado
