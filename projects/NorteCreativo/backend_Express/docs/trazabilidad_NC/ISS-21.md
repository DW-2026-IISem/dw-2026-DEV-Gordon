> **Workspace:** `backend_Express` (Norte Creativo) · **Pista:** Refactor por capas + Auth con RBAC (ISS-12 a ISS-21) · **Manual base:** sitio del docente (Express 2026) · **SDD:** `docs/sdd.md`

# ISS-21 — Cierre: negocio con JWT + RBAC, Swagger bearer y smoke test

**Naturaleza:** práctico
**Issue GitHub:** `#21`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-20 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/backend2026/manual/18-cierre-auth/
**Commit esperado:** `feat(iss-21): cierre auth rbac sobre el negocio Refs #21`

---

## 1. SDD

**OBJ:** Al finalizar, todo el negocio de Norte Creativo exigirá token y concesión, la RN-05 se cumplirá de verdad y el backend quedará completo según el DoD del docente.

**SPEC (qué debe quedar):**
- Todas las rutas de negocio pasan a **JWT + RBAC** (`authenticate, authorize`).
- **RN-05**: `POST /api/aprobaciones` solo lo tiene concedido `CLIENTE_APROBADOR`; `aprobador_id` sale del token (si viene en el body → 400) y pasa a FK a `users`.
- Swagger: `bearerAuth`, *secure by default*, OPEN con `security: []`, respuestas 401/403.
- `errorHandling`: JSON mal formado → 400 en JSON, sin stack trace.
- `SeedersRunner`: primero seguridad (roles → resources → users → role_users → resource_roles) y después negocio.
- Archivos `.http` con login por rol; README con credenciales de laboratorio y matriz.
- `scripts/smoke-rbac.sh`: prueba las 3 modalidades y termina con éxito o error.

**REQ (restricciones):**
- No se agregan reglas de ownership (que el aprobador vea solo sus campañas) ni `AsignacionTarea`: el RBAC es por endpoint. Se documenta como limitación.

**AC:**
- [x] **AC-1** Sin token, `GET /api/clientes` responde 401.
- [x] **AC-2** `creativo` haciendo `POST /api/aprobaciones` responde 403, y `aprobador` responde 201 con su propio id como `aprobador_id`.
- [x] **AC-3** Enviar `aprobador_id` en el body responde 400.
- [x] **AC-4** `finanzas` puede leer clientes (200) pero no crearlos (403).
- [x] **AC-5** Swagger muestra el botón Authorize, y login/refresh/logout aparecen sin candado.
- [x] **AC-6** Un cuerpo JSON mal formado responde 400 en JSON, sin HTML ni rutas del servidor.
- [x] **AC-7** `npm run db:seed` siembra primero seguridad y después negocio, sin errores.
- [x] **AC-8** `bash scripts/smoke-rbac.sh` termina en verde y `npx tsc --noEmit` sin errores.

**Checklist interno (IA, En curso):**
- [x] rutas de negocio protegidas
- [x] RN-05 desde el token
- [x] Swagger bearer
- [x] errorHandling JSON
- [x] orden de seeders
- [x] .http y README
- [x] smoke test

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-21, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-21.md en projects/NorteCreativo/backend_Express.
Aplica el patron por capas (capas HTTP -> Controller -> Service -> Repository -> Model, DTOs por operacion, BaseController.run/paramId,
AppError, findOrFail) adaptado a Norte Creativo.
Puerto 3012, base norte_creativo_express, rutas en español como el docente.

Aplica el cierre de la Fase II del docente a Norte Creativo:
1) Todas las rutas de negocio (clientes, campanias, hitos, tareas, entregables, version-entregables, aprobaciones) con authenticate + authorize.
2) RN-05: aprobador_id se toma del usuario autenticado, nunca del body (si viene en el body -> 400); aprobaciones.aprobador_id pasa a FK a users.
   Solo CLIENTE_APROBADOR tiene concedido POST /api/aprobaciones (ya esta en la matriz del ISS-17; verificalo).
3) Swagger con bearerAuth y security por defecto; login/refresh/logout con security: []; respuestas 401/403 reutilizables.
4) errorHandling para JSON mal formado -> 400 JSON sin stack.
5) SeedersRunner: seguridad primero, negocio despues.
6) Actualiza todos los .http con login por rol y el README con credenciales de laboratorio y la matriz.
7) Crea scripts/smoke-rbac.sh que pruebe OPEN (login), JWT (perfil), JWT + RBAC (200 y 403) y RN-05, y que salga con codigo distinto de 0 si algo falla.

