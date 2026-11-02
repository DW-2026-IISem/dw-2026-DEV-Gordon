> **Workspace:** `frontend` (Norte Creativo) · **Pista:** Fase II — Auth con RBAC (ISS-08 a ISS-11) · **Guía base:** `guia_front.docx` + https://tecnogua.com/academic/site/frontend2026/express/ · **Backend:** `backend_Express` (puerto 3012, `AUTH_ENABLED=true`)

# ISS-09 — Guards y RBAC estructural en la UI

**Naturaleza:** práctico
**Issue GitHub:** `#NN`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-08 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/frontend2026/express/construir/ISS-09-guards-y-rbac-en-la-ui/ (guía Word §9.1–9.6)
**Commit esperado:** `feat(front-iss-09): guards matriz de rutas y menu por permisos Refs #NN`

---

## 1. SDD

**OBJ:** Al finalizar, cada uno de los 5 roles de Norte Creativo verá solo las pantallas y acciones que su matriz le concede, llegará a `/forbidden` si entra por URL a una que no le corresponde, y el menú cambiará sin recargar cuando cambien sus permisos.

**SPEC (qué debe quedar):**
- **Guards** (`npx ng g guard core/guards/<nombre> --functional --skip-tests --defaults`):
  - `authGuard` (§9.1): el de ISS-08, revisado para que use `createUrlTree` y no navegue a mano.
  - `guestGuard` (§9.2): con sesión, `/login` redirige a `/dashboard`.
  - `permissionGuard` (§9.3): lee `data.permission`. Sin permiso → `createUrlTree(['/forbidden'], { queryParams: { permission } })`. Deny by default, y deja pasar con `requireAuth` en `false`.
- **Matriz de rutas (§9.4)**: `canActivate: [permissionGuard]` y `data.permission` encima de cada `loadComponent`.

| Ruta | Permiso |
|---|---|
| `/clientes` | `GET /api/clientes` |
| `/campanias` | `GET /api/campanias` |
| `/hitos` | `GET /api/hitos` |
| `/tareas` | `GET /api/tareas` |
| `/entregables` | `GET /api/entregables` |
| `/entregables/:id` | `GET /api/entregables/:id` |
| `/versiones` | `GET /api/version-entregables` |
| `/aprobaciones` | `GET /api/aprobaciones` |
| `/aprobaciones/nueva` | `POST /api/aprobaciones` |

  `/dashboard`, `/perfil` y `/forbidden` no llevan `permissionGuard`: todo usuario autenticado debe poder verlas.
- **Directiva (§9.5)**: `*appHasPermission` ya existe desde ISS-02 y ya envuelve las acciones de las pantallas de la Fase I. Aquí se revisa que cada botón tenga el permiso exacto:
  - Nuevo → `POST`.
  - Editar → `PATCH /:id`.
  - Desactivar → `PATCH /:id/deactivate`.
  - Eliminar → `DELETE /:id`.
  - Veredicto → `POST /api/aprobaciones`.
  - Si una fila se queda sin acciones, la columna de acciones no se muestra.
  - `can()` compara con el patrón anclado (`^…$`), así `PATCH /api/hitos/:id` no autoriza `PATCH /api/hitos/:id/deactivate`.
- **Menú (§9.6)**: `navGroups` del Shell (ISS-02) ya filtra con `canPermission`. Aquí se comprueba que los grupos vacíos desaparecen y que el menú cambia al pulsar "Actualizar permisos".
- **`/forbidden`** muestra el permiso que faltó (query `permission`) y un botón para volver al panel.

**Matriz esperada** (de `backend_Express/src/features/auth/resource-roles/role-matrix.ts`):

| Rol | Menú visible (además de Panel) | Escritura visible |
|---|---|---|
| ADMIN | todo | todo menos registrar veredicto (RN-05) |
| CUENTAS | Clientes, Campañas, Hitos, Tareas, Entregables, Versiones, Aprobaciones | CRUD de campañas, hitos y tareas; clientes solo lectura |
| CREATIVO | Campañas, Hitos, Tareas, Entregables, Versiones | crear y editar entregables y versiones (sin desactivar ni eliminar) |
| CLIENTE_APROBADOR | Campañas, Hitos, Entregables, Versiones, Aprobaciones | registrar veredicto |
| FINANZAS | Clientes, Campañas, Hitos | ninguna |

**REQ (restricciones):**
- La UI solo oculta: el backend vuelve a validar cada petición con `authenticate` y `authorize`.
- No se reescriben las pantallas de la Fase I.
- La administración RBAC (grupo Seguridad) es de ISS-10.

**AC:**
- [ ] **AC-1** Sin sesión, cualquier ruta protegida lleva a `/login` con `returnUrl`; con sesión, `/login` lleva a `/dashboard`.
- [ ] **AC-2** El menú de cada uno de los 5 usuarios coincide con la columna "Menú visible" de la matriz.
- [ ] **AC-3** `finanzas` escribe `/tareas` en la URL y llega a `/forbidden`, donde se lee `GET /api/tareas`.
- [ ] **AC-4** Los botones de escritura desaparecen cuando falta el POST, PATCH o DELETE: `cuentas` no los ve en `/clientes` y sí en `/campanias`; `creativo` en `/versiones` ve crear y editar, pero no desactivar ni eliminar; `aprobador` ve "Revisar" y `admin` no.
- [ ] **AC-5** Después de conceder `GET /api/tareas` a FINANZAS con `curl` (token de admin), `finanzas` pulsa "Actualizar permisos" y aparece Tareas en el menú sin recargar; al retirar la concesión y actualizar otra vez, desaparece.
- [ ] **AC-6** `finanzas` hace desde la consola un `fetch` a `/api/usuarios` con su token y obtiene 403 (el backend manda); sin token el resultado es 401.
- [ ] **AC-7** `ng serve` y `ng build` no muestran errores.

