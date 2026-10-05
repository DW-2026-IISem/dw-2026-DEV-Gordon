> **Workspace:** `backend_Express` (Norte Creativo) · **Pista:** Refactor por capas + Auth con RBAC (ISS-12 a ISS-21) · **Manual base:** sitio del docente (Express 2026) · **SDD:** `docs/sdd.md`

# ISS-13 — Refactor por capas (B): tareas, entregables, version-entregables, aprobaciones

**Naturaleza:** práctico
**Issue GitHub:** `#13`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-12 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/backend2026/manual/09-ISS-08-sale-product-sale/
**Commit esperado:** `feat(iss-13): refactor por capas cadena de entregables y aprobaciones Refs #13`

---

## 1. SDD

**OBJ:** Al finalizar, toda la Fase I estará por capas y CerrarHito vivirá en el service con `withTransaction`, como la venta del manual.

**SPEC (qué debe quedar):**
- Carpetas en plural: `tareas/`, `entregables/`, `version-entregables/`, `aprobaciones/`, con el mismo esquema de capas que ISS-12.
- `numero_version` automático, RN-04 y RN-06 se mueven al service de versiones.
- CerrarHito pasa a `aprobaciones.service.ts` dentro de `withTransaction`; el `LOCK.UPDATE` del hito queda en un método del repository (`findByIdForUpdate` o similar).
- `cierre-hito.evaluator.ts` sigue siendo una función pura dentro del feature.
- Aprobaciones sigue sin update ni delete.

**REQ (restricciones):**
- Mismo comportamiento externo: el libreto de la demo (rechazo, aprobación que cierra, 409 sobre hito cerrado) da los mismos resultados.

**AC:**
- [ ] **AC-1** Existen las cuatro carpetas en plural con sus capas y ya no existen las versiones en singular.
- [ ] **AC-2** `aprobaciones.service.ts` usa `withTransaction` y el controller de aprobaciones no importa `sequelize`.
- [ ] **AC-3** El bloqueo del hito (`LOCK.UPDATE`) está en un repository, no en el service ni en el controller.
- [ ] **AC-4** `cierre-hito.evaluator.ts` no importa `sequelize` ni `express`.
- [ ] **AC-5** El libreto de la demo da: rechazo → `hito_cerrado: false`, última aprobación → `true`, nueva aprobación sobre hito cerrado → 409.
- [ ] **AC-6** `numero_version` automático, RN-04 (409) y RN-06 (409) responden igual que antes.
- [ ] **AC-7** `npx tsc --noEmit` OK, `npm run db:seed` OK y Swagger lista los 7 tags.

**Checklist interno (IA, En curso):**
- [ ] tareas
- [ ] entregables
- [ ] version-entregables
- [ ] aprobaciones + withTransaction
- [ ] lock en repository
- [ ] imports actualizados

---

## 2. Revisión de AC


| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

---

## 3. IA usada

**Herramienta / modelo:** Claude Code - Sonnet 5.5

**Fecha:** 3/10/26

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-13, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-13.md en projects/NorteCreativo/backend_Express.
Aplica el patron por capas (capas HTTP -> Controller -> Service -> Repository -> Model, DTOs por operacion, BaseController.run/paramId,
AppError, findOrFail) adaptado a Norte Creativo.
Puerto 3012, base norte_creativo_express, rutas en español como el docente.

Refactoriza tarea, entregable, version-entregable y aprobacion al patron por capas, con carpetas en plural:
tareas, entregables, version-entregables, aprobaciones. Mueve numero_version automatico, RN-04 y RN-06 al service de versiones.
CerrarHito: el flujo transaccional pasa de aprobacion.controller a aprobaciones.service usando withTransaction (src/shared/database),
como hace el manual con la venta (seccion de product-sales / sales). El bloqueo del hito (lock UPDATE) va en un metodo del repository.
cierre-hito.evaluator.ts sigue puro. Aprobaciones sin PUT/PATCH/DELETE. Mantén rutas, codigos y respuestas identicos.
Actualiza imports en config, routes, seeders y swagger.

NO empieces auth (ISS-14). Prohibido: NestJS, force: true, secretos en el codigo (JWT_SECRET solo en .env; .env.example sin valores), cambiar el puerto 3012 o la base norte_creativo_express. NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | archivos | AC-1 | ver docs/proceso.md, sección ISS - 13 | `find src/features/business -maxdepth 1 -type d | sort` |
|       | grep transacción | AC-2, AC-3 | ver docs/proceso.md, sección ISS - 13 | `grep -rn "withTransaction\|LOCK" src/features/business/aprobaciones src/features/business/hitos` |
|       | evaluador puro | AC-4 | ver docs/proceso.md, sección ISS - 13 | `grep -n "sequelize\|express" src/features/business/aprobaciones/cierre-hito.evaluator.ts` |
|       | libreto de la demo | AC-5 | ver docs/proceso.md, sección ISS - 13 | mismos comandos del ISS-11 (cadenas A y B) |
|       | versiones | AC-6 | ver docs/proceso.md, sección ISS - 13 | curls del ISS-10 (AC-1, AC-4, AC-5) |
|       | compilación y Swagger | AC-7 | ver docs/proceso.md, sección ISS - 13 | `npx tsc --noEmit` + abrir `localhost:3012/api/docs` |

**Commit (hash):** `feat(iss-13): refactor por capas cadena de entregables y aprobaciones Refs #13`
**Autoevaluación de AC:** Completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué la transacción pasó del controller al service y el lock al repository?». «¿Qué garantiza `withTransaction` que antes tenías que escribir a mano?». «¿Qué cambió y qué no cambió para quien consume la API?»


| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

la transaccion paso al service porque abrirla y decidir cuando se confirma o se revierte es parte del caso de
uso de aprobar, no de http, el controller solo recibe la peticion y arma la respuesta, el lock se fue al
repository porque for update es una instruccion sql de sequelize y el repository es la unica capa que lo
conoce, el service dice cuando necesita el hito bloqueado y el repository sabe como bloquearlo

withtransaction abre la transaccion, ejecuta lo que le pase, hace commit si todo sale bien y rollback si algo
lanza un error, y pasa la transaccion a cada consulta, antes yo tenia que escribir a mano el
sequelize.transaction, el try catch, el commit y el rollback, y si se me olvidaba pasar transaction: t en una
consulta esa consulta quedaba fuera y podia dejar datos a medias, ahora esa mecanica esta en un solo lugar

para quien consume la api no cambio nada, mismas rutas, mismos codigos y misma respuesta, el rechazo sigue
dando hito_cerrado false, la ultima aprobacion sigue cerrando el hito y una aprobacion sobre un hito cerrado
sigue dando 409, lo que cambio es por dentro, la transaccion, las reglas de version y el lock ya no estan
en el controller sino repartidos entre service y repository
---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
