> **Workspace:** `backend_Express` (Norte Creativo) · **Pista:** Facturación: presupuesto, factura y RBAC (ISS-22 a ISS-24) · **Manual base:** sitio del docente (Express 2026) · **SDD:** `docs/sdd.md` y `featurefacturacion.md`

# ISS-24 — RBAC de facturación — catálogo y matriz

**Naturaleza:** práctico
**Issue GitHub:** `#24`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-21 e ISS-23 en **Hecho**
**Commit esperado:** `feat(iss-24): rbac de facturacion Refs #24`

---

## 1. SDD

**OBJ:** Al finalizar, presupuestos y facturas estarán bajo JWT + RBAC y FINANZAS podrá facturar, mientras CREATIVO no verá ni presupuestos ni facturas, como define el SDD.

**SPEC (qué debe quedar):**
- `src/features/auth/resources/resource-catalog.ts`: añadir los `(method, path)` de `/api/presupuestos` (CRUD + deactivate = 7) y `/api/facturas` (`GET`, `GET /:id`, `POST` = 3). El catálogo pasa de 76 a **86**.
- `src/features/auth/resource-roles/role-matrix.ts`:
  - ADMIN: todo salvo `POST /api/aprobaciones` (RN-05) → **85**.
  - CUENTAS: `presupuestos` CRUD; `facturas` sin acceso (SDD: "no facturan") → **36**.
  - FINANZAS: `facturas` CREAR_LEER; `presupuestos` LEER (compara presupuesto vs facturado) → **11**.
  - CREATIVO: sin acceso a ninguno (SDD: "no ve presupuestos ni facturas") → **16** (sin cambio).
  - CLIENTE_APROBADOR: sin acceso (decisión por defecto) → **11** (sin cambio).
- Rutas de `presupuestos` y `facturas` montadas con `authenticate` + `authorize`.
- Reejecutar `npm run db:seed` reconcilia sin duplicar; el README actualiza la tabla de la matriz y los conteos de concesiones activas.
- `npx ts-node scripts/check-resource-catalog.ts` sin rutas huérfanas.

**REQ (restricciones):**
- No se toca la lógica de FacturarHitos ni la de presupuestos: solo catálogo, matriz y documentación.
- Sin ownership: el RBAC sigue siendo por endpoint.

**AC:**
- [x] **AC-1** Dado `npm run db:seed`; entonces hay 86 recursos y reejecutarlo no cambia los conteos.
- [x] **AC-2** Dado un token de `finanzas`; cuando `POST /api/facturas` sobre un hito CERRADO; entonces `201`.
- [x] **AC-3** Dado un token de `creativo`; cuando `GET /api/facturas` o `GET /api/presupuestos`; entonces `403`.
- [x] **AC-4** Dado un token de `cuentas`; cuando `POST /api/presupuestos` → `201`; cuando `POST /api/facturas` → `403`.
- [x] **AC-5** Dado sin token; cuando cualquier ruta de presupuestos o facturas; entonces `401`.
- [x] **AC-6** Dado `check-resource-catalog.ts`; entonces el catálogo cubre todas las rutas reales.

**Checklist interno (IA, En curso):**
- [x] Catálogo 76 → 86
- [x] Matriz por rol (CUENTAS, FINANZAS, CREATIVO, CLIENTE_APROBADOR)
- [x] Seeder idempotente (reconcileRole)
- [x] 401/403 por rol verificados
- [x] check-resource-catalog sin huérfanos
- [x] README: matriz y conteos (85/36/16/11/11)

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-24, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-24.md en projects/NorteCreativo/backend_Express.
Lee primero featurefacturacion.md (seccion ISS-24) y el README del backend (matriz de concesiones).

Agrega a src/features/auth/resources/resource-catalog.ts los recursos de /api/presupuestos (CRUD + deactivate) y /api/facturas
(GET, GET /:id, POST). Actualiza src/features/auth/resource-roles/role-matrix.ts segun la SPEC de ISS-24: CUENTAS presupuestos CRUD
y facturas sin acceso; FINANZAS facturas CREAR_LEER y presupuestos LEER; CREATIVO y CLIENTE_APROBADOR sin acceso; ADMIN todo.
Verifica que las rutas de presupuestos y facturas esten montadas con authenticate + authorize.
El seeder reconcilia con reconcileRole (idempotente). Actualiza en el README la tabla de la matriz y los conteos de concesiones.
Verifica con npx ts-node scripts/check-resource-catalog.ts.

Prohibido: NestJS, force: true, alter, secretos en el codigo, cambiar el puerto 3012 o la base norte_creativo_express,
tocar la logica de FacturarHitos o de presupuestos. NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | 86 recursos e idempotencia | AC-1 | (pegar salida o ruta a captura) | `npm run db:seed` dos veces (log de Recursos y Concesiones: ADMIN=85, CUENTAS=36, CREATIVO=16, CLIENTE_APROBADOR=11, FINANZAS=11) |
|       | finanzas factura | AC-2 | (pegar salida o ruta a captura) | login `finanzas`, `POST /api/facturas` sobre un hito CERRADO |
|       | creativo 403 | AC-3 | (pegar salida o ruta a captura) | login `creativo`, `GET /api/facturas` y `GET /api/presupuestos` |
|       | cuentas | AC-4 | (pegar salida o ruta a captura) | login `cuentas`: `POST /api/presupuestos` (201) y `POST /api/facturas` (403) |
|       | sin token 401 | AC-5 | (pegar salida o ruta a captura) | `curl -i localhost:3012/api/facturas` y `curl -i localhost:3012/api/presupuestos` |
|       | catálogo | AC-6 | (pegar salida o ruta a captura) | `npx ts-node scripts/check-resource-catalog.ts` (86 endpoints, OK) |
|       | smoke y compilación | AC-1 a AC-6 | (pegar salida o ruta a captura) | `bash scripts/smoke-rbac.sh && bash scripts/smoke-facturacion.sh && npx tsc --noEmit` |

**Commit (hash):** feat(iss-24): rbac de facturacion Refs #24
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué CUENTAS gestiona presupuestos pero no puede facturar, y dónde se aplica esa regla?». «¿Qué pasa con las concesiones de un rol cuando se reejecuta el seeder tras cambiar la matriz?». «¿Qué queda fuera del RBAC por endpoint en facturación y por qué CLIENTE_APROBADOR quedó sin acceso?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

(pendiente: redactar con tus palabras)

---

## 6. Gate

**Estado:** pendiente
**Trazabilidad final:** pendiente
