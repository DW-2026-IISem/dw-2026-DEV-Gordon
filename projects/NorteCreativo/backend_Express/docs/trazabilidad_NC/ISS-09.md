> **Workspace:** `backend_express` (Norte Creativo) · **Pista:** Business Express + TypeScript (11 issues) · **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-09 — Feature entregable — CRUD + relación con tarea

**Naturaleza:** práctico
**Issue GitHub:** `#9`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-08 en **Hecho**
**Commit esperado:** `feat(iss-09):  feature entregable Refs #9`

---

## 1. SDD

**OBJ:** Al finalizar, se podrán gestionar los entregables que produce cada tarea, que son las piezas cuyas versiones se aprueban o rechazan.

**SPEC (qué debe quedar):**
- Feature `src/features/business/entregable/`.
- **Modelo** `Entregable` (tabla `entregables`): `tarea_id` (FK a `tareas.id`), `fecha_inicio?`, `fecha_fin?`, `total?` (DECIMAL), `estado` (ENUM `EN_PROCESO|ENTREGADO`, default `EN_PROCESO`), `observaciones?`, `status` (`active|inactive`).
- **Associations**: `Tarea.hasMany(Entregable)` / `Entregable.belongsTo(Tarea, as "tarea")`.
- **Controller** 7 métodos; `create` y `updatePut` validan que la tarea exista (`404`); `create` fija `fecha_inicio` = ahora si no se envía.
- Rutas SIN AUTH en `/api/entregables`.
- Seeder `seedEntregables(count)` idempotente sobre tareas existentes; runner: … → tareas → **entregables**.
- Swagger registrado.

**REQ (restricciones):**
- Mismo criterio que NestJS: FK simple a tarea, sin regla extra.
- No adelantar VersionEntregable.

**AC:**
- [x] **AC-1** Dado la app; cuando `sync`; entonces existe `entregables` con FK real a `tareas`.
- [x] **AC-2** Dado un `tarea_id` existente; cuando `POST /api/entregables`; entonces `201` con `estado: EN_PROCESO` y `fecha_inicio` asignada.
- [x] **AC-3** Dado un `tarea_id` inexistente; cuando `POST`; entonces `404`.
- [x] **AC-4** Dado un payload sin `tarea_id`; cuando `POST`; entonces `400`.
- [x] **AC-5** Dado un entregable; cuando `GET /api/entregables/:id`; entonces incluye su tarea.
- [x]x**AC-6** Dado la tabla vacía; cuando `npm run db:seed` ×2; entonces se crean entregables sin duplicar.

**Checklist interno (IA, En curso):**
- [x] Modelo con FK a tareas
- [x] associations
- [x] Controller + validación de tarea
- [x] Rutas + .http
- [x] Seeder + runner
- [x] Swagger

---

## 2. Revisión de AC

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

---

## 3. IA usada

**Herramienta / modelo:** Claude Code - modelo (completar)

**Fecha:** (pendiente)

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-09, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-09.md siguiendo docs/manual.md secciones 11 y 12 (CRUD completo + relacion
con archivo associations), con el MISMO estilo de los features cliente, campania e hito ya hechos en este proyecto.

Feature src/features/business/entregable: model, controller, routes, associations, seeder, swagger y carpeta http/.
Modelo Entregable (tabla entregables, timestamps true): tarea_id INTEGER requerido FK a tareas.id, fecha_inicio DATE opcional, fecha_fin DATE opcional, total DECIMAL(12,2) opcional, estado ENUM(EN_PROCESO,ENTREGADO) default EN_PROCESO, observaciones TEXT opcional, status ENUM(active,inactive) default active. Convierte total a Number al responder (DECIMAL puede llegar como string).
entregable.associations.ts: Tarea.hasMany(Entregable, foreignKey tarea_id, as "entregables") y Entregable.belongsTo(Tarea, foreignKey tarea_id, as "tarea"), importado antes del sync.
Controller EntregableController con los 7 metodos (getAll solo status active, getOne con include del padre, create, updatePut,
updatePatch, deletePhysical, deleteLogical). En create y updatePut: si la tarea no existe -> 404. En create, si no llega fecha_inicio, asigna la fecha actual.
Errores: validacion -> 400, no encontrado -> 404, regla de negocio -> 409.
Rutas SIN AUTH en /api/entregables (incluido PATCH /api/entregables/:id/deactivate) registradas en src/routes/index.ts.
http/ con los .http de get, create, update y delete, leyenda SIN AUTH, puerto 3012.
Seeder seedEntregables(count) idempotente sobre tareas existentes; agregalo al SeedersRunner DESPUES de tareas, con SEED_ENTREGABLES y --entregables=N.

Swagger del feature registrado en src/swagger/index.ts.

NO adelantes ISS-10 (version-entregable). Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS, force, alter. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | FK real | AC-1 | (pegar salida o ruta a captura) | `docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SHOW CREATE TABLE entregables\G"` |
|       | HTTP 201 | AC-2 | (pegar salida o ruta a captura) | `curl -i -X POST localhost:3012/api/entregables -H 'Content-Type: application/json' -d '{"tarea_id":1,"observaciones":"Primer borrador"}'` |
|       | HTTP 404 | AC-3 | (pegar salida o ruta a captura) | POST con `tarea_id: 999999` |
|       | HTTP 400 | AC-4 | (pegar salida o ruta a captura) | POST con `{}` |
|       | include tarea | AC-5 | (pegar salida o ruta a captura) | `curl localhost:3012/api/entregables/1` |
|       | seed idempotente | AC-6 | (pegar salida o ruta a captura) | `npm run db:seed` ×2 + COUNT |

**Commit (hash):** completado — `feat(iss-09):  feature entregable Refs #9`
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué `total` se convierte a Number antes de responder?». «¿Qué diferencia hay entre el `estado` del entregable y el `status`?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

total se convierte a number porque en mysql la columna es decimal(12,2) y sequelize entrega los decimal
como string para no perder precision, entonces si lo devolviera tal cual, el json traeria "1500.00" con
comillas en vez de 1500, y quien consuma la api tendria que hacer la conversion, convertirlo antes de
responder deja el json con el tipo correcto, un numero, y se puede sumar o comparar sin sorpresas

el estado del entregable es el estado de negocio, dice en que punto esta el trabajo, en_proceso o
entregado, cambia durante la vida del entregable, mientras que status es solo el borrado logico, active
o inactive, dice si el registro sigue visible o se dio de baja, un entregable puede estar entregado y
active a la vez, o en_proceso e inactive si lo dieron de baja a medias, son dos cosas independientes, y
por eso getall filtra por status y no por estado
---

## 6. Gate

**Estado:** completado
**Trazabilidad final:** completado
