> **Workspace:** `backend_express` (Norte Creativo) · **Pista:** Business Express + TypeScript (11 issues) · **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-08 — Feature tarea — CRUD + relación con hito

**Naturaleza:** práctico
**Issue GitHub:** `#8`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-07 en **Hecho**
**Commit esperado:** `feat(iss-08): feature tarea Refs #8`

---

## 1. SDD

**OBJ:** Al finalizar, se podrán gestionar las tareas de un hito existente, primer eslabón de la cadena que el cierre automático recorre.

**SPEC (qué debe quedar):**
- Feature `src/features/business/tarea/` (model, controller, routes, associations, seeder, swagger, `http/`).
- **Modelo** `Tarea` (tabla `tareas`): `hito_id` (FK a `hitos.id`, requerido), `nombre` (requerido), `descripcion?`, `status` (`active|inactive`, default `active`).
- **Associations**: `Hito.hasMany(Tarea)` / `Tarea.belongsTo(Hito, as "hito")` por `hito_id`.
- **Controller** 7 métodos; `create` y `updatePut` validan que el hito exista (`404`).
- Rutas SIN AUTH en `/api/tareas`; `getOne` incluye el hito.
- Seeder `seedTareas(count)` idempotente sobre hitos existentes; runner: … → hitos → **tareas**; `SEED_TAREAS` / `--tareas=N`.
- Swagger registrado.

**REQ (restricciones):**
- Misma decisión que en NestJS: tarea es FK simple, solo valida existencia del padre, sin regla extra.
- No adelantar Entregable.

**AC:**
- [ ] **AC-1** Dado la app; cuando `sync`; entonces existe `tareas` con FK real a `hitos`.
- [ ] **AC-2** Dado un `hito_id` existente; cuando `POST /api/tareas`; entonces `201`.
- [ ] **AC-3** Dado un `hito_id` inexistente; cuando `POST /api/tareas`; entonces `404` y no crea fila.
- [ ] **AC-4** Dado un payload sin `nombre` o sin `hito_id`; cuando `POST /api/tareas`; entonces `400`.
- [ ] **AC-5** Dado una tarea; cuando `PATCH` y luego `PATCH /:id/deactivate`; entonces `200` y deja de aparecer en `GET /api/tareas`.
- [ ] **AC-6** Dado la tabla vacía; cuando `npm run db:seed` ×2; entonces se crean tareas sin duplicar.

**Checklist interno (IA, En curso):**
- [ ] Modelo con FK a hitos
- [ ] associations
- [ ] Controller 7 métodos + validación de hito
- [ ] Rutas + .http
- [ ] Seeder + runner
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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-08, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-08.md siguiendo docs/manual.md secciones 11 y 12 (CRUD completo + relacion
con archivo associations), con el MISMO estilo de los features cliente, campania e hito ya hechos en este proyecto.

Feature src/features/business/tarea: model, controller, routes, associations, seeder, swagger y carpeta http/.
Modelo Tarea (tabla tareas, timestamps true): hito_id INTEGER requerido FK a hitos.id, nombre STRING requerido, descripcion TEXT opcional, status ENUM(active,inactive) default active.
tarea.associations.ts: Hito.hasMany(Tarea, foreignKey hito_id, as "tareas") y Tarea.belongsTo(Hito, foreignKey hito_id, as "hito"), importado en src/config/index.ts antes del sync.
Controller TareaController con los 7 metodos (getAll solo status active, getOne con include del padre, create, updatePut,
updatePatch, deletePhysical, deleteLogical). En create y updatePut: si el hito no existe -> 404.
Errores: validacion -> 400, no encontrado -> 404, regla de negocio -> 409.
Rutas SIN AUTH en /api/tareas (incluido PATCH /api/tareas/:id/deactivate) registradas en src/routes/index.ts.
http/ con los .http de get, create, update y delete, leyenda SIN AUTH, puerto 3012.
Seeder seedTareas(count) idempotente sobre hitos existentes; agregalo al SeedersRunner DESPUES de hitos, con SEED_TAREAS y --tareas=N en counts.ts.

Swagger del feature registrado en src/swagger/index.ts.

NO adelantes ISS-09 (entregable). Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS, force, alter. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | FK real | AC-1 | (pegar salida o ruta a captura) | `docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SHOW CREATE TABLE tareas\G"` |
|       | HTTP 201 | AC-2 | (pegar salida o ruta a captura) | `curl -i -X POST localhost:3012/api/tareas -H 'Content-Type: application/json' -d '{"hito_id":1,"nombre":"Diseñar post"}'` |
|       | HTTP 404 | AC-3 | (pegar salida o ruta a captura) | mismo POST con `hito_id: 999999` |
|       | HTTP 400 | AC-4 | (pegar salida o ruta a captura) | POST con `{"hito_id":1}` |
|       | PATCH + deactivate | AC-5 | (pegar salida o ruta a captura) | `curl -i -X PATCH localhost:3012/api/tareas/1/deactivate` |
|       | seed idempotente | AC-6 | (pegar salida o ruta a captura) | `npm run db:seed` ×2 + `docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT COUNT(*) FROM tareas"` |

**Commit (hash):** completado — `feat(iss-08): feature tarea Refs #8`
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Qué se repite de campania/hito en este feature y qué no?». «¿Por qué tarea solo valida que el hito exista y no su estado?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**
lo que se repite de campania y hito es casi todo el esqueleto, los mismos seis archivos (model, controller,
routes, associations, seeder y swagger) mas la carpeta http, los mismos siete metodos del controller,
getall que solo trae los active, getone que incluye al padre, borrado logico con deactivate, y sobre todo
el patron de validar que el padre exista con findByPk antes del insert para dar un 404 claro y no un 500
de constraint, el seeder tambien se repite, idempotente y trabajando sobre los registros del padre que ya
existen, y el runner los ejecuta en orden de dependencia

lo que no se repite es la regla extra, campania valida que el cliente este activo y hito valida que la
campania este activa (rn-08), ademas hito tiene estado y fecha_cierre con sus invariantes, tarea no tiene
nada de eso, es una fk simple

tarea solo valida que el hito exista y no su estado porque en el sdd ninguna regla dice que no se puedan
crear tareas en un hito cerrado, la rn-06 habla de versiones y aprobaciones de un hito cerrado, no de
tareas, y meter una regla que el sdd no pide seria inventar negocio, es la misma decision que tome en
nestjs, tarea es fk simple sin regla extra, si el negocio pidiera un dia bloquear tareas nuevas en hitos
cerrados seria agregar una sola validacion en create y updateput, igual a la que ya tiene campania
---

## 6. Gate

**Estado:** completado
**Trazabilidad final:** completado
