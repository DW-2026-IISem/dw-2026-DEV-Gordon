> **Workspace:** `backend_Express` (Norte Creativo) · **Pista:** Refactor por capas + Auth con RBAC (ISS-12 a ISS-21) · **Manual base:** sitio del docente (Express 2026) · **SDD:** `docs/sdd.md`

# ISS-16 — Features roles y resources (catálogo de endpoints)

**Naturaleza:** práctico
**Issue GitHub:** `#16`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-15 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/backend2026/manual/13-ISS-11-auth-roles-resources/
**Commit esperado:** `feat(iss-16): features roles y resources Refs #16`

---

## 1. SDD

**OBJ:** Al finalizar, existirán los 5 roles de Norte Creativo y un recurso por cada endpoint protegible, sembrados de forma determinista.

**SPEC (qué debe quedar):**
- `features/auth/roles/` (API `/api/roles`) y `features/auth/resources/` (API `/api/recursos`), por capas.
- Roles: `ADMIN`, `CUENTAS`, `CREATIVO`, `CLIENTE_APROBADOR`, `FINANZAS`.
- `resource-catalog.ts`: un recurso `(method, path)` por cada endpoint de negocio (clientes, campanias, hitos, tareas, entregables, version-entregables, aprobaciones) y de administración de seguridad (usuarios, roles, recursos, asignaciones, concesiones). Paths con `:id`.
- Seeders **reconciliadores**: reejecutarlos deja exactamente el catálogo.
- `(method, path)` único (409); nombre de rol único (409).

**REQ (restricciones):**
- Las concesiones (qué rol tiene qué recurso) se definen en ISS-17.

**AC:**
- [x] **AC-1** `npm run db:seed` deja 5 roles con los nombres exactos.
- [x] **AC-2** El número de filas de `resources` es igual al número de entradas de `resource-catalog.ts`.
- [x] **AC-3** Reejecutar el seed no cambia los conteos.
- [x] **AC-4** Un rol con nombre repetido responde 409, y un recurso con `(method, path)` repetido también.
- [x] **AC-5** `GET /api/recursos` lista los recursos de los 7 features de negocio y de los 5 de administración.
- [x] **AC-6** `npx tsc --noEmit` sin errores.

**Checklist interno (IA, En curso):**
- [x] roles por capas
- [x] resources por capas
- [x] resource-catalog.ts
- [x] seeders reconciliadores

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-16, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-16.md en projects/NorteCreativo/backend_Express.
Aplica el patron por capas (capas HTTP -> Controller -> Service -> Repository -> Model, DTOs por operacion, BaseController.run/paramId,
AppError, findOrFail) adaptado a Norte Creativo.
Puerto 3012, base norte_creativo_express, rutas en español como el docente.

Construye los features roles (/api/roles) y resources (/api/recursos) del docente en src/features/auth.
Roles de Norte Creativo: ADMIN, CUENTAS, CREATIVO, CLIENTE_APROBADOR, FINANZAS.
Crea resource-catalog.ts con un recurso (method, path) por CADA endpoint real del backend: lee src/routes y los *.routes.ts de
features/business y features/auth para no olvidar ninguno (usa :id en los paths). Seeders deterministas y reconciliadores.
Unicidad: nombre de rol y (method, path) -> 409.

NO crees concesiones (ISS-17). Prohibido: NestJS, force: true, secretos en el codigo (JWT_SECRET solo en .env; .env.example sin valores), cambiar el puerto 3012 o la base norte_creativo_express. NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | roles | AC-1 | ver docs/proceso.md, sección ISS - 16 | `npm run db:seed && docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT name FROM roles;"` |
|       | recursos | AC-2 | ver docs/proceso.md, sección ISS - 16 | `docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT COUNT(*) FROM resources;"` y contar entradas del catálogo |
|       | idempotencia | AC-3 | ver docs/proceso.md, sección ISS - 16 | `npm run db:seed` ×2 + los mismos conteos |
|       | HTTP 409 | AC-4 | ver docs/proceso.md, sección ISS - 16 | `curl -i -X POST localhost:3012/api/roles -H 'Content-Type: application/json' -d '{"name":"ADMIN"}'` |
|       | listado | AC-5 | ver docs/proceso.md, sección ISS - 16 | `curl -s localhost:3012/api/recursos` |
|       | compilación | AC-6 | ver docs/proceso.md, sección ISS - 16 | `npx tsc --noEmit` |

**Commit (hash):** `feat(iss-16): features roles y resources Refs #16`
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué los recursos se definen en código y no a mano en la base?». «¿Qué significa que un seeder sea reconciliador?». «¿Cómo das de alta un permiso nuevo sin desplegar código?»


| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

los recursos se definen en codigo, en resource-catalog.ts, porque un recurso es un endpoint real que existe en el backend, y la lista de endpoints solo la conoce el codigo, si se crearan a mano en la base podria haber recursos que apuntan a rutas que no existen o rutas reales sin recurso, y esas quedarian sin proteger o sin poder asignarse, ademas el catalogo queda en git, entonces se puede revisar, versionar y es igual en desarrollo y en produccion, y el seeder lo lleva a la base cada vez que corre

un seeder reconciliador es el que deja la base igual al catalogo, no solo agrega lo que falta, tambien corrige lo que cambio y quita lo que ya no esta en el catalogo, entonces correrlo dos veces o diez da el mismo resultado, a diferencia de un seeder que solo inserta, que con el tiempo deja duplicados o recursos viejos de endpoints que ya no existen, por eso el ac-3 compara los conteos antes y despues de correr el seed dos veces

un permiso nuevo sin desplegar codigo se da de alta con la api, creando el recurso con post a /api/recursos y despues concediendolo al rol que corresponda, eso se hace con las concesiones de iss-17, pero solo sirve para una ruta que ya existe en el backend, un endpoint nuevo si necesita codigo y deploy, y ahi lo correcto es agregarlo tambien a resource-catalog.ts

ajuste: un recurso creado a mano por la api que no este en el catalogo lo borraria el seeder reconciliador la proxima vez que corra, y ademas haria que el ac-2 deje de coincidir, por eso en este proyecto los recursos nuevos se agregan al catalogo y la api queda para consultar y para las concesiones
---

## 6. Gate

**Estado:** Completado
**Conclusión:** Completado
**Trazabilidad final:**

