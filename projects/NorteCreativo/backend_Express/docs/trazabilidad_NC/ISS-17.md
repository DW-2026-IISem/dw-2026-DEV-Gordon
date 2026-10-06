> **Workspace:** `backend_Express` (Norte Creativo) · **Pista:** Refactor por capas + Auth con RBAC (ISS-12 a ISS-21) · **Manual base:** sitio del docente (Express 2026) · **SDD:** `docs/sdd.md`

# ISS-17 — Features role-users y resource-roles (asignaciones y concesiones)

**Naturaleza:** práctico
**Issue GitHub:** `#17`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-16 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/backend2026/manual/14-ISS-12-auth-role-users-resource-roles/
**Commit esperado:** `feat(iss-17): asignaciones de rol y concesiones Refs #17`

---

## 1. SDD

**OBJ:** Al finalizar, cada usuario tendrá su rol y cada rol sus concesiones según la matriz de Norte Creativo, con asignar, retirar y reactivar.

**SPEC (qué debe quedar):**
- `features/auth/role-users/` (API `/api/asignaciones-rol`) y `features/auth/resource-roles/` (API `/api/concesiones-rol`).
- Asignar, retirar (lógico) y **reactivar** sin duplicar filas; `reconcileRole` del docente.
- Seeders: cada usuario sembrado recibe su rol, y cada rol recibe las concesiones de la **matriz** del README:
  - **ADMIN**: todos los recursos.
  - **CUENTAS**: clientes (lectura), campanias, hitos y tareas (CRUD), entregables, versiones y aprobaciones (lectura).
  - **CREATIVO**: campanias, hitos y tareas (lectura), entregables y versiones (crear, leer, actualizar).
  - **CLIENTE_APROBADOR**: campanias, hitos, entregables y versiones (lectura); aprobaciones (POST y GET).
  - **FINANZAS**: clientes, campanias e hitos (lectura).

**REQ (restricciones):**
- La matriz es una decisión de diseño a partir de los actores del SDD (§3); registrarla en `proceso.md` y en el SDD.

**AC:**
- [x] **AC-1** `npm run db:seed` deja 5 asignaciones (una por usuario) y reejecutarlo no duplica.
- [x] **AC-2** El número de concesiones por rol coincide con la matriz.
- [x] **AC-3** Retirar una asignación la deja `inactive` y reasignarla la reactiva sin crear otra fila.
- [x] **AC-4** `GET /api/concesiones-rol?role_id=<id>` lista las concesiones de ese rol.
- [x] **AC-5** Una asignación o concesión repetida no crea duplicados (índice único).
- [x] **AC-6** `npx tsc --noEmit` sin errores.

**Checklist interno (IA, En curso):**
- [x] role-users por capas
- [x] resource-roles por capas
- [x] reactivar sin duplicar
- [x] reconcileRole
- [x] seeders con la matriz

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-17, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-17.md en projects/NorteCreativo/backend_Express.
Aplica el patron por capas (capas HTTP -> Controller -> Service -> Repository -> Model, DTOs por operacion, BaseController.run/paramId,
AppError, findOrFail) adaptado a Norte Creativo.
Puerto 3012, base norte_creativo_express, rutas en español como el docente.

Construye role-users (/api/asignaciones-rol) y resource-roles (/api/concesiones-rol) del docente en src/features/auth,
con asignar, retirar (logico), reactivar sin duplicar filas y reconcileRole.
Seeders: cada usuario sembrado (admin, cuentas, creativo, aprobador, finanzas) recibe su rol; cada rol recibe exactamente las
concesiones de esta matriz (expresada sobre resource-catalog.ts):
ADMIN: todo. CUENTAS: clientes lectura; campanias, hitos y tareas CRUD; entregables, version-entregables y aprobaciones lectura.
CREATIVO: campanias, hitos y tareas lectura; entregables y version-entregables crear, leer y actualizar.
CLIENTE_APROBADOR: campanias, hitos, entregables y version-entregables lectura; aprobaciones POST y GET.
FINANZAS: clientes, campanias e hitos lectura.
Agrega la matriz como tabla al README del backend.

NO crees middlewares (ISS-18). Prohibido: NestJS, force: true, secretos en el codigo (JWT_SECRET solo en .env; .env.example sin valores), cambiar el puerto 3012 o la base norte_creativo_express. NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | asignaciones | AC-1 | ver docs/proceso.md, sección ISS - 17 | `npm run db:seed` ×2 + `docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT COUNT(*) FROM role_users;"` |
|       | concesiones por rol | AC-2 | ver docs/proceso.md, sección ISS - 17 | `docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT r.name, COUNT(*) FROM resource_roles rr JOIN roles r ON r.id=rr.role_id GROUP BY r.name;"` |
|       | retirar y reactivar | AC-3 | ver docs/proceso.md, sección ISS - 17 | PATCH de retiro y POST de reasignación + `SELECT` de la fila |
|       | filtro por rol | AC-4 | ver docs/proceso.md, sección ISS - 17 | `curl -s 'localhost:3012/api/concesiones-rol?role_id=2'` |
|       | sin duplicados | AC-5 | ver docs/proceso.md, sección ISS - 17 | repetir un POST de asignación |
|       | compilación | AC-6 | ver docs/proceso.md, sección ISS - 17 | `npx tsc --noEmit` |

**Commit (hash):** feat(iss-17): asignaciones de rol y concesiones Refs #17
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «Explica la matriz: ¿por qué CREATIVO no puede aprobar y FINANZAS solo lee?». «¿Por qué retirar es lógico y reasignar reactiva en vez de crear?». «¿Qué hace `reconcileRole`?»


| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

creativo no puede aprobar porque aprobar es una decision del lado del cliente, en el flujo de norte creativo la aprobacion la hace cliente_aprobador y es la que puede cerrar el hito, si el creativo pudiera aprobar sus propios entregables se estaria aprobando a si mismo y la regla de cierre del hito dejaria de significar algo, por eso en la matriz el creativo tiene los recursos de tareas, entregables y version-entregables pero no el post de aprobaciones, y finanzas solo lee porque su trabajo es ver el estado de campañas e hitos para facturar, no modificar nada del trabajo creativo ni del flujo de aprobacion, entonces solo tiene los get, y asi si su cuenta se compromete lo maximo que se puede hacer es consultar

retirar es logico y no un borrado porque la fila de la concesion queda en la tabla con un estado inactivo, asi se conserva el historial de que ese rol tuvo ese permiso, y reasignar reactiva esa misma fila en vez de crear otra porque el indice unico (role_id, resource_id) no permite dos filas del mismo permiso, si se intentara crear de nuevo daria error de duplicado, entonces lo correcto es buscar la fila existente y volverla a activar, y asi nunca hay dos filas para el mismo rol y recurso

reconcileRole toma un rol y la lista de recursos que la matriz dice que debe tener, la compara contra lo que hay en la base, y deja la base igual a la matriz, concede lo que falta, reactiva lo que estaba retirado y retira lo que ya no deberia tener, es la misma idea del seeder reconciliador de iss-16, correrlo dos veces da el mismo resultado, y por eso la matriz queda como unica fuente de verdad de los permisos

ajuste: ninguno por ahora, queda pendiente confirmar contra el codigo que reconcileRole retire con estado inactivo y no con delete
---

## 6. Gate

**Estado:** completado
**Conclusión:** completado
**Trazabilidad final:** completado
