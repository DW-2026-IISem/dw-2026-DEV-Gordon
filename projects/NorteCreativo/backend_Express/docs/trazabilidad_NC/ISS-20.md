> **Workspace:** `backend_Express` (Norte Creativo) · **Pista:** Refactor por capas + Auth con RBAC (ISS-12 a ISS-21) · **Manual base:** sitio del docente (Express 2026) · **SDD:** `docs/sdd.md`

# ISS-20 — Feature session (login, refresh, logout, perfil y permisos)

**Naturaleza:** práctico
**Issue GitHub:** `#20`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-19 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/backend2026/manual/17-ISS-15-auth-session/
**Commit esperado:** `feat(iss-20): sesion login refresh logout perfil Refs #20`

---

## 1. SDD

**OBJ:** Al finalizar, un usuario podrá iniciar sesión, renovar y cerrar su sesión, y consultar su perfil y sus permisos.

**SPEC (qué debe quedar):**
- `features/auth/session/`:
  - **OPEN**: `POST /api/sesion/login` (`identifier` = username o email, `password`) → `access_token` + `refresh_token`; `POST /api/sesion/refresh` (con rotación); `POST /api/sesion/logout`.
  - **JWT**: `GET /api/sesion/perfil` (usuario + roles) y `GET /api/permisos` (concesiones efectivas).
- Credenciales malas → 401 con mensaje genérico (no revela si el usuario existe).
- Reusar un refresh token ya rotado → 401 y revocación según el docente.

**REQ (restricciones):**
- `status` inactive del usuario impide el login.

**AC:**
- [ ] **AC-1** Login de `admin` con contraseña correcta responde 200 con `access_token` y `refresh_token`.
- [ ] **AC-2** Login con contraseña mala y con usuario inexistente responde 401 con el **mismo** mensaje.
- [ ] **AC-3** `POST /api/sesion/refresh` entrega un par nuevo, y reusar el refresh anterior responde 401.
- [ ] **AC-4** Después de `logout`, el refresh token ya no sirve (401).
- [ ] **AC-5** `GET /api/sesion/perfil` devuelve el usuario y sus roles, y `GET /api/permisos` sus concesiones; sin token, 401.
- [ ] **AC-6** `npx tsc --noEmit` sin errores.

**Checklist interno (IA, En curso):**
- [ ] login
- [ ] refresh con rotación
- [ ] logout
- [ ] perfil
- [ ] permisos
- [ ] mensaje genérico

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-20, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-20.md en projects/NorteCreativo/backend_Express.
Aplica el patron por capas (capas HTTP -> Controller -> Service -> Repository -> Model, DTOs por operacion, BaseController.run/paramId,
AppError, findOrFail) adaptado a Norte Creativo.
Puerto 3012, base norte_creativo_express, rutas en español como el docente.

Construye el feature session del docente en src/features/auth/session:
OPEN: POST /api/sesion/login (identifier = username o email + password), POST /api/sesion/refresh (rotacion), POST /api/sesion/logout.
JWT: GET /api/sesion/perfil (usuario + roles) y GET /api/permisos (concesiones efectivas).
Credenciales invalidas -> 401 con el mismo mensaje exista o no el usuario. Usuario inactive no inicia sesion.
Reuso de un refresh ya rotado -> 401 y revocacion segun el docente. Registra rutas y swagger (las OPEN con security: []).

NO protejas todavia las rutas de negocio (ISS-21). Prohibido: NestJS, force: true, secretos en el codigo (JWT_SECRET solo en .env; .env.example sin valores), cambiar el puerto 3012 o la base norte_creativo_express. NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | login OK | AC-1 | ver docs/proceso.md, sección ISS - 20 | `curl -s -X POST localhost:3012/api/sesion/login -H 'Content-Type: application/json' -d '{"identifier":"admin","password":"Admin123!"}'` |
|       | 401 genérico | AC-2 | ver docs/proceso.md, sección ISS - 20 | login con contraseña mala y con usuario `noexiste` |
|       | rotación y reuso | AC-3 | ver docs/proceso.md, sección ISS - 20 | `POST /api/sesion/refresh` dos veces con el mismo refresh |
|       | logout | AC-4 | ver docs/proceso.md, sección ISS - 20 | `POST /api/sesion/logout` y luego refresh con ese token |
|       | perfil y permisos | AC-5 | ver docs/proceso.md, sección ISS - 20 | `curl -s -H "Authorization: Bearer $TOKEN" localhost:3012/api/sesion/perfil` y `/api/permisos` |
|       | compilación | AC-6 | ver docs/proceso.md, sección ISS - 20 | `npx tsc --noEmit` |

**Commit (hash):** `feat(iss-20): sesion login refresh logout perfil Refs #20`
**Autoevaluación de AC:** completado

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué el mensaje de error del login es el mismo exista o no el usuario?». «¿Qué pasa paso a paso en un refresh con rotación?». «¿Por qué login, refresh y logout son OPEN?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

el mensaje del login es el mismo exista o no el usuario porque si dijera usuario no existe en un caso y contraseña incorrecta en el otro, cualquiera podria probar nombres y correos hasta encontrar los que si existen, y despues atacar solo esas cuentas, con un mensaje unico credenciales invalidas el atacante no aprende nada de la respuesta, por eso el ac-2 compara las dos respuestas con diff y tienen que salir identicas, mismo codigo 401 y mismo cuerpo, y por la misma razon un usuario inactive tambien recibe ese mismo 401

un refresh con rotacion pasa asi, el cliente manda su refresh token, el servidor calcula el sha256 y busca ese hash en refresh_tokens, comprueba que la fila exista, que este active, que no haya vencido y que no este revocada, si algo falla responde 401, si todo esta bien marca esa fila como usada y revocada, crea una fila nueva con otro token aleatorio dentro de la misma familia (family_id), guarda solo su hash, y devuelve un access token nuevo con el refresh nuevo, el token viejo ya no sirve, y si alguien presenta un token que ya fue rotado, el servidor entiende que hay dos copias del mismo token y revoca toda la familia, por eso en el ac-3 el refresh que salio de la rotacion tambien da 401 despues del reuso

login, refresh y logout son open porque quien los usa todavia no tiene un access token valido, en el login el usuario aun no se ha identificado, en el refresh el access token ya vencio y por eso se pide uno nuevo, y en el logout lo que prueba quien eres es el propio refresh token que viene en el body, no un jwt, perfil y permisos si son jwt porque ahi ya hay que estar identificado, y no son jwt mas rbac porque cualquier usuario autenticado puede ver su propio perfil y sus propios permisos sin importar su rol

ajuste: queda pendiente confirmar contra el codigo si cuando el usuario no existe igual se hace una comparacion de contraseña contra un hash de relleno para que el tiempo de respuesta no delate que el usuario no existe
---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
