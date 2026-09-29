> **Workspace:** `backend_express` (Norte Creativo) · **Pista:** Business Express + TypeScript (7 issues) · **Guion:** `docs/proceso.md` · **SDD del proyecto:** `docs/sdd.md`

# ISS-03 — Feature cliente — CRUD completo

**Naturaleza:** práctico
**Issue GitHub:** `#3`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-02 en **Hecho**
**Commit esperado:** `feat(iss-03): feature cliente CRUD Refs #3`

---

## 1. SDD

**OBJ:** Al finalizar, se podrán crear, consultar, actualizar (PUT/PATCH) y eliminar (física y lógicamente) clientes persistidos en `norte_creativo_express`, con las reglas de negocio del SDD.

**SPEC (qué debe quedar):**
- Feature `src/features/business/cliente/` con el patrón del manual (ISS-03-A…E consolidados): `cliente.model.ts`, `cliente.controller.ts`, `cliente.routes.ts`, carpeta `http/`.
- **Modelo** `Cliente` (tabla `clientes`, `timestamps: true`), campos del SDD §4.1: `tipo_documento` (ENUM `CC|NIT|CE|TI|PASAPORTE`), `numero_documento` (único, requerido), `nombre` (requerido), `telefono?`, `email?` (formato email), `status` (`active|inactive`, default `active`).
- **Sin password ni bcrypt**: en Norte Creativo el cliente no es usuario del sistema (diferencia con StoreLab).
- **Controller**: `getAll` (solo `status: active`), `getOne`, `create`, `updatePut`, `updatePatch`, `deletePhysical`, `deleteLogical`.
- **Rutas SIN AUTH**: `GET/POST /api/clientes`, `GET/PUT/PATCH/DELETE /api/clientes/:id`, `PATCH /api/clientes/:id/deactivate`.
- `src/routes/index.ts` (agregador) + `App.routes()` y `App.dbConnection()` con `sequelize.sync()` (sin force/alter).
- Archivos `http/clientes.get.http`, `clientes.create.http`, `clientes.update.http`, `clientes.delete.http` con leyenda **SIN AUTH**.
- Adaptación de errores (mejora sobre el manual, que devuelve 500): validación → `400`, no encontrado → `404`, `numero_documento` duplicado → `409`.

**REQ (restricciones):**
- `sequelize.sync()` sin `force` ni `alter`.
- Sin seeder (ISS-04) ni Swagger (ISS-05). No adelantar Campania.

**AC:**
- [x] **AC-1** Dado la app arrancada; cuando termina `sync`; entonces existe la tabla `clientes` en `norte_creativo_express`.
- [x] **AC-2** Dado un payload válido; cuando `POST /api/clientes`; entonces `201` con el cliente creado y `status: active`.
- [x] **AC-3** Dado un `numero_documento` ya registrado; cuando `POST /api/clientes`; entonces `409` y no se crea fila.
- [x] **AC-4** Dado un payload sin `nombre` o con email inválido; cuando `POST /api/clientes`; entonces `400`.
- [x] **AC-5** Dado un cliente existente; cuando `PUT` y luego `PATCH` sobre `/api/clientes/:id`; entonces `200` con los cambios persistidos.
- [x] **AC-6** Dado un cliente; cuando `PATCH /api/clientes/:id/deactivate`; entonces queda `inactive` y ya no aparece en `GET /api/clientes`; con `DELETE /api/clientes/:id` desaparece de la tabla.
- [x] **AC-7** Dado un `id` inexistente; cuando `GET /api/clientes/999999`; entonces `404`.

**Checklist interno (IA, En curso):**
- [x] Modelo Cliente (sin password)
- [x] Controller 7 métodos
- [x] Rutas SIN AUTH
- [x] routes/index.ts + cableado App + sync
- [x] 4 archivos .http
- [x] Códigos 400/404/409

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-03, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-03.md siguiendo docs/manual.md secciones 4 a 8 (ISS-03-A a ISS-03-E, feature Client),
adaptado a la entidad Cliente de Norte Creativo.