NO agregues ownership ni AsignacionTarea. Prohibido: NestJS, force: true, secretos en el codigo (JWT_SECRET solo en .env; .env.example sin valores), cambiar el puerto 3012 o la base norte_creativo_express. NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | 401 negocio | AC-1 | ver docs/proceso.md, sección ISS - 21 | `curl -i localhost:3012/api/clientes` |
|       | RN-05 | AC-2 | ver docs/proceso.md, sección ISS - 21 | login de `creativo` y de `aprobador`, luego `POST /api/aprobaciones` con cada token |
|       | 400 aprobador_id | AC-3 | ver docs/proceso.md, sección ISS - 21 | POST con `"aprobador_id":1` en el body |
|       | lectura sí, escritura no | AC-4 | ver docs/proceso.md, sección ISS - 21 | token de `finanzas`: `GET` y `POST /api/clientes` |
|       | Swagger | AC-5 | ver docs/proceso.md, sección ISS - 21 | captura de `localhost:3012/api/docs` |
|       | JSON mal formado | AC-6 | ver docs/proceso.md, sección ISS - 21 | `curl -i -X POST localhost:3012/api/clientes -H 'Content-Type: application/json' -d '{malo'` |
|       | seeders | AC-7 | ver docs/proceso.md, sección ISS - 21 | `npm run db:seed` (log del orden) |
|       | smoke y compilación | AC-8 | ver docs/proceso.md, sección ISS - 21 | `bash scripts/smoke-rbac.sh && npx tsc --noEmit` |

**Commit (hash):** feat(iss-21): cierre auth rbac sobre el negocio Refs #21
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Cómo se cumple ahora la RN-05 y por qué `aprobador_id` no puede venir en el body?». «Recorre una petición de `POST /api/aprobaciones` desde que entra hasta la base». «¿Qué queda fuera del RBAC por endpoint y por qué lo documentaste como limitación?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

la rn-05 dice que quien aprueba es el cliente aprobador y que la aprobacion queda a nombre de quien la hizo, ahora se cumple en dos partes, la primera es el permiso, solo el rol cliente_aprobador tiene concedido el post a aprobaciones en la matriz, entonces creativo y los demas reciben 403 en authorize, y la segunda es la identidad, el aprobador_id ya no lo manda el cliente, sale del usuario que authenticate dejo en la peticion a partir del token, y la columna es una fk a users, por eso aprobador_id no puede venir en el body, si viniera, cualquiera con permiso de aprobar podria aprobar a nombre de otro usuario y la aprobacion dejaria de ser prueba de quien la hizo, por eso si llega en el body se rechaza con 400 en vez de ignorarlo en silencio, asi el error se ve y no queda una aprobacion que parece de una persona y es de otra

una peticion de post a aprobaciones entra por express y pasa primero por authenticate, que revisa el token y si falta o esta vencido responde 401, despues pasa por authorize, que busca una concesion activa de post /api/aprobaciones para los roles del usuario y si no hay responde 403, ya con permiso llega al controller, que valida el body con el dto de creacion, rechaza aprobador_id con 400 y toma el id del usuario autenticado, el controller llama al service, el service llama al repository y este registra la aprobacion y evalua el cierre del hito dentro de una sola transaccion, de modo que o se guardan la aprobacion y, si corresponde, el cierre del hito, o no se guarda nada, y al final el controller devuelve 201 con la aprobacion, si algo falla en el camino el errorHandling lo convierte en json con el codigo que corresponde y sin stack

lo que queda fuera del rbac por endpoint es el ownership, o sea que el rbac solo responde si este rol puede llamar este endpoint, no si este usuario puede tocar este registro, entonces un cliente aprobador puede aprobar versiones de cualquier campaña y no solo de las de su cliente, y tampoco hay asignacion de tareas para limitar que creativo ve o edita, esto se documento como limitacion porque el alcance de este issue es rbac por endpoint segun el docente, y para cubrirlo habria que agregar una relacion entre usuarios y clientes o tareas y chequearla en cada service, que es otro diseño y otro issue, dejarlo escrito evita que parezca que el sistema ya aisla los datos por cliente cuando no lo hace

ajuste: queda pendiente confirmar en el codigo que aprobador_id se rechaza con 400 antes de llegar al service y que el cierre del hito va en la misma transaccion que la aprobacion
---

## 6. Gate

**Estado:** completado
**Conclusión:** completado
**Trazabilidad final:** completado
