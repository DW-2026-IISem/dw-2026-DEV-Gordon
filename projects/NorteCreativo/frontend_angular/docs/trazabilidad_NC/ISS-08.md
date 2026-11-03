> **Workspace:** `frontend` (Norte Creativo) · **Pista:** Fase II — Auth con RBAC (ISS-08 a ISS-11) · **Guía base:** `guia_front.docx` + https://tecnogua.com/academic/site/frontend2026/express/ · **Backend:** `backend_Express` (puerto 3012, `AUTH_ENABLED=true`)

# ISS-08 — Autenticación JWT, perfil y permisos efectivos

**Naturaleza:** práctico
**Issue GitHub:** `#NN`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-07 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/frontend2026/express/construir/ISS-08-autenticacion-jwt-y-refresh/ (guía Word §8.1–8.10)
**Commit esperado:** `feat(front-iss-08): sesion jwt refresh perfil y permisos Refs #NN`

---

## 1. SDD

**OBJ:** Al finalizar, cada usuario de Norte Creativo podrá iniciar sesión, ver su perfil y sus permisos efectivos y cerrar sesión, y la aplicación renovará el access token sin que lo note con el refresh token rotativo del backend.

**SPEC (qué debe quedar):**
- **Contrato real (§8.1)**, del backend de Norte Creativo:

| Endpoint | Modalidad | Body / respuesta |
|---|---|---|
| `POST /api/sesion/login` | OPEN | `{ identifier, password }` → solo tokens (`access_token`, `token_type`, `expires_in`, `refresh_token`, `refresh_expires_in`) |
| `POST /api/sesion/refresh` | OPEN | `{ refresh_token }` → tokens rotados |
| `POST /api/sesion/logout` | OPEN | `{ refresh_token }` → `{ message }` |
| `GET /api/sesion/perfil` | JWT | `{ usuario: { id, username, email, status, roles[] } }` |
| `GET /api/permisos` | JWT | `{ total, permisos: [{ method, path, roles }] }` |

- **Activar la Fase II (§8.2)**: `requireAuth: true` en los dos environments y `AUTH_ENABLED=true` en el `.env` del backend; limpiar `nortecreativo.session.v1` si quedó algo de la Fase I.
- **Modelos de sesión (§8.3)**: completar `auth.model.ts` si falta algo del contrato.
- **HttpClient e interceptores (§8.4)**:
  - `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`.
  - Se generan con `npx ng g interceptor core/interceptors/auth --functional --skip-tests --defaults` y `core/interceptors/error`.
- **SessionStore (§8.5)**: el de ISS-02 pasa a ser restrictivo. Con `requireAuth: true`, `canPermission()` usa los permisos efectivos y deniega por defecto.
- **AuthService (§8.6)** en `core/services/auth.ts`:
  - `login(identifier, password)`: `tap` guarda los tokens → `switchMap(me())`.
  - `me()`: `forkJoin` de perfil y permisos → `session.setAccess(...)`. Si falla, limpia la sesión para no dejarla a medias.
  - `refresh()`: guarda el par rotado.
  - `logout()`: manda el refresh, ignora el error del backend y limpia siempre con `finalize`.
- **Interceptor single-flight (§8.7)**:
  - `authInterceptor` añade `Authorization: Bearer <access>` solo hacia `environment.apiUrl`, y no en `login`, `refresh` ni `logout`.
  - Ante un 401:
    - con `requireAuth` en `false`, propaga el error;
    - sin refresh token, limpia la sesión y va a `/login`;
    - si hay refresh token, comparte una sola renovación: `refreshInFlight` es una variable de módulo con `??=`, `shareReplay(1)` y `finalize`. Luego reintenta la petición con el token nuevo.
  - Si el refresh responde 401 (token rotado, familia revocada o usuario desactivado), limpia la sesión, va a `/login` y muestra un toast de "sesión expirada".
  - `errorInterceptor` va después y traduce `status 0` a "backend no disponible".
- **Login (§8.8)**: `npx ng g component features/auth/login`. Ruta `/login` fuera del `Shell`, con `identifier` (usuario o email), `password` (`p-password`) y carga en el botón. Muestra el 401 genérico del backend y al entrar redirige a `returnUrl` o a `/dashboard`.
- **Perfil (§8.9)** en `/perfil`:
  - Muestra username, email, roles con `p-tag` y la tabla de permisos efectivos (método, ruta y roles que lo conceden) con buscador.
  - Botones "Actualizar permisos" (`AuthService.me()`) y "Cerrar sesión".
  - `features/auth/forbidden` queda creada para ISS-09.
- **Menú de usuario en el Shell**: avatar con el username y `p-menu` popup con "Mi sesión", "Actualizar permisos" y "Cerrar sesión". La referencia de plantilla se llama `#userMenuPanel`, no `#userMenu`.
- **Rutas (§8.10)**:
  - `login` fuera del `Shell`.
  - El `Shell` con `canActivate: [authGuard]`. Se crea aquí con `npx ng g guard core/guards/auth --functional`: sin sesión → `/login?returnUrl=...`; con `requireAuth` en `false` deja pasar.
  - `guestGuard` y `permissionGuard` son de ISS-09.
- El formulario de veredicto de ISS-07 deja de dar 401 cuando inicia sesión `aprobador`.

**REQ (restricciones):**
- Los roles no viajan en el JWT: la UI decide con `GET /api/permisos` y el backend vuelve a validar cada petición.
- `/construir` sigue abriendo sin sesión y sin llamar a perfil, permisos ni refresh.
- Guardar tokens en `localStorage` es vulnerable a XSS; aquí se hace para que el laboratorio se vea en DevTools (advertencia de la guía).

**AC:**
- [ ] **AC-1** Con `requireAuth: true`, `/dashboard` sin sesión redirige a `/login?returnUrl=%2Fdashboard`.
- [ ] **AC-2** Login con `admin` / `Admin123!` guarda los tokens y carga perfil y permisos; `/perfil` muestra ADMIN y 85 permisos. Con `finanzas` muestra FINANZAS y 11.
- [ ] **AC-3** En Application → Local Storage está `nortecreativo.session.v1` con `accessToken`, `refreshToken`, `usuario` y `permisos`.
- [ ] **AC-4** Cada petición protegida lleva `Authorization: Bearer <access>`; `login` y `refresh` no.
- [ ] **AC-5** Con el access vencido o alterado, navegar a `/clientes` muestra en Network: `GET /api/clientes` → 401, un solo `POST /api/sesion/refresh` → 200, y el reintento → 200.
- [ ] **AC-6** "Cerrar sesión" borra el storage y vuelve a `/login`; ese refresh ya no sirve (`curl` → 401). Reusar un refresh ya rotado responde 401 y el front limpia la sesión.
- [ ] **AC-7** Con `aprobador`, el formulario de ISS-07 registra un veredicto con 201, y `ng serve` / `ng build` no muestran errores.

**Checklist interno (IA, En curso):**
- [ ] environments en `true`
- [ ] `AuthService` login / me / refresh / logout
- [ ] `authInterceptor` single-flight y `errorInterceptor`
- [ ] login, perfil y forbidden
- [ ] menú de usuario en el Shell
- [ ] `authGuard` y rutas de Fase II

---

## 2. Revisión de AC

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

---

## 3. IA usada

**Herramienta / modelo:** Claude Code - Sonnet 5.5

**Fecha:**

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-08 del frontend, no del frontend entero.

Implementa los AC de projects/NorteCreativo/frontend/docs/trazabilidad_NC/ISS-08.md en projects/NorteCreativo/frontend.
Sigue la guia del docente (secciones 8.1 a 8.10) adaptada al contrato REAL de
projects/NorteCreativo/backend_Express/src/features/auth/session:
login body { identifier, password } -> solo tokens { access_token, token_type, expires_in, refresh_token, refresh_expires_in };
refresh y logout body { refresh_token }; GET /api/sesion/perfil -> { usuario: { id, username, email, status, roles[] } };
GET /api/permisos -> { total, permisos: [{ method, path, roles }] }.

- requireAuth true en ambos environments.
- provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])); npx ng g interceptor core/interceptors/auth
  y core/interceptors/error (--functional --skip-tests --defaults).
- SessionStore de ISS-02: con requireAuth true canPermission usa los permisos efectivos, deny by default.
- core/services/auth.ts: login (tap guarda tokens + switchMap me), me (forkJoin perfil + permisos -> setAccess, limpia si
  falla), refresh, logout (finalize limpia siempre).
- authInterceptor: Bearer solo hacia environment.apiUrl y no en login/refresh/logout; 401 -> refreshInFlight de modulo con
  ??= + shareReplay(1) + finalize, reintento con el token nuevo; refresh 401 -> clear, toast de sesion expirada, /login.
  errorInterceptor traduce status 0.
- npx ng g component features/auth/login, profile, forbidden (--skip-tests --defaults).
  /login fuera del Shell con returnUrl; /perfil con roles, tabla de permisos con buscador, botones "Actualizar permisos"
  (me()) y "Cerrar sesion".
- Shell: avatar + p-menu popup "Mi sesion", "Actualizar permisos", "Cerrar sesion" (referencia #userMenuPanel).
- npx ng g guard core/guards/auth --functional: sin sesion -> /login?returnUrl; con requireAuth false deja pasar.
  Shell con canActivate [authGuard]. /construir sigue publico.

No hagas guestGuard ni permissionGuard (ISS-09). No toques el backend salvo AUTH_ENABLED=true en su .env local.
NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (pasos en el navegador y curl exactos);
que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | redirección | AC-1 | ver docs/proceso.md, sección ISS - 08 | storage vacío + abrir `localhost:4200/dashboard` |
|       | perfil | AC-2 | ver docs/proceso.md, sección ISS - 08 | login de `admin` y de `finanzas` + `/perfil` |
|       | storage | AC-3 | ver docs/proceso.md, sección ISS - 08 | DevTools → Application → Local Storage |
|       | cabeceras | AC-4 | ver docs/proceso.md, sección ISS - 08 | Network → `clientes` → Headers; y `login` → Headers |
|       | refresh único | AC-5 | ver docs/proceso.md, sección ISS - 08 | alterar `accessToken` en el storage + ir a `/clientes` + Network filtrando `clientes\|refresh` |
|       | logout y reuse | AC-6 | ver docs/proceso.md, sección ISS - 08 | copiar el `refreshToken` antes de salir + `curl -i -X POST localhost:3012/api/sesion/refresh -H 'Content-Type: application/json' -d '{"refresh_token":"<token>"}'` |
|       | veredicto y build | AC-7 | ver docs/proceso.md, sección ISS - 08 | login de `aprobador` + `/aprobaciones/nueva` + `npx ng build 2>&1 \| tail -15` |

**Commit (hash):** `feat(front-iss-08): sesion jwt refresh perfil y permisos Refs #NN`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «Si los roles no viajan en el JWT, ¿de dónde sabe la UI qué puede hacer el usuario y qué pasa si el admin le quita un permiso mientras está conectado?». «¿Por qué dos peticiones con 401 producen un solo refresh y no dos?». «¿Por qué el logout limpia la sesión local aunque el backend falle?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

la ui lo sabe por get /api/permisos, despues del login authservice pide el perfil y los permisos efectivos y los guarda en el sessionstore, el token solo dice quien soy, no que puedo hacer, si el admin me quita un permiso mientras estoy conectado el backend lo nota en la siguiente peticion, porque authorize consulta la matriz en la base cada vez y responde 403, la ui en cambio sigue mostrando el boton hasta que se vuelvan a pedir los permisos, con actualizar permisos o con un nuevo login, por eso la ui solo oculta y el que decide de verdad es el backend

dos 401 producen un solo refresh porque el refresh token rota, cada vez que se usa se invalida y se emite otro, si las dos peticiones pidieran refresh al tiempo la segunda llegaria con un token que la primera ya roto, el backend lo tomaria como reuso, revocaria toda la familia y me sacaria de la sesion, para evitarlo el interceptor guarda la renovacion en curso en refreshInFlight, la primera peticion la crea y la segunda se engancha a la misma, cuando termina las dos se reintentan con el token nuevo

el logout limpia la sesion local aunque el backend falle porque el usuario tiene que poder salir siempre, si el servidor esta caido o responde error y no se limpiara, los tokens seguirian en el localStorage y cualquiera que use ese navegador seguiria adentro, por eso authservice usa finalize, que se ejecuta haya exito o error, en el peor caso el refresh queda vivo en la base hasta que venza, pero el navegador ya no lo tiene

---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
