> **Workspace:** `backend_express` (Norte Creativo) · **Pista:** Business Express + TypeScript (7 issues) · **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-06 — Feature campania — CRUD + relación con cliente

**Naturaleza:** práctico
**Issue GitHub:** `#6`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-05 en **Hecho**
**Commit esperado:** `feat(iss-06): feature campania` con `Refs #6`

---

## 1. SDD

**OBJ:** Al finalizar, se podrán gestionar campañas asociadas a un cliente existente y activo, con seeder y documentación, dejando el contenedor del que cuelgan los hitos.

**SPEC (qué debe quedar):**
- Feature `src/features/business/campania/`: `campania.model.ts`, `campania.controller.ts`, `campania.routes.ts`, `campania.associations.ts`, `campania.seeder.ts`, `campania.swagger.ts`, `http/`.
- **Modelo** `Campania` (tabla `campanias`, `timestamps: true`): `cliente_id` (FK a `clientes.id`, requerido), `nombre` (requerido), `descripcion?`, `status` (`active|inactive`, default `active`).
- **Associations**: `Cliente.hasMany(Campania, { foreignKey: 'cliente_id' })` y `Campania.belongsTo(Cliente, { foreignKey: 'cliente_id' })`, importadas en `config` antes del `sync`.
- **Controller** (7 métodos como cliente): en `create` y `updatePut` valida que el cliente exista (`404`) y esté `active` (`409`).
- **Rutas SIN AUTH** en `/api/campanias` (mismo set que clientes, incluido `/:id/deactivate`); `getOne` incluye el cliente asociado.
- Seeder `seedCampanias(count)` idempotente, asignando campañas a clientes activos existentes; runner ejecuta clientes → campanias; `SEED_CAMPANIAS` / `--campanias=N`.
- `campaniaSwagger` registrado en el registry.

**REQ (restricciones):**
- Regla nueva de esta capa (análoga a "no producto con tipo inactivo" de StoreLab): **no se crea campaña para un cliente inactivo**.
- No adelantar Hito.

**AC:**
- [x] **AC-1** Dado la app arrancada; cuando `sync`; entonces existe `campanias` con FK real a `clientes` (`SHOW CREATE TABLE`).
- [x] **AC-2** Dado un `cliente_id` existente y activo; cuando `POST /api/campanias`; entonces `201`.
- [x] **AC-3** Dado un `cliente_id` inexistente; cuando `POST /api/campanias`; entonces `404` y no se crea fila.
- [x] **AC-4** Dado un cliente `inactive`; cuando `POST /api/campanias` con su id; entonces `409`.
- [x] **AC-5** Dado una campaña; cuando `GET /api/campanias/:id`; entonces la respuesta incluye su cliente.
- [x] **AC-6** Dado la tabla vacía; cuando `npm run db:seed`; entonces se crean campañas sobre clientes existentes y repetir no duplica.
- [x] **AC-7** Dado Swagger; cuando se abre `/api/docs`; entonces aparece el tag Campañas.

**Checklist interno (IA, En curso):**
- [x] Modelo con FK
- [x] associations + import en config
- [x] Controller con validación cliente existe/activo
- [x] Rutas SIN AUTH + .http
- [x] Seeder + runner en orden
- [x] Swagger registrado

---

## 2. Revisión de AC

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

---

## 3. IA usada

**Herramienta / modelo:** Claude Code - sonet 5.5

**Fecha:** (pendiente)

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-06, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-06.md siguiendo docs/manual.md secciones 11 y 12 (patron de ProductType y de la relacion
Product-ProductType con archivo associations), adaptado a la entidad Campania de Norte Creativo. Mismo estilo del feature cliente ya hecho.

Feature src/features/business/campania: model, controller, routes, associations, seeder, swagger y carpeta http/.
Modelo Campania (tabla campanias, timestamps true): cliente_id INTEGER requerido FK a clientes.id, nombre STRING requerido,
descripcion TEXT opcional, status ENUM(active,inactive) default active.
campania.associations.ts: Cliente.hasMany(Campania, foreignKey cliente_id) y Campania.belongsTo(Cliente, foreignKey cliente_id, as "cliente"),
importado en src/config/index.ts antes del sync.
Controller CampaniaController con los mismos 7 metodos del cliente. En create y updatePut: si el cliente no existe -> 404;
si el cliente esta inactive -> 409 ("no se crea campaña para un cliente inactivo"). getOne incluye el cliente asociado.
Rutas SIN AUTH en /api/campanias (incluido PATCH /api/campanias/:id/deactivate) registradas en src/routes/index.ts.
http/ con los archivos .http de get, create, update y delete, leyenda SIN AUTH, puerto 3012.
Seeder seedCampanias(count) idempotente que asigna campanias a clientes activos existentes; agregalo al SeedersRunner
DESPUES de clientes, con SEED_CAMPANIAS y --campanias=N en counts.ts.
campaniaSwagger registrado en src/swagger/index.ts.

Prohibido: Hito, force, alter. NO adelantes ISS-07. Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | FK real | AC-1 | (pegar salida o ruta a captura) | `docker exec nc-mysql mysql -uroot -p norte_creativo_express -e "SHOW CREATE TABLE campanias\G"` |
|       | HTTP 201 | AC-2 | (pegar salida o ruta a captura) | `curl -i -X POST localhost:3012/api/campanias -H 'Content-Type: application/json' -d '{"cliente_id":1,"nombre":"Carnaval 2026"}'` |
|       | HTTP 404 | AC-3 | (pegar salida o ruta a captura) | mismo POST con `cliente_id: 999999` |
|       | HTTP 409 | AC-4 | (pegar salida o ruta a captura) | desactivar un cliente (`PATCH /api/clientes/:id/deactivate`) y crear campaña para él |
|       | include cliente | AC-5 | (pegar salida o ruta a captura) | `curl localhost:3012/api/campanias/1` |
|       | seed idempotente | AC-6 | (pegar salida o ruta a captura) | `npm run db:seed` ×2 + COUNT |
|       | Swagger | AC-7 | (pegar salida o ruta a captura) | captura de `/api/docs` |

**Commit (hash):** "feat(iss-06): feature campania Refs #6"
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Dónde se valida que el cliente exista y esté activo, y por qué no se deja que falle la FK en la base?». «¿Para qué sirve el archivo `associations` si la FK ya está en el modelo?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

se valida en campania.controller.ts, en create y en updateput, antes de hacer el insert, primero busca el
cliente con Cliente.findByPk(cliente_id), si no existe responde 404, y si existe pero esta inactive
responde 409, solo si pasa las dos cosas crea la campania

no se deja que falle la fk en la base por dos razones, la primera es que si el cliente no existe mysql
tira un error de constraint que llega al catch y sale como un 500 con un mensaje feo de sequelize, en
cambio validando antes el cliente recibe un 404 claro, la segunda es que la regla de cliente inactivo la
base no la puede conocer, la fk solo comprueba que el id exista en la tabla clientes, no si esta activo,
esa regla solo se puede aplicar en el codigo

el archivo associations sirve porque es donde se le dice a sequelize que cliente y campania estan
relacionados, con cliente.hasMany(campania) y campania.belongsTo(cliente), eso hace dos cosas, crea la
constraint real de fk en la tabla cuando corre el sync, y habilita el include, por eso getone puede
devolver la campania con su cliente adentro, si solo dejara cliente_id como una columna normal en el
modelo, seria un numero suelto y sequelize no sabria que apunta a clientes, y ese archivo se importa en
config antes del sync para que la relacion ya este registrada cuando se crean las tablas

---

## 6. Gate

**Estado:** completado
**Trazabilidad final:** completado
