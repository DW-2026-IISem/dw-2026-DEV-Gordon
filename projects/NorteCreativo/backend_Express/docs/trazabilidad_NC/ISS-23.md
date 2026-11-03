> **Workspace:** `backend_Express` (Norte Creativo) · **Pista:** Facturación: presupuesto, factura y RBAC (ISS-22 a ISS-24) · **Manual base:** sitio del docente (Express 2026) · **SDD:** `docs/sdd.md` y `featurefacturacion.md`

# ISS-23 — Feature factura + factura-hito — FacturarHitos transaccional

**Naturaleza:** práctico
**Issue GitHub:** `#23`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-22 en **Hecho**
**Commit esperado:** `feat(iss-23): feature facturas FacturarHitos Refs #23`

---

## 1. SDD

**OBJ:** Al finalizar, FINANZAS podrá facturar en una sola operación atómica los hitos CERRADOS de una campaña, sin exceder su presupuesto aprobado, y esos hitos quedarán FACTURADOS.

**SPEC (qué debe quedar):**
- Feature `src/features/business/facturas/` por capas, con el patrón de `aprobaciones/` (transacción en el service con `withTransaction`): `factura.model.ts`, `factura-hito.model.ts`, `facturas.repository.ts`, `facturas.service.ts`, `facturas.controller.ts`, `facturas.routes.ts`, `factura.associations.ts`, `facturacion.evaluator.ts`, `factura.swagger.ts`, `dto/`, `http/`.
- Modelo `Factura` (tabla `facturas`): `campania_id` FK, `numero` STRING UNIQUE, `fecha` DATE default ahora, `subtotal`, `impuestos`, `total` DECIMAL(14,2), `estado` ENUM(EMITIDA) default EMITIDA, `status`.
- Modelo `FacturaHito` (tabla `factura_hitos`): `factura_id` FK, `hito_id` FK, `valor` DECIMAL(14,2); índice único `(factura_id, hito_id)`; un hito no puede estar en dos facturas (el estado FACTURADO lo impide).
- Associations: `Campania.hasMany(Factura)`, `Factura.belongsTo(Campania)`, `Factura.hasMany(FacturaHito, as "hitos")`, `FacturaHito.belongsTo(Hito)`, `Hito.hasMany(FacturaHito)`.
- **Evaluador puro** `facturacion.evaluator.ts`: `excedePresupuesto({ presupuestoAprobado, yaFacturado, nuevoSubtotal }): boolean` (RN-03), comparando en centavos; más `calcularImportes` (impuestos y total). Sin Sequelize ni Express.
- `POST /api/facturas` body `{ campania_id, hito_ids: number[] }`, en **una sola transacción**:
  1. Campaña existe (`404`), activa y con presupuesto APROBADO (si no → `409`); su fila se bloquea para serializar facturaciones de la misma campaña.
  2. Cada hito existe (`404`), pertenece a la campaña (`400`) y está `CERRADO` (si no → `409`); hitos bloqueados con `LOCK.UPDATE` en orden de id. `hito_ids` vacío, repetido o no numérico → `400`.
  3. `valor` de cada hito = suma de `entregables.total` de sus tareas; `subtotal` = suma de valores; `impuestos` = `subtotal × FACTURA_IVA` (`.env`, default 0.19); `total` = `subtotal + impuestos`. Subtotal 0 → `409`.
  4. RN-03: `yaFacturado` (suma de `subtotal` de facturas de la campaña) + `subtotal` > presupuesto aprobado (suma de presupuestos APROBADO activos) → `409`. Llegar exactamente al tope se permite.
  5. Genera `numero` `NC-<año>-<consecutivo 6 dígitos>` (RN-07); una colisión del índice único o un deadlock reintenta la transacción completa (hasta 10 veces; luego `409`).
  6. Crea `facturas` + `factura_hitos` y pasa cada hito a `FACTURADO`.
  7. Cualquier error → rollback total.
- Respuesta `201 { factura, hitos: [{ hito_id, valor }], presupuesto_aprobado, total_facturado_campania }`.
- `GET /api/facturas` (filtro `?campania_id=`), `GET /api/facturas/:id` con sus hitos. **Sin PUT, PATCH ni DELETE** (registro contable, como aprobaciones). Rutas con `authenticate` + `authorize`.
- **Ajuste al feature version-entregables (RN-06):** un hito que no esté `ABIERTO` (CERRADO **o FACTURADO**) no admite versiones nuevas; antes solo se bloqueaba CERRADO. Las aprobaciones ya respondían `409` para todo hito no ABIERTO.
- Sin seeder de facturas (se prueban en vivo). README con el libreto de la demo de facturación a continuación del de CerrarHito.

**REQ (restricciones):**
- Decisiones asumidas (propuestas de `featurefacturacion.md`, sección 3): valor del hito = suma de `entregables.total`; IVA configurable `FACTURA_IVA` (default 0.19); RN-03 se compara contra el `subtotal`; número generado por el sistema; anulación de facturas fuera de alcance (se documenta como limitación).
- `FACTURA_IVA` va en `.env.example` sin valor; un valor inválido (no numérico o fuera de 0–1) responde `500` de configuración.
- Los recursos del catálogo y la matriz de roles son de ISS-24.