**Checklist interno (IA, En curso):**
- [ ] `guestGuard` y `permissionGuard`
- [ ] matriz de rutas
- [ ] revisión de permisos de cada botón y columna de acciones
- [ ] `/forbidden` con el permiso
- [ ] menú reactivo

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-09 del frontend, no del frontend entero.

Implementa los AC de projects/NorteCreativo/frontend/docs/trazabilidad_NC/ISS-09.md en projects/NorteCreativo/frontend.
Sigue la guia del docente (secciones 9.1 a 9.6). La matriz real esta en
projects/NorteCreativo/backend_Express/src/features/auth/resource-roles/role-matrix.ts
(5 roles; POST /api/aprobaciones solo CLIENTE_APROBADOR).

- npx ng g guard core/guards/guest y core/guards/permission (--functional --skip-tests --defaults). Revisa authGuard
  de ISS-08 para que use createUrlTree. guestGuard: con sesion /login -> /dashboard. permissionGuard: data.permission,
  deny by default, createUrlTree a /forbidden con queryParams { permission }, deja pasar si requireAuth es false.
- app.routes.ts: canActivate [permissionGuard] + data.permission en clientes, campanias, hitos, tareas, entregables,
  entregables/:id, versiones (GET /api/version-entregables), aprobaciones y aprobaciones/nueva (POST /api/aprobaciones).
  dashboard, perfil y forbidden sin permissionGuard. login con guestGuard.
- Revisa en todas las pantallas que cada boton tenga el permiso exacto (POST, PATCH /:id, PATCH /:id/deactivate,
  DELETE /:id, POST /api/aprobaciones) y oculta la columna de acciones si no queda ninguna. Asegura que can() compare
  con el patron anclado (^...$).
- /forbidden muestra el permiso faltante y un boton al panel.
- Comprueba que navGroups oculta grupos vacios y reacciona a "Actualizar permisos".

No hagas la administracion RBAC (ISS-10). NO toques backend_Express, docs/proceso.md ni docs/trazabilidad_NC/.
NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (pasos con cada uno de los 5 usuarios, el curl
exacto para conceder y retirar GET /api/tareas a FINANZAS y el fetch para el 403); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | redirecciones | AC-1 | ver docs/proceso.md, sección ISS - 09 | sin sesión abrir `/hitos`; con sesión abrir `/login` |
|       | menú ×5 | AC-2 | ver docs/proceso.md, sección ISS - 09 | login con `admin`, `cuentas`, `creativo`, `aprobador` y `finanzas` |
|       | forbidden | AC-3 | ver docs/proceso.md, sección ISS - 09 | `finanzas` + escribir `localhost:4200/tareas` |
|       | botones | AC-4 | ver docs/proceso.md, sección ISS - 09 | `cuentas` en `/clientes` y `/campanias`; `creativo`, `aprobador` y `admin` en `/versiones` |
|       | actualizar permisos | AC-5 | ver docs/proceso.md, sección ISS - 09 | `curl -s -X POST localhost:3012/api/concesiones-rol -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"role_id":<FINANZAS>,"resource_id":<GET /api/tareas>}'` + "Actualizar permisos" + `PATCH /api/concesiones-rol/<id>/deactivate` |
|       | 403 vs 401 | AC-6 | ver docs/proceso.md, sección ISS - 09 | `fetch('http://localhost:3012/api/usuarios',{headers:{Authorization:'Bearer '+JSON.parse(localStorage.getItem('nortecreativo.session.v1')).accessToken}}).then(r=>console.log(r.status))` y el mismo sin cabecera |
|       | build | AC-7 | ver docs/proceso.md, sección ISS - 09 | `npx ng build 2>&1 \| tail -15` |

**Commit (hash):** `feat(front-iss-09): guards matriz de rutas y menu por permisos Refs #NN`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Qué diferencia hay entre un 401 y un 403 y qué hace la UI en cada caso?». «Si alguien quita el `*appHasPermission` con DevTools y pulsa el botón, ¿qué pasa y por qué?». «¿Por qué ADMIN no ve "Registrar veredicto" si tiene todo lo demás?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

un 401 es que el backend no sabe quien soy, no hay token, vencio o es invalido, y un 403 es que si sabe quien soy pero mi rol no tiene concesion para ese method y path, ante un 401 la ui intenta un refresh, y si no puede limpia la sesion y me manda al login, ante un 403 no tiene sentido refrescar porque el token esta bien, lo que falta es el permiso, entonces si es una navegacion el permissionGuard me lleva a /forbidden mostrando el permiso que falto, y si es una accion se muestra el mensaje con el toast

si alguien quita el *appHasPermission con devtools el boton aparece y la peticion sale, pero el backend la rechaza con 403, porque authorize revisa en la base si alguno de los roles activos del usuario tiene ese recurso concedido, y deniega por defecto, la directiva solo decide que se pinta, no que se permite, todo lo que esta en el navegador lo puede cambiar el usuario, por eso la seguridad real vive en el backend y la ui solo evita mostrar cosas que van a fallar

admin no ve registrar veredicto porque en la matriz post /api/aprobaciones esta reservado para cliente_aprobador, es la rn-05, la aprobacion es la voz del cliente sobre lo que la agencia entrego, si el admin, que es de la agencia, pudiera aprobar, la agencia se estaria aprobando su propio trabajo y el cierre del hito perderia sentido, por eso role-matrix.ts lo excluye incluso del rol que tiene todo, y la directiva solo refleja eso

---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
