> **Workspace:** `backend_Express` (Norte Creativo) · **Pista:** Facturación: presupuesto, factura y RBAC (ISS-22 a ISS-24) · **Manual base:** sitio del docente (Express 2026) · **SDD:** `docs/sdd.md` y `featurefacturacion.md`

# ISS-22 — Feature presupuesto — presupuesto por campaña (BORRADOR → APROBADO)

**Naturaleza:** práctico
**Issue GitHub:** `#22`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-21 en **Hecho**
**Commit esperado:** `feat(iss-22): feature presupuestos Refs #22`

---

## 1. SDD

**OBJ:** Al finalizar, CUENTAS podrá registrar y aprobar presupuestos por campaña, base para validar RN-03 al facturar.

**SPEC (qué debe quedar):**
- Feature `src/features/business/presupuestos/` por capas, igual que `campanias/`: `presupuesto.model.ts`, `presupuestos.repository.ts`, `presupuestos.service.ts`, `presupuestos.controller.ts`, `presupuestos.routes.ts`, `presupuesto.associations.ts`, `presupuesto.seeder.ts`, `presupuesto.swagger.ts`, `dto/`, `http/`.
- Modelo `Presupuesto` (tabla `presupuestos`, timestamps): `campania_id` INTEGER FK requerido, `fecha` DATE default ahora, `valor` DECIMAL(14,2) requerido > 0, `estado` ENUM(BORRADOR, APROBADO) default BORRADOR, `observaciones` TEXT opcional, `status` ENUM(active, inactive) default active. El `valor` se responde siempre como número.
- Associations: `Campania.hasMany(Presupuesto, as "presupuestos")`, `Presupuesto.belongsTo(Campania, as "campania")`, importadas antes del `sync` en `src/config/index.ts`.
- API `/api/presupuestos`: CRUD + `PATCH /:id/deactivate`, con `authenticate` + `authorize`.
- Un presupuesto `APROBADO` no se edita, desactiva ni elimina → `409` (protege lo usado para facturar). Se aprueba con `PATCH {"estado":"APROBADO"}`.
- Campaña inexistente → `404`; campaña inactiva → `409` (misma idea que RN-08); `valor` ausente, no numérico o `<= 0` → `400`.
- Seeder idempotente (un presupuesto APROBADO por campaña activa sin presupuesto), registrado en `src/database/seeders/index.ts` después de campañas.

**REQ (restricciones):**
- Los recursos del catálogo y la matriz de roles son de ISS-24 (aquí solo se montan las rutas con `authenticate` + `authorize`).
- No se adelanta facturación (ISS-23).

**AC:**
- [x] **AC-1** Dado la app; cuando `sync`; entonces existe `presupuestos` con FK real a `campanias`.
- [x] **AC-2** Dado un `campania_id` existente; cuando `POST /api/presupuestos`; entonces `201` con `estado: BORRADOR`.
- [x] **AC-3** Dado un `campania_id` inexistente → `404`; sin `valor` o `valor <= 0` → `400`; sin crear fila.
- [x] **AC-4** Dado un presupuesto BORRADOR; cuando `PATCH` con `estado: APROBADO`; entonces `200`; y un `PUT`/`PATCH`/`deactivate` posterior → `409`.
- [x] **AC-5** Dado `npm run db:seed` ×2; entonces se crean presupuestos sin duplicar.
- [x] **AC-6** Dado Swagger; entonces `/api/presupuestos` aparece documentado.

**Checklist interno (IA, En curso):**
- [x] Modelo Presupuesto + FK
- [x] Capas (repository, service, controller, routes, DTOs)
- [x] Validación valor > 0 y campaña (404/409)
- [x] APROBADO inmutable (409)
- [x] Seeder idempotente
- [x] Swagger y .http

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-22, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-22.md en projects/NorteCreativo/backend_Express.
Lee primero featurefacturacion.md (seccion ISS-22) y docs/sdd.md del proyecto (entidad Presupuesto, RN-03).

Feature src/features/business/presupuestos por capas (model, repository, service, controller, routes, associations,
seeder, swagger, dto/, http/), copiando el patron EXACTO de src/features/business/campanias.
Modelo Presupuesto (tabla presupuestos, timestamps true): campania_id INTEGER requerido FK a campanias.id,
fecha DATE default ahora, valor DECIMAL(14,2) requerido > 0, estado ENUM(BORRADOR,APROBADO) default BORRADOR,
observaciones TEXT opcional, status ENUM(active,inactive) default active.
Associations Campania.hasMany(Presupuesto, as "presupuestos") y Presupuesto.belongsTo(Campania, as "campania"), importadas antes del sync.
CRUD + PATCH /:id/deactivate. Campania inexistente -> 404, inactiva -> 409. Presupuesto APROBADO no se edita ni desactiva -> 409.
Seeder idempotente: un presupuesto APROBADO por campania sembrada; registrarlo en src/database/seeders/index.ts despues de campanias.
Swagger registrado en src/swagger/index.ts.

Protege las rutas con authenticate + authorize como el resto del negocio.
NO adelantes ISS-23 (facturas). Prohibido: NestJS, force: true, alter, secretos en el codigo, cambiar el puerto 3012 o la base
norte_creativo_express. NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | FK en BD | AC-1 | (pegar salida o ruta a captura) | `SHOW CREATE TABLE presupuestos;` (FK a `campanias`) |
|       | 201 BORRADOR | AC-2 | (pegar salida o ruta a captura) | login `cuentas`, `POST /api/presupuestos` con `{"campania_id":1,"valor":1000000}` |
|       | 404 / 400 | AC-3 | (pegar salida o ruta a captura) | POST con `campania_id: 999999`, sin `valor` y con `valor: 0` |
|       | aprobación e inmutabilidad | AC-4 | (pegar salida o ruta a captura) | `PATCH /api/presupuestos/ID` `{"estado":"APROBADO"}` y luego `PUT`, `PATCH`, `/deactivate` (409) |
|       | seed idempotente | AC-5 | (pegar salida o ruta a captura) | `npm run db:seed` dos veces (log de Presupuestos) |
|       | Swagger | AC-6 | (pegar salida o ruta a captura) | captura de `localhost:3012/api/docs` (tag Presupuestos) o `curl localhost:3012/api/docs.json` |
|       | smoke | AC-1 a AC-6 | (pegar salida o ruta a captura) | `bash scripts/smoke-facturacion.sh && npx tsc --noEmit` |

**Commit (hash):** feat(iss-22): feature presupuestos Refs #22
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué un presupuesto APROBADO se vuelve inmutable y qué se rompería si se pudiera editar?». «¿Qué diferencia hay entre un presupuesto BORRADOR y uno APROBADO para la facturación?». «¿Por qué el seeder siembra un presupuesto APROBADO por campaña y cómo evita duplicar?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

(pendiente: redactar con tus palabras)

---

## 6. Gate

**Estado:** pendiente
**Trazabilidad final:** pendiente
