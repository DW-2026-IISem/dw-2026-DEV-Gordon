> **Workspace:** `backend_Express` (Norte Creativo) · **Pista:** Refactor por capas + Auth con RBAC (ISS-12 a ISS-21) · **Manual base:** sitio del docente (Express 2026) · **SDD:** `docs/sdd.md`

# ISS-18 — Middlewares de acceso y las 3 modalidades

**Naturaleza:** práctico
**Issue GitHub:** `#18`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-17 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/backend2026/manual/15-ISS-13-auth-access/
**Commit esperado:** `feat(iss-18): middlewares authenticate y authorize Refs #18`

---

## 1. SDD

**OBJ:** Al finalizar, cada ruta podrá declararse OPEN, JWT o JWT + RBAC, y sin concesión explícita el acceso se niega con 403.

**SPEC (qué debe quedar):**
- `features/auth/access/authenticate.middleware.ts`: valida el access token (401 sin token, token mal formado, firma inválida o vencido) y deja el usuario en la petición.
- `features/auth/access/authorize.middleware.ts`: busca una concesión activa del `(method, path)` para los roles activos del usuario usando `resource-match`; si no hay, **403** (deny by default); sin caché.
- Se aplican `authenticate, authorize` a las rutas de administración: usuarios, roles, recursos, asignaciones y concesiones.
- Las rutas de negocio se protegen en ISS-21.

**REQ (restricciones):**
- No hay login todavía: para probar se firma un token con el helper `jwt.ts` (script de desarrollo).

**AC:**
- [x] **AC-1** Sin token, `GET /api/usuarios` responde 401.
- [x] **AC-2** Con un token mal formado o alterado responde 401.
- [x] **AC-3** Con un token válido de `finanzas` (sin concesión sobre usuarios) responde 403.
- [x] **AC-4** Con un token válido de `admin` responde 200.
- [x] **AC-5** Dar o retirar una concesión con `/api/concesiones-rol` cambia el resultado en la siguiente petición, sin reiniciar el servidor.
- [x] **AC-6** `npx tsc --noEmit` sin errores.

**Checklist interno (IA, En curso):**
- [x] authenticate
- [x] authorize
- [x] resource-match
- [x] rutas de administración protegidas
- [x] script de token de desarrollo

---

## 2. Revisión de AC

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

---

## 3. IA usada

**Herramienta / modelo:** Claude Code - Sonnet 5.5

**Fecha:** 4/10/26

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-18, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-18.md en projects/NorteCreativo/backend_Express.
Aplica el patron por capas (capas HTTP -> Controller -> Service -> Repository -> Model, DTOs por operacion, BaseController.run/paramId,
AppError, findOrFail) adaptado a Norte Creativo.
Puerto 3012, base norte_creativo_express, rutas en español como el docente.

Construye los middlewares authenticate y authorize del docente en src/features/auth/access y aplica las 3 modalidades:
protege con authenticate + authorize las rutas de usuarios, roles, recursos, asignaciones-rol y concesiones-rol.
authorize: deny by default (403), consulta la matriz en cada peticion, sin cache.
Crea scripts/dev-token.ts que imprima un access token valido para un username dado (admin, finanzas, etc.), usando el helper jwt;
solo para pruebas locales, lee el secreto del .env.

NO protejas todavia las rutas de negocio (ISS-21). Prohibido: NestJS, force: true, secretos en el codigo (JWT_SECRET solo en .env; .env.example sin valores), cambiar el puerto 3012 o la base norte_creativo_express. NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | 401 sin token | AC-1 | ver docs/proceso.md, sección ISS - 18 | `curl -i localhost:3012/api/usuarios` |
|       | 401 token alterado | AC-2 | ver docs/proceso.md, sección ISS - 18 | `curl -i -H 'Authorization: Bearer abc.def.ghi' localhost:3012/api/usuarios` |
|       | 403 sin concesión | AC-3 | ver docs/proceso.md, sección ISS - 18 | `TOKEN=$(npx ts-node scripts/dev-token.ts finanzas); curl -i -H "Authorization: Bearer $TOKEN" localhost:3012/api/usuarios` |
|       | 200 con concesión | AC-4 | ver docs/proceso.md, sección ISS - 18 | mismo comando con `admin` |
|       | efecto inmediato | AC-5 | ver docs/proceso.md, sección ISS - 18 | conceder `GET /api/usuarios` a FINANZAS y repetir AC-3 |
|       | compilación | AC-6 | ver docs/proceso.md, sección ISS - 18 | `npx tsc --noEmit` |

**Commit (hash):** `feat(iss-18): middlewares authenticate y authorize Refs #18`
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Qué diferencia hay entre 401 y 403 y quién responde cada uno?». «¿Qué significa deny by default?». «¿Por qué authorize no cachea la matriz?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

la diferencia es que 401 es no se quien eres y 403 es se quien eres pero no tienes permiso, el 401 lo responde authenticate cuando no hay token, esta mal formado, la firma no coincide o esta vencido, o sea cuando no puede comprobar la identidad, y el 403 lo responde authorize cuando el token es valido y el usuario si esta identificado pero ninguno de sus roles activos tiene una concesion activa para ese metodo y ese path, por eso en el ac-3 finanzas recibe 403 y no 401, su token esta bien, lo que no tiene es permiso sobre usuarios, y el orden importa, authenticate corre primero y deja el usuario en la peticion, y authorize solo corre si ya hay usuario

deny by default significa que el acceso esta negado a menos que exista una concesion explicita que lo permita, no hay una lista de rutas prohibidas, hay una lista de rutas permitidas, entonces si manana se agrega un endpoint nuevo y nadie le crea el recurso ni la concesion, queda cerrado para todos en vez de abierto por olvido, y el error de configuracion se ve como un 403 y no como un hueco de seguridad

authorize no cachea la matriz porque el ac-5 pide que dar o retirar una concesion cambie el resultado en la siguiente peticion sin reiniciar el servidor, si guardara las concesiones en memoria, retirarle un permiso a un rol seguiria funcionando hasta que el cache se venciera o se reiniciara el servidor, y eso es justo lo contrario de lo que se quiere cuando se revoca un acceso, el costo es una consulta a la base por cada peticion protegida, que en este proyecto es aceptable y mas simple que invalidar un cache

ajuste: queda pendiente confirmar contra el codigo que el 401 sale solo de authenticate y el 403 solo de authorize, y que authorize consulta la base en cada peticion y no guarda nada en memoria
---

## 6. Gate

**Estado:** completado
**Conclusión:** completado
**Trazabilidad final:** completado