**AC:**
- [x] **AC-1** Dado la app; cuando `sync`; entonces existen `facturas` y `factura_hitos` con sus FK y el índice único de `numero`.
- [x] **AC-2** Dado un hito CERRADO con presupuesto suficiente; cuando `POST /api/facturas`; entonces `201`, la factura tiene `numero`, `subtotal`, `impuestos`, `total`, y el hito queda `FACTURADO` en BD.
- [x] **AC-3** Dado un hito ABIERTO o ya FACTURADO; cuando se incluye en `POST`; entonces `409` y no se crea nada (ni factura ni cambios en otros hitos de la lista).
- [x] **AC-4** Dado un subtotal que con lo ya facturado excede el presupuesto aprobado; cuando `POST`; entonces `409` (RN-03) y nada cambia.
- [x] **AC-5** Dado un hito de otra campaña → `400`; campaña o hito inexistente → `404`; `hito_ids` vacío → `400`.
- [x] **AC-6** Dado dos facturas creadas; entonces sus `numero` son distintos (RN-07) y `PUT/PATCH/DELETE /api/facturas/:id` no existen (`404`).
- [x] **AC-7** Dado `facturacion.evaluator.ts`; cuando se inspecciona; entonces es una función pura.

**Checklist interno (IA, En curso):**
- [x] Modelos Factura y FacturaHito (FK + únicos)
- [x] Evaluador puro excedePresupuesto
- [x] Transacción con LOCK.UPDATE y rollback
- [x] RN-03, RN-07 y cálculo de IVA
- [x] Respuesta con presupuesto y total facturado
- [x] Solo POST/GET (sin update/delete)
- [x] Hito FACTURADO inmutable (RN-06)
- [x] Concurrencia: reintento ante colisión/deadlock
- [x] Swagger, .http y README

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-23, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-23.md en projects/NorteCreativo/backend_Express.
Lee primero featurefacturacion.md (secciones 3 y ISS-23) y docs/sdd.md del proyecto (Factura, FacturaHito, RN-03, RN-07).
Es la capacidad transaccional FacturarHitos: copia el patron de src/features/business/aprobaciones (service con withTransaction,
evaluador puro, repository, sin PUT/PATCH/DELETE).

Feature src/features/business/facturas: factura.model, factura-hito.model, repository, service, controller, routes,
associations, facturacion.evaluator.ts, swagger, dto/, http/.
Modelos, asociaciones, flujo transaccional, calculo de valor/impuestos/total, generacion de numero y respuesta: EXACTAMENTE
como la SPEC de ISS-23 en featurefacturacion.md. FACTURA_IVA va en .env.example SIN valor (default 0.19 en codigo).
facturacion.evaluator.ts: funcion PURA excedePresupuesto({ presupuestoAprobado, yaFacturado, nuevoSubtotal }): boolean; no importa
sequelize ni express.
Hitos bloqueados con LOCK.UPDATE. Cualquier error -> rollback. Sin seeder de facturas. Swagger registrado.
Actualiza el README del backend con el libreto de la demo de facturacion (hito CERRADO -> POST /api/facturas -> FACTURADO ->
reintento 409 -> exceder presupuesto 409).

Protege las rutas con authenticate + authorize.
NO adelantes ISS-24. Prohibido: NestJS, force: true, alter, secretos en el codigo, cambiar el puerto 3012 o la base
norte_creativo_express. NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | FK e índice único | AC-1 | (pegar salida o ruta a captura) | `SHOW CREATE TABLE facturas;` y `SHOW CREATE TABLE factura_hitos;` |
|       | facturación feliz | AC-2 | (pegar salida o ruta a captura) | login `finanzas`, `POST /api/facturas` con `{"campania_id":1,"hito_ids":[1]}` + `GET /api/hitos/1` (FACTURADO) |
|       | HTTP 409 hito no CERRADO | AC-3 | (pegar salida o ruta a captura) | POST con un hito ABIERTO junto a uno CERRADO y repetir sobre uno ya FACTURADO; verificar que el CERRADO no cambió |
|       | HTTP 409 RN-03 | AC-4 | (pegar salida o ruta a captura) | POST de un hito cuyo subtotal excede el presupuesto aprobado |
|       | HTTP 400 / 404 | AC-5 | (pegar salida o ruta a captura) | POST con hito de otra campaña, `campania_id: 999999`, hito `999999` y `hito_ids: []` |
|       | números únicos y sin PUT/PATCH/DELETE | AC-6 | (pegar salida o ruta a captura) | dos facturas seguidas (`GET /api/facturas`) y `curl -i -X DELETE localhost:3012/api/facturas/1` (404) |
|       | evaluador puro | AC-7 | (pegar salida o ruta a captura) | `npx ts-node scripts/check-facturacion-evaluator.ts` y `grep -n "sequelize\|express" src/features/business/facturas/facturacion.evaluator.ts` (vacío) |
|       | smoke y concurrencia | AC-2 a AC-6 | (pegar salida o ruta a captura) | `bash scripts/smoke-facturacion.sh && npx tsc --noEmit` (84 comprobaciones) |

**Commit (hash):** feat(iss-23): feature facturas FacturarHitos Refs #23
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «Explica paso a paso qué hace la transacción de FacturarHitos y por qué se bloquean la campaña y los hitos». «¿Por qué RN-03 se compara contra el subtotal y no contra el total?». «¿Qué pasa si dos facturaciones simultáneas obtienen el mismo número y cómo lo resuelve el reintento?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

(pendiente: redactar con tus palabras)

---

## 6. Gate

**Estado:** pendiente
**Trazabilidad final:** pendiente
