> **Workspace:** `backend_express` (Norte Creativo) · **Pista:** Business Express + TypeScript (7 issues) · **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-07 — Feature hito — CRUD + relación con campania + reglas de estado

**Naturaleza:** práctico
**Issue GitHub:** `#7`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-06 en **Hecho**
**Commit esperado:** `feat(iss-07): feature hito Refs #7`

---

## 1. SDD

**OBJ:** Al finalizar, se podrán gestionar hitos de una campaña con su estado de negocio, aplicando RN-08 (no hay hitos en campañas inactivas) y las invariantes de estado del SDD.

**SPEC (qué debe quedar):**
- Feature `src/features/business/hito/` con el mismo set de archivos que campania.
- **Modelo** `Hito` (tabla `hitos`, `timestamps: true`): `campania_id` (FK a `campanias.id`), `nombre` (requerido), `descripcion?`, `estado` (ENUM `ABIERTO|CERRADO|FACTURADO`, default `ABIERTO`), `fecha_cierre?`, `status` (`active|inactive`, default `active`).
- **Associations**: `Campania.hasMany(Hito)` / `Hito.belongsTo(Campania)` por `campania_id`, importadas antes del `sync`.
- **Controller** (7 métodos): en `create` y `updatePut` valida campaña existente (`404`) y **activa** (`409`, RN-08).
- **Invariantes de estado**: `create` ignora `estado` y `fecha_cierre` enviados (el hito siempre nace `ABIERTO`, `fecha_cierre` null); en `updatePatch`, un `estado` fuera del ENUM → `400`; pasar a `CERRADO` fija `fecha_cierre`; un hito `CERRADO` no vuelve a `ABIERTO` (`409`, RN-06).
- Rutas SIN AUTH en `/api/hitos`; `getOne` incluye la campaña.
- Seeder `seedHitos(count)` idempotente sobre campañas activas, estado `ABIERTO`; runner clientes → campanias → hitos; `SEED_HITOS` / `--hitos=N`.
- `hitoSwagger` registrado.

**REQ (restricciones):**
- El cierre automático por aprobación (CerrarHito) **no** entra aquí: requiere tareas, entregables y aprobaciones (fuera del alcance de la Semana 07).
- Sin auth.

**AC:**
- [ ] **AC-1** Dado la app arrancada; cuando `sync`; entonces existe `hitos` con FK real a `campanias`.
- [ ] **AC-2** Dado una campaña activa; cuando `POST /api/hitos` (aunque se envíe `"estado":"CERRADO"`); entonces `201` con `estado: ABIERTO` y `fecha_cierre: null`.
- [ ] **AC-3** Dado una campaña `inactive`; cuando `POST /api/hitos` con su id; entonces `409` (RN-08) y no se crea fila.
- [ ] **AC-4** Dado un `campania_id` inexistente; cuando `POST /api/hitos`; entonces `404`.
- [ ] **AC-5** Dado un hito; cuando `PATCH` con `"estado":"PERDIDO"`; entonces `400`.
- [ ] **AC-6** Dado un hito `ABIERTO`; cuando `PATCH` a `CERRADO`; entonces `200` con `fecha_cierre` asignada; y un `PATCH` posterior a `ABIERTO` responde `409`.
- [ ] **AC-7** Dado la tabla vacía; cuando `npm run db:seed`; entonces se crean hitos `ABIERTO` sobre campañas activas, en orden clientes → campanias → hitos, sin duplicar al repetir.

**Checklist interno (IA, En curso):**
- [ ] Modelo con FK, estado y fecha_cierre
- [ ] associations
- [ ] RN-08 en create/updatePut
- [ ] Invariantes de estado (nace ABIERTO, ENUM, cierre fija fecha, no reabre)
- [ ] Rutas SIN AUTH + .http
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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-07, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-07.md siguiendo docs/manual.md seccion 12 (ISS-07, feature Product con relacion),
adaptado a la entidad Hito de Norte Creativo. Mismo estilo de los features cliente y campania ya hechos.