Feature src/features/business/cliente: cliente.model.ts, cliente.controller.ts, cliente.routes.ts y carpeta http/.
Modelo Cliente (tabla clientes, timestamps true): tipo_documento ENUM(CC,NIT,CE,TI,PASAPORTE) requerido,
numero_documento STRING unico requerido, nombre STRING requerido (notEmpty), telefono STRING opcional,
email STRING opcional con isEmail, status ENUM(active,inactive) default active.
IMPORTANTE: el Cliente de Norte Creativo NO tiene password ni bcrypt (no es usuario del sistema).
Controller ClienteController con getAll (solo status active), getOne, create, updatePut, updatePatch,
deletePhysical y deleteLogical (status = inactive), mismo estilo del manual (respuestas { cliente } / { clientes }).
Errores: validacion de Sequelize -> 400, no encontrado -> 404, numero_documento duplicado (UniqueConstraintError) -> 409.
Rutas SIN AUTH: GET/POST /api/clientes, GET/PUT/PATCH/DELETE /api/clientes/:id, PATCH /api/clientes/:id/deactivate.
src/routes/index.ts como agregador; en src/config/index.ts cablea routes() y en dbConnection() haz testConnection + sequelize.sync() sin force ni alter.
Crea http/clientes.get.http, clientes.create.http, clientes.update.http, clientes.delete.http con leyenda SIN AUTH, apuntando a localhost:3012.

Prohibido: seeder, Swagger, Campania, Hito, force, alter. NO adelantes ISS-04. Prohibido: autenticacion, JWT, bcrypt, passwords, guards, RBAC, NestJS. NO toques docs/. NO commitees .env.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | tabla creada | AC-1 | (Evidencia en Proceso.md) | `docker exec nc-mysql mysql -uroot -p norte_creativo_express -e "SHOW TABLES"` |
|       | HTTP 201 | AC-2 | (Evidencia en Proceso.md) | `curl -i -X POST localhost:3012/api/clientes -H 'Content-Type: application/json' -d '{"tipo_documento":"NIT","numero_documento":"900123","nombre":"Postobón S.A."}'` |
|       | HTTP 409 | AC-3 | (Evidencia en Proceso.md) | repetir el POST de AC-2 |
|       | HTTP 400 | AC-4 | (Evidencia en Proceso.md) | `curl -i -X POST localhost:3012/api/clientes -H 'Content-Type: application/json' -d '{"tipo_documento":"CC","numero_documento":"111","email":"malo"}'` |
|       | HTTP 200 PUT/PATCH | AC-5 | (Evidencia en Proceso.md) | `curl -i -X PATCH localhost:3012/api/clientes/1 -H 'Content-Type: application/json' -d '{"telefono":"3001234567"}'` |
|       | borrado lógico y físico | AC-6 | (Evidencia en Proceso.md) | `curl -i -X PATCH localhost:3012/api/clientes/1/deactivate` luego `curl localhost:3012/api/clientes` |
|       | HTTP 404 | AC-7 | (Evidencia en Proceso.md) | `curl -i localhost:3012/api/clientes/999999` |

**Commit (hash):** `feat(iss-03): feature cliente CRUD Refs #3`
**Autoevaluación de AC:** Completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Cuál es la diferencia entre `PUT` y `PATCH` en tu controller?». «¿Qué diferencia hay entre el borrado físico y el lógico y cuándo usarías cada uno?». «¿Por qué el Cliente de Norte Creativo no tiene password si el de StoreLab sí?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|28/09/2026|CarlosZ|Revisor|Todos|Proceso.md|          |Terminado|

**Respuesta del autor (ajuste o justificación):**

updateput reemplaza el recurso completo, si mandas solo un campo los demas quedan en null o en su valor
por defecto porque asume que estas mandando el objeto entero, updatepatch en cambio solo toca los campos
que le mandas, los demas quedan igual, en mi controller updateput usa body.campo directo y updatepatch usa
body.campo ?? client.campo para no pisar lo que no se envio

el borrado fisico hace client.destroy(), la fila desaparece de la tabla para siempre, no hay como
recuperarla, el borrado logico hace update a status inactive, la fila sigue ahi pero deja de aparecer en
getall porque ese metodo filtra por status active, usaria el fisico solo si el registro se creo por error
o son datos de prueba, y el logico para el caso normal de un cliente que deja de operar, porque asi
conservo el historial de campañas y facturas que quedaron ligadas a ese cliente

el cliente de norte creativo no tiene password porque no es un usuario del sistema, es solo el dato de la
empresa a la que la agencia le hace campañas, quien si va a tener password son los usuarios (admin,
cuentas, creativo, cliente_aprobador, finanzas) que se modelan en la semana 06 de auth, en storelab el
client si tenia password porque en ese proyecto el cliente se autentica directamente, aca no
---

## 6. Gate

**Estado:** Completo
**Trazabilidad final:** proceso.md