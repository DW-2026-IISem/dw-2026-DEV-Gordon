> **Workspace:** `frontend` (Norte Creativo) · **Pista:** Fase I — Fundamentos y Business (ISS-00 a ISS-07) · **Guía base:** `guia_front.docx` + https://tecnogua.com/academic/site/frontend2026/express/ · **Backend:** `backend_Express` (puerto 3012)

# ISS-00 — Requisitos previos y backend listo para el frontend

**Naturaleza:** práctico
**Issue GitHub:** `#NN`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** backend ISS-21 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/frontend2026/express/construir/ISS-00-requisitos-previos/ (guía Word §0)
**Commit esperado:** `feat(front-iss-00): requisitos y modo practica del backend Refs #NN`

---

## 1. SDD

**OBJ:** Al finalizar, el equipo tendrá Node, npm y Angular CLI 22 verificados, el backend Express de Norte Creativo sembrado y respondiendo en el 3012, y un modo práctica para construir la Fase I del frontend sin login.

**SPEC (qué debe quedar):**
- Node ≥ 22 (laboratorio 24.x), npm ≥ 10 y Angular CLI 22.x (`npx @angular/cli@22 version`).
- Backend `backend_Express` con `npm install`, `npm run db:seed` y `npm run dev` escuchando en `http://localhost:3012`.
- Las tres modalidades del backend comprobadas: OPEN (`login`, `refresh`, `logout`, `/api/docs`), JWT (`/api/sesion/perfil`, `/api/permisos`, `/api/sesiones`) y JWT + RBAC (todo el negocio y la administración).
- Interruptor `AUTH_ENABLED` en el backend para la Fase I. La guía dice que la Fase I se construye contra el backend "antes de ISS-13" (sin middlewares); el sitio del docente lo resuelve con `AUTH_ENABLED=false`, y eso es lo que se hace aquí para no volver a una versión vieja del backend:
  - `.env.example` con `AUTH_ENABLED=true`; si la variable falta, vale `true`.
  - Un solo helper que lo lee (`src/shared/auth/auth-mode.ts` → `isAuthEnabled()`).
  - Con `AUTH_ENABLED=false`, `authenticate` y `authorize` dejan pasar solo el negocio: `clientes`, `campanias`, `hitos`, `tareas`, `entregables`, `version-entregables` y el GET de `aprobaciones`.
  - `POST /api/aprobaciones` exige JWT siempre, porque el aprobador sale del usuario autenticado (RN-05).
  - Administración (`usuarios`, `roles`, `recursos`, `asignaciones-rol`, `concesiones-rol`) exige JWT + RBAC siempre; `perfil`, `permisos` y `sesiones` exigen JWT siempre; `login`, `refresh` y `logout` siguen OPEN.
  - Al arrancar, la consola avisa si el modo práctica está activo.
- `projects/NorteCreativo/frontend/` solo tiene `docs/` (sin `src/` ni `package.json`).

**REQ (restricciones):**
- No se toca la matriz de roles, el catálogo de recursos ni la lógica de sesión.
- No se escribe código Angular en este ISS.

**AC:**
- [ ] **AC-1** `node -v` ≥ 22, `npm -v` ≥ 10 y `npx @angular/cli@22 version` muestra Angular CLI 22.x.
- [ ] **AC-2** `npm run db:seed && npm run dev` deja el 3012 escuchando con la base sincronizada.
- [ ] **AC-3** Con `AUTH_ENABLED=true`, `curl -i localhost:3012/api/clientes` responde 401; con `AUTH_ENABLED=false` responde 200 con `{ clientes }`.
- [ ] **AC-4** Con `AUTH_ENABLED=false`, `GET /api/usuarios` y `POST /api/aprobaciones` sin token siguen en 401.
- [ ] **AC-5** Con `AUTH_ENABLED=true`, el login de `admin` devuelve solo el par de tokens, y `GET /api/permisos` con ese token devuelve `total: 75`; con `finanzas`, `total: 6`.
- [ ] **AC-6** `frontend/` no contiene `src/` ni `package.json`, y `npx tsc --noEmit` del backend no da errores.

**Checklist interno (IA, En curso):**
- [ ] helper `isAuthEnabled()`
- [ ] bypass en `authenticate` / `authorize` solo para negocio
- [ ] `POST /api/aprobaciones` con JWT obligatorio
- [ ] `.env.example` y aviso en consola
- [ ] compilación

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-00 del frontend, no del frontend entero.

Implementa los AC de projects/NorteCreativo/frontend/docs/trazabilidad_NC/ISS-00.md.
Este ISS solo toca projects/NorteCreativo/backend_Express. NO crees nada de Angular.

Agrega un interruptor AUTH_ENABLED al backend (modo practica para la Fase I del frontend):
- .env.example con AUTH_ENABLED=true. Si la variable falta, el valor es true.
- Un solo helper que lo lea: src/shared/auth/auth-mode.ts con isAuthEnabled().
- Con AUTH_ENABLED=false, authenticate y authorize de src/features/auth/access dejan pasar SOLO las rutas
  de negocio: clientes, campanias, hitos, tareas, entregables, version-entregables y GET de aprobaciones.
- POST /api/aprobaciones exige JWT siempre: el aprobador sale del usuario autenticado (RN-05).
- Administracion (usuarios, roles, recursos, asignaciones-rol, concesiones-rol) exige JWT + RBAC siempre.
  sesion/perfil, permisos y sesiones exigen JWT siempre. login, refresh y logout siguen OPEN.
- Al arrancar, imprime en consola si el modo practica esta activo.
Sigue el estilo de los middlewares existentes. No toques la matriz de roles, el catalogo de recursos ni la logica
de sesion. Puerto 3012 y base norte_creativo_express.

Prohibido: force: true, alter, secretos en el codigo, cambiar el puerto o la base. NO toques docs/proceso.md
ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | versiones | AC-1 | ver docs/proceso.md, sección ISS - 00 | `node -v && npm -v && npx @angular/cli@22 version` |
|       | backend arriba | AC-2 | ver docs/proceso.md, sección ISS - 00 | `npm run db:seed && npm run dev` en `backend_Express` |
|       | 401 / 200 según interruptor | AC-3 | ver docs/proceso.md, sección ISS - 00 | `curl -s -o /dev/null -w "HTTP %{http_code}\n" localhost:3012/api/clientes` con `AUTH_ENABLED=true` y luego `false` |
|       | admin y aprobaciones protegidos | AC-4 | ver docs/proceso.md, sección ISS - 00 | `curl -i localhost:3012/api/usuarios` y `curl -i -X POST localhost:3012/api/aprobaciones -H 'Content-Type: application/json' -d '{}'` con `AUTH_ENABLED=false` |
|       | login y permisos | AC-5 | ver docs/proceso.md, sección ISS - 00 | `TOKEN=$(curl -s -X POST localhost:3012/api/sesion/login -H 'Content-Type: application/json' -d '{"identifier":"admin","password":"Admin123!"}' \| jq -r .access_token)` + `curl -s localhost:3012/api/permisos -H "Authorization: Bearer $TOKEN" \| jq .total` (repetir con `finanzas` / `Finanzas123!`) |
|       | carpeta vacía y compilación | AC-6 | ver docs/proceso.md, sección ISS - 00 | `ls -A projects/NorteCreativo/frontend` + `npx tsc --noEmit` en `backend_Express` |

**Commit (hash):** `feat(front-iss-00): requisitos y modo practica del backend Refs #NN`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Qué corre dentro de WSL y qué abre el navegador de Windows?». «¿Por qué `POST /api/aprobaciones` no se abre en modo práctica aunque las demás rutas de negocio sí?». «¿Por qué el interruptor vale `true` si falta la variable?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

dentro de wsl corre todo lo que es servidor, el contenedor de mysql, el backend express en el 3012 y despues el ng serve del frontend en el 4200, el navegador de windows solo abre localhost:4200 y localhost:3012/api/docs, wsl reenvia esos puertos a windows y por eso el navegador los ve como si fueran locales, entonces el navegador es solo el cliente, descarga el angular compilado y desde ahi hace las peticiones a la api, por eso las herramientas de devtools, console y network, se miran en windows aunque el codigo viva en linux

post /api/aprobaciones no se abre en modo practica porque esa ruta necesita saber quien es el usuario, por la rn-05 el aprobador_id no viene en el body, lo saca el backend del token, si la abriera sin token no habria aprobador y la aprobacion quedaria sin autor, o tocaria volver a aceptar aprobador_id en el body, que es justo lo que la rn-05 prohibe, las demas rutas de negocio no dependen de quien las llama para funcionar, por eso se pueden abrir para construir las pantallas de la fase i sin login

el interruptor vale true si falta la variable porque es mas seguro equivocarse cerrando que abriendo, si alguien clona el proyecto y se le olvida poner auth_enabled en el .env, el backend arranca protegido con jwt y rbac como en la entrega final, si fuera al reves un olvido dejaria toda la api abierta sin que nadie lo note, el modo practica tiene que ser una decision explicita, poner false a proposito y ver el aviso en la consola

---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