Feature src/features/business/hito: model, controller, routes, associations, seeder, swagger y carpeta http/.
Modelo Hito (tabla hitos, timestamps true): campania_id INTEGER requerido FK a campanias.id, nombre STRING requerido,
descripcion TEXT opcional, estado ENUM(ABIERTO,CERRADO,FACTURADO) default ABIERTO, fecha_cierre DATE opcional,
status ENUM(active,inactive) default active.
hito.associations.ts: Campania.hasMany(Hito, foreignKey campania_id) y Hito.belongsTo(Campania, foreignKey campania_id, as "campania"),
importado en src/config/index.ts antes del sync.
Controller HitoController con los 7 metodos. En create y updatePut: campania inexistente -> 404; campania inactive -> 409 (RN-08).
Invariantes: create IGNORA estado y fecha_cierre del body (siempre nace ABIERTO y fecha_cierre null);
en updatePatch un estado fuera del ENUM -> 400; pasar a CERRADO asigna fecha_cierre = ahora;
un hito CERRADO no puede volver a ABIERTO -> 409 (RN-06). getOne incluye la campania.
Rutas SIN AUTH en /api/hitos (incluido PATCH /api/hitos/:id/deactivate) en src/routes/index.ts.
http/ con los .http de get, create, update y delete, leyenda SIN AUTH, puerto 3012.
Seeder seedHitos(count) idempotente sobre campanias activas, estado ABIERTO; agregalo al SeedersRunner despues de campanias,
con SEED_HITOS y --hitos=N. hitoSwagger registrado en src/swagger/index.ts.
Al final verifica y reporta que el orden de seeders es clientes -> campanias -> hitos.

Prohibido: tareas, entregables, aprobaciones, cierre automatico de hito, force, alter. Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | FK real | AC-1 | (pegar salida o ruta a captura) | `SHOW CREATE TABLE hitos\G` |
|       | HTTP 201 nace ABIERTO | AC-2 | (pegar salida o ruta a captura) | `curl -i -X POST localhost:3012/api/hitos -H 'Content-Type: application/json' -d '{"campania_id":1,"nombre":"Redes","estado":"CERRADO"}'` |
|       | HTTP 409 RN-08 | AC-3 | (pegar salida o ruta a captura) | desactivar campaña (`PATCH /api/campanias/:id/deactivate`) y crear hito |
|       | HTTP 404 | AC-4 | (pegar salida o ruta a captura) | POST con `campania_id: 999999` |
|       | HTTP 400 estado inválido | AC-5 | (pegar salida o ruta a captura) | `curl -i -X PATCH localhost:3012/api/hitos/1 -H 'Content-Type: application/json' -d '{"estado":"PERDIDO"}'` |
|       | cierre y no reapertura | AC-6 | (pegar salida o ruta a captura) | PATCH `{"estado":"CERRADO"}` y luego `{"estado":"ABIERTO"}` |
|       | seed en orden | AC-7 | (pegar salida o ruta a captura) | `npm run db:seed` ×2 + COUNT de las 3 tablas |

**Commit (hash):** `feat(iss-07): feature hito Refs #7`
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Dónde vive RN-08 y por qué se comprueba en el controller antes del insert?». «¿Por qué `create` ignora el `estado` que manda el cliente?». «¿Qué te obligó a cambiar respecto al Hito de NestJS, donde la regla vivía en el método `cerrar()` del dominio?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

rn-08 vive en hito.controller.ts, en create y en updateput, antes del insert primero busca la campania con
Campania.findByPk(campania_id), si no existe responde 404, y si existe pero esta inactive responde 409,
solo si pasa las dos cosas crea el hito

se comprueba en el controller antes del insert porque la base de datos no conoce la regla, la fk solo
verifica que el id exista en campanias, no que la campania este activa, entonces si no se valida antes
el hito se crearia igual sobre una campania inactiva, y ademas si la campania no existe mysql tiraria un
error de constraint que saldria como un 500 feo, validando antes sale un 404 claro

create ignora el estado que manda el cliente porque un hito siempre tiene que nacer abierto y con
fecha_cierre en null, si el cliente pudiera mandar estado cerrado al crear, podria crear hitos ya
cerrados sin haber pasado por ninguna aprobacion, y eso rompe la regla central del negocio, por eso el
controller arma el objeto con estado abierto fijo y no lee body.estado ni body.fecha_cierre

lo que me obligo a cambiar respecto a nestjs es donde vive la regla, alla el hito era una entidad de
dominio con su metodo cerrar() que validaba que estuviera abierto y ese metodo era la unica forma de
cambiar el estado, aca no hay entidad de dominio, hito es solo un modelo de sequelize, entonces la regla
de que un hito cerrado no vuelve a abrirse la tengo que escribir a mano dentro del controller, en
updatepatch, comparando el estado actual con el nuevo antes de guardar, y esa validacion queda repetida
en updateput, en nestjs quedaba en un solo lugar y no se podia saltar
---

## 6. Gate

**Estado:** completado

**Trazabilidad final:** completado
