> **Workspace:** `backend_Express` (Norte Creativo) · **Pista:** Refactor por capas + Auth con RBAC (ISS-12 a ISS-21) · **Manual base:** sitio del docente (Express 2026) · **SDD:** `docs/sdd.md`

# ISS-14 — Auth base: seguridad compartida y modelos RBAC

**Naturaleza:** práctico
**Issue GitHub:** `#14`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-13 en **Hecho** (o ISS-11 si el docente no pide refactor)
**Página del docente:** https://tecnogua.com/academic/site/backend2026/manual/11-ISS-09-auth-base/
**Commit esperado:** `feat(iss-14): auth base modelos rbac y helpers Refs #14`

---

## 1. SDD

**OBJ:** Al finalizar, existirán las 6 tablas de identidad y los helpers de contraseña y JWT, listos para construir los features de auth.

**SPEC (qué debe quedar):**
- Dependencias `jsonwebtoken` y `bcryptjs` (+ tipos).
- `.env.example` con `JWT_SECRET=`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL_DAYS` (sin valor real del secreto); `.env` local con el secreto.
- `src/shared/auth/`: `password.ts` (hash/verify), `jwt.ts` (firma/verifica HS256 con `iss`, `aud`, `exp`, `jti`), `resource-match.ts`, `auth-user.ts`.
- Modelos en `src/features/auth/`: `users/`, `roles/`, `resources/`, `role-users/`, `resource-roles/`, `refresh-tokens/`, y `rbac.associations.ts` importado en config antes del `sync`.
- Índices únicos: `users` (username, email), `roles` (name), `resources` (method, path), `role_users` (user_id, role_id), `resource_roles` (role_id, resource_id).
- Si `src/shared/` no existe (sin refactor), se crea aquí igual que en ISS-12.

**REQ (restricciones):**
- Todavía no hay rutas de auth ni middlewares.
- No existe entidad `Permission`: el permiso es la fila de `resource_roles`.

**AC:**
- [x] **AC-1** `package.json` incluye `jsonwebtoken` y `bcryptjs`; `.env.example` tiene las 3 variables JWT sin el secreto real y `.env` no aparece en `git status`.
- [x] **AC-2** Al arrancar se crean las tablas `users`, `roles`, `resources`, `role_users`, `resource_roles` y `refresh_tokens`.
- [x] **AC-3** `SHOW CREATE TABLE` de `role_users` y `resource_roles` muestra las FK y el índice único compuesto.
- [x] **AC-4** Un token firmado con `jwt.ts` se verifica bien, y uno alterado o vencido falla.
- [x] **AC-5** `hash` y `verify` de `password.ts` funcionan: la contraseña correcta da `true` y una incorrecta `false`.
- [x] **AC-6** `npx tsc --noEmit` sin errores.

**Checklist interno (IA, En curso):**
- [x] dependencias y .env
- [x] shared/auth
- [x] 6 modelos
- [x] rbac.associations
- [x] índices únicos

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-14, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-14.md en projects/NorteCreativo/backend_Express.
Aplica el patron por capas (capas HTTP -> Controller -> Service -> Repository -> Model, DTOs por operacion, BaseController.run/paramId,
AppError, findOrFail) adaptado a Norte Creativo.
Puerto 3012, base norte_creativo_express, rutas en español como el docente.

Crea la base de seguridad del docente (seccion Auth base) para Norte Creativo:
dependencias jsonwebtoken y bcryptjs con tipos; variables JWT_SECRET, JWT_ACCESS_TTL y JWT_REFRESH_TTL_DAYS en .env.example (sin valor
para JWT_SECRET) y en .env (genera un secreto aleatorio largo SOLO en .env); src/shared/auth (password, jwt HS256 con iss/aud/exp/jti,
resource-match, auth-user) y los 6 modelos en src/features/auth con rbac.associations.ts importado en config antes del sync.
Si src/shared no existe todavia, crealo igual que el ISS-03 del docente (app-error, base-controller, with-transaction).
Incluye un script de desarrollo scripts/check-auth-base.ts que firme y verifique un token y pruebe hash/verify, para la evidencia.

NO crees rutas ni middlewares todavia. Prohibido: NestJS, force: true, secretos en el codigo (JWT_SECRET solo en .env; .env.example sin valores), cambiar el puerto 3012 o la base norte_creativo_express. NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | dependencias y env | AC-1 | ver docs/proceso.md, sección ISS - 14 | `grep -n "jsonwebtoken\|bcryptjs" package.json && cat .env.example && git status --short | grep "\.env$"` |
|       | tablas | AC-2 | ver docs/proceso.md, sección ISS - 14 | `docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SHOW TABLES;"` |
|       | FK e índices | AC-3 | ver docs/proceso.md, sección ISS - 14 | `docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SHOW CREATE TABLE role_users\G SHOW CREATE TABLE resource_roles\G"` |
|       | jwt y password | AC-4, AC-5 | ver docs/proceso.md, sección ISS - 14 | `npx ts-node scripts/check-auth-base.ts` |
|       | compilación | AC-6 | ver docs/proceso.md, sección ISS - 14 | `npx tsc --noEmit` |

**Commit (hash):** `feat(iss-14): auth base modelos rbac y helpers Refs #14`
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué el permiso es una fila de `resource_roles` y no una entidad `Permission`?». «¿Para qué sirven `iss`, `aud`, `exp` y `jti` en el token?». «¿Por qué el secreto va solo en `.env`?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

el permiso es una fila de resource_roles y no una entidad permission porque un recurso ya es method mas path, o sea ya describe exactamente la accion que se quiere proteger, y la fila de resource_roles ya dice que rol puede usar ese recurso, esa fila es el permiso, una tabla permission en medio no agregaria ningun dato nuevo, solo seria otra tabla que repite lo que ya dice resources, y habria que mantener un join mas en cada consulta, ademas el indice unico (role_id, resource_id) garantiza que un rol no tenga el mismo permiso dos veces, y quitarle un permiso a un rol es borrar una sola fila

iss, aud, exp y jti sirven para que el token no se pueda usar en cualquier lado ni para siempre, iss dice quien emitio el token, o sea mi backend, aud dice para quien esta hecho, o sea para esta api, asi si llega un token firmado con el mismo secreto pero hecho para otro servicio se rechaza, exp es la fecha de vencimiento, un token robado deja de servir cuando vence, y jti es un identificador unico de cada token, sirve para poder reconocerlo y revocarlo, por ejemplo con los refresh tokens que se guardan en la tabla refresh_tokens, sin jti no habria como decir este token en especifico ya no vale

el secreto va solo en .env porque el jwt_secret es lo que permite firmar tokens, quien lo tenga puede fabricar un token valido con el rol que quiera, incluso admin, y entrar sin contraseña, si estuviera escrito en el codigo se iria al repositorio y quedaria en el historial de git aunque despues se borre, por eso .env esta en .gitignore y en .env.example solo queda la variable sin valor, asi quien clone el proyecto sabe que la tiene que crear pero nunca ve el mio, ademas asi se puede cambiar el secreto en cada entorno, desarrollo y produccion, sin tocar una linea de codigo

---

## 6. Gate

**Estado:** completado
**Conclusión:** completado
**Trazabilidad final:**
