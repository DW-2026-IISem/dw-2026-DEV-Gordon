> **Workspace:** `backend_Express` (Norte Creativo) · **Pista:** Refactor por capas + Auth con RBAC (ISS-12 a ISS-21) · **Manual base:** sitio del docente (Express 2026) · **SDD:** `docs/sdd.md`

# ISS-12 — Refactor por capas (A): shared + clientes, campanias, hitos

**Naturaleza:** práctico
**Issue GitHub:** `#12`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-11 en **Hecho** · respuesta del docente confirmando el refactor
**Página del docente:** https://tecnogua.com/academic/site/backend2026/manual/04-ISS-03-client-crud/
**Commit esperado:** `feat(iss-12): refactor por capas clientes campanias hitos Refs #12`

---

## 1. SDD

**OBJ:** Al finalizar, Cliente, Campania e Hito seguirán el recorrido por capas del manual nuevo, sin cambiar el comportamiento de la API.

**SPEC (qué debe quedar):**
- `src/shared/errors/app-error.ts`, `src/shared/http/base-controller.ts` (`run`, `paramId`, `handleError`) y `src/shared/database/with-transaction.ts`.
- Carpetas en plural: `features/business/clientes/`, `campanias/`, `hitos/` (se eliminan `cliente/`, `campania/`, `hito/`).
- Por feature: modelo en singular (`cliente.model.ts`), `dto/` (create, update, patch, response + `index.ts`), `<plural>.repository.ts`, `<plural>.service.ts`, `<plural>.controller.ts`, `<plural>.routes.ts`, más `associations`, `seeder`, `swagger` y `http/`.
- Reglas de negocio a los **services**: `numero_documento` único (409), cliente inactivo no admite campaña (409), RN-08 y el 400 por `estado`/`fecha_cierre` del hito. `findOrFail` centraliza el 404.
- Rutas, códigos y respuestas de la API **iguales** a los actuales.

**REQ (restricciones):**
- Es un refactor: los mismos curls de los ISS-03, 06 y 07 deben dar los mismos códigos.
- No tocar tarea, entregable, versión ni aprobación (eso es ISS-13), salvo los imports que se rompan por el cambio de nombre.

**AC:**
- [ ] **AC-1** Existen los tres archivos de `src/shared/`.
- [ ] **AC-2** Existen `clientes/`, `campanias/` e `hitos/` con `dto/`, repository, service, controller y routes, y ya no existen `cliente/`, `campania/` ni `hito/`.
- [ ] **AC-3** Ningún controller de esos tres features importa `sequelize` ni un `.model`.
- [ ] **AC-4** Las reglas (documento duplicado 409, cliente inactivo 409, RN-08 409, `estado` del hito 400) viven en los services y responden igual que antes.
- [ ] **AC-5** `GET /api/clientes/abc` responde 400 (validación de `paramId`).
- [ ] **AC-6** `npx tsc --noEmit` sin errores, `npm run dev` arranca y `npm run db:seed` corre.

**Checklist interno (IA, En curso):**
- [ ] shared/
- [ ] clientes por capas
- [ ] campanias por capas
- [ ] hitos por capas
- [ ] reglas al service
- [ ] imports de config, routes, seeders y swagger actualizados

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-12, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-12.md en projects/NorteCreativo/backend_Express.
Aplica el patron por capas (capas HTTP -> Controller -> Service -> Repository -> Model, DTOs por operacion, BaseController.run/paramId,
AppError, findOrFail) adaptado a Norte Creativo.
Puerto 3012, base norte_creativo_express, rutas en español como el docente.

Refactoriza los features cliente, campania e hito al patron por capas del manual nuevo, renombrando las carpetas a plural:
features/business/clientes, campanias, hitos. Crea src/shared (app-error, base-controller, with-transaction) como en la seccion 4.0.
Mueve TODA regla de negocio del controller al service (numero_documento unico 409, cliente inactivo no admite campania 409,
RN-08 campania inactiva no admite hito 409, estado/fecha_cierre del hito por HTTP -> 400). El repository es la unica capa que usa Sequelize.
Mantén EXACTAMENTE las rutas, codigos HTTP y forma de respuesta actuales. Actualiza los imports en src/config, src/routes,
src/database/seeders y src/swagger, y los de tarea (FK a hitos) si se rompen.

NO refactorices tarea, entregable, version-entregable ni aprobacion (ISS-13). Prohibido: NestJS, force: true, secretos en el codigo (JWT_SECRET solo en .env; .env.example sin valores), cambiar el puerto 3012 o la base norte_creativo_express. NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | archivos | AC-1, AC-2 | ver docs/proceso.md, sección ISS - 12 | `find src/shared src/features/business -maxdepth 2 -type d | sort` |
|       | grep controllers | AC-3 | ver docs/proceso.md, sección ISS - 12 | `grep -n "sequelize\|\.model" src/features/business/{clientes,campanias,hitos}/*.controller.ts` |
|       | regresión de reglas | AC-4 | ver docs/proceso.md, sección ISS - 12 | repetir los curls 409/400 de los ISS-03, 06 y 07 |
|       | paramId | AC-5 | ver docs/proceso.md, sección ISS - 12 | `curl -i localhost:3012/api/clientes/abc` |
|       | compilación y arranque | AC-6 | ver docs/proceso.md, sección ISS - 12 | `npx tsc --noEmit && npm run db:seed && npm run dev` |

**Commit (hash):** pendiente — `feat(iss-12): refactor por capas clientes campanias hitos` · `Refs #__`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Qué responsabilidad perdió el controller y a dónde se fue?». «¿Para qué sirven `run()`, `paramId()` y `findOrFail()` y qué repetición evitan?». «¿Por qué el repository es la única capa que conoce Sequelize?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

el controller perdio toda la logica de negocio y el acceso a datos, antes validaba que el cliente existiera,
que no hubiera un documento repetido, armaba los where y los include y hablaba con sequelize, ahora solo
traduce http, lee el id o el body, llama al service y arma la respuesta con su codigo, las reglas se fueron al
service, el 409 por numero_documento repetido, el 409 de cliente inactivo, la rn-08 y el 400 si mandan estado
o fecha_cierre en el hito, y las consultas se fueron al repository, que es el unico que sabe como se
guarda y se busca cada cosa

run() es el try catch unico que heredan los controllers de basecontroller, antes cada metodo tenia el suyo
con el mismo catch repetido siete veces por feature, ahora el metodo solo dice que hacer y run() atrapa
cualquier error y lo manda a handleerror, que lo convierte en el codigo y el mensaje correctos, paramid()
lee el id de la ruta y responde 400 si no es un entero positivo, asi no se repite la validacion en cada
metodo y tampoco llega un abc a la base, findorfail() busca el registro y si no existe lanza el 404 en un solo
lugar, antes cada metodo hacia su findbypk y su if para responder not found

el repository es la unica capa que conoce sequelize porque ahi vive todo lo que depende del orm, el where, el
include, el lock y la transaccion, si el service o el controller importaran sequelize, cambiar de orm o
probar una regla sin base de datos obligaria a tocar la logica de negocio, con esa separacion el service
solo pide cosas como buscar un cliente por documento y no sabe como se hace, y la regla se puede probar
con un repository falso, ademas si cambia una consulta se toca un archivo y no tres
---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
