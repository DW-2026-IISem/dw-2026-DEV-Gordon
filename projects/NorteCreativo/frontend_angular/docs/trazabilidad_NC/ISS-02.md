> **Workspace:** `frontend` (Norte Creativo) · **Pista:** Fase I — Fundamentos y Business (ISS-00 a ISS-07) · **Guía base:** `guia_front.docx` + https://tecnogua.com/academic/site/frontend2026/express/ · **Backend:** `backend_Express` (puerto 3012)

# ISS-02 — Núcleo: environment, modelos, servicios, SessionStore y Shell

**Naturaleza:** práctico
**Issue GitHub:** `#NN`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-01 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/frontend2026/express/construir/ISS-02-nucleo-modelos-y-layout/ (guía Word §2.1–2.9)
**Commit esperado:** `feat(front-iss-02): nucleo modelos servicios session store y shell Refs #NN`

---

## 1. SDD

**OBJ:** Al finalizar, el frontend tendrá la capa de infraestructura de Norte Creativo (environment, contrato REST tipado, servicios HTTP, utilidades, componentes compartidos, SessionStore, directiva de permisos y Shell con menú), lista para montar las pantallas de negocio.

**SPEC (qué debe quedar):**
- **Environment (§2.1)**: `environment.ts` y `environment.development.ts` con `production`, `appName: 'Norte Creativo'`, `apiUrl: 'http://localhost:3012/api'` (sin barra final) y `requireAuth: false` en los dos mientras dure la Fase I (vuelve a `true` en ISS-08). `fileReplacements` en `angular.json` para `development`.
- **Modelos (§2.2)** en `core/models/` (`npx ng g interface core/models/<nombre> model --defaults`), copiados del backend, no inventados. Campos en `snake_case`:
  - `api`: `Money = number | string` + `toNumber()` (los DECIMAL pueden llegar como texto), `Status = 'active' | 'inactive'`.
  - `cliente` (`tipo_documento`: CC, NIT, CE, TI, PASAPORTE; `numero_documento`, `nombre`, `telefono`, `email`, `status`).
  - `campania` (`cliente_id`, `nombre`, `descripcion`, `status`).
  - `hito` (`campania_id`, `nombre`, `descripcion`, `estado`: ABIERTO, CERRADO, FACTURADO; `fecha_cierre`, `status`).
  - `tarea` (`hito_id`, `nombre`, `descripcion`, `status`).
  - `entregable` (`tarea_id`, `fecha_inicio`, `fecha_fin`, `total`, `estado`: EN_PROCESO, ENTREGADO; `observaciones`, `status`).
  - `version-entregable` (`entregable_id`, `numero_version`, `fecha_inicio`, `fecha_fin`, `total`, `estado`: EN_REVISION, APROBADA, RECHAZADA; `observaciones`, `status`).
  - `aprobacion` (`version_entregable_id`, `estado`: PENDIENTE, APROBADA, RECHAZADA; `aprobador_id`, `comentario`, `fecha`, `status`) y `AprobacionResultado { aprobacion, hito_cerrado, hito_id, fecha_cierre }`.
  - `usuario` (sin `password` en lectura), `rol`, `recurso` (`HttpMethod`, `path`, `description`), `asignacion-rol`, `concesion-rol`.
  - `auth`: `SessionTokens` (`access_token`, `token_type`, `expires_in`, `refresh_token`, `refresh_expires_in`), `Perfil` (`id`, `username`, `email`, `status`, `roles[]`) y `Permiso { method, path, roles }`.
  - `dashboard`.
  - Cada entidad con su `Payload` de escritura, sin `status`. Tampoco llevan `numero_version`, el `estado` del hito o de la versión, ni `aprobador_id`: los pone el backend.
- **Servicios (§2.3)** por feature (`@Service()` de Angular 22), con `base = ${environment.apiUrl}/<ruta>` y desenvolviendo el sobre con `map`:
  - `ClienteApi` (`{ clientes }` / `{ cliente }`), `CampaniaApi`, `HitoApi`, `TareaApi`, `EntregableApi`, `VersionEntregableApi` (`{ versiones }` / `{ version }`): `list()`, `get(id)`, `create()`, `update(id)` (PATCH), `replace(id)` (PUT), `deactivate(id)`, `remove(id)`.
  - `AprobacionApi`: solo `list()`, `get(id)` y `create()` (devuelve `AprobacionResultado`).
  - `UsuarioApi`, `RolApi`, `RecursoApi` (CRUD); `AsignacionRolApi` (`{ asignaciones }`) y `ConcesionRolApi` (`{ concesiones }`): `list()`, `get(id)`, `create()`, `deactivate(id)`, `reactivate(id)`.
- **Utilidades (§2.4)**: `core/utils/api-error.ts` con `toApiMessage(error)`, que distingue `status 0` (backend caído o CORS), 400 (usa `errors[]` del backend), 401, 403, 404 y 409; `NotificationService` sobre `MessageService` (`success`, `info`, `warn`, `error`).
- **Compartidos (§2.5)**: `PageHeader`, `EmptyState` y `StatusTag`. `StatusTag` usa `computed` sobre `p-tag` y cubre `active/inactive` y todos los `estado` del dominio.
- **Rutas (§2.6)**: `''` carga `Shell` con `loadComponent`, hija por defecto `dashboard` (componente provisional `features/dashboard/dashboard` con un `PageHeader`; se completa en ISS-07); `**` → `''`. Se conserva `/construir` de ISS-01. `provideHttpClient()` sin interceptores.
- **Shell (§2.7)**: `layout/shell` monta Header, Aside, `router-outlet` en `main#contenido`, Footer, `p-drawer`, `p-toast` y `p-confirmdialog`. Menú declarado como `NAV` (grupo "Operación": Panel, Clientes, Campañas, Hitos, Tareas, Entregables, Versiones y Aprobaciones), cada ítem con su `permission` (`'GET /api/clientes'`…). `navGroups = computed(...)` filtra con `session.canPermission()` y descarta grupos vacíos.
- **SessionStore (§2.8)**: `core/services/session-store.ts`, única fuente de verdad de la sesión, sin depender de `AuthService`.
  - Signals privados `_accessToken`, `_refreshToken`, `_usuario` y `_permisos`, expuestos como solo lectura.
  - `computed`: `isAuthenticated`, `roleNames` y `permissionCount`.
  - `setTokens()`, `setAccess(perfil, permisos)` y `clear()`.
  - `can(method, path)`: sin query string, y los `:id` del permiso se convierten en expresión regular. `canPermission('GET /api/clientes')` es el atajo.
  - Con `requireAuth: false`, todo se considera concedido.
  - Persiste en `localStorage` bajo `nortecreativo.session.v1`, con `try/catch` y validación de forma al restaurar.
- **Directiva (§2.9)**: `shared/directives/has-permission.ts`. `*appHasPermission="'POST /api/clientes'"` se evalúa en un `effect()` con un flag `rendered` para que sea idempotente (sin duplicar ni borrar la vista).

**REQ (restricciones):**
- Todavía no hay pantallas CRUD (ISS-03 en adelante) ni login, guards o interceptores (ISS-08 / ISS-09).
- Los servicios no muestran toasts: devuelven el error y la pantalla decide.
- Sin `any` en modelos ni servicios.

**AC:**
- [ ] **AC-1** `environment.apiUrl === 'http://localhost:3012/api'`, sin barra final, y `requireAuth: false` en los dos archivos.
- [ ] **AC-2** Los servicios devuelven arreglos u objetos desenvueltos, no la envoltura (por ejemplo, `ClienteApi.list()` → `Cliente[]`), y `AprobacionApi` no expone update ni delete.
- [ ] **AC-3** `toApiMessage` distingue `status 0` (backend caído) de un 403 y muestra la lista `errors` de un 400.
- [ ] **AC-4** `PageHeader`, `EmptyState` y `StatusTag` compilan como standalone, y `StatusTag` cambia de color cuando cambia su input.
- [ ] **AC-5** `localhost:4200` carga el `Shell` de forma diferida con el menú de 8 entradas (todo visible, porque `requireAuth` es `false`) y redirige a `/dashboard`; `/construir` sigue funcionando.
- [ ] **AC-6** `npx ng build` termina con "Application bundle generation complete", sin `✘ [ERROR]` y con el chunk `shell` aparte.

**Checklist interno (IA, En curso):**
- [ ] environments
- [ ] modelos con payloads
- [ ] servicios de API + Notification
- [ ] `api-error`
- [ ] PageHeader, EmptyState, StatusTag
- [ ] SessionStore y directiva
- [ ] Shell con NAV filtrado, dashboard provisional y rutas

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
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-02 del frontend, no del frontend entero.

Implementa los AC de projects/NorteCreativo/frontend/docs/trazabilidad_NC/ISS-02.md en projects/NorteCreativo/frontend.
Sigue la guia del docente (secciones 2.1 a 2.9: environment, modelos, servicios, utilidades, compartidos, rutas, Shell,
SessionStore y directiva *appHasPermission) adaptada a Norte Creativo.
El contrato REAL esta en projects/NorteCreativo/backend_Express: lee los *.model.ts, *.controller.ts y *.routes.ts de
src/features para copiar campos, enums y sobres EXACTOS (en español: { clientes } / { cliente }, { versiones } / { version },
{ asignaciones }, { concesiones }; login -> solo tokens; GET /api/sesion/perfil -> { usuario }; GET /api/permisos ->
{ total, permisos: [{ method, path, roles }] }).

- environment.ts y environment.development.ts: appName 'Norte Creativo', apiUrl 'http://localhost:3012/api' sin barra final,
  requireAuth false en los dos (Fase I). fileReplacements para development.
- Modelos en core/models con campos snake_case como la API, Money + toNumber, Payload de escritura sin status, sin
  numero_version, sin estado de hito/version y sin aprobador_id. Usuario de lectura sin password. Nada de any.
- Servicios por feature con @Service() y map que desenvuelve el sobre: ClienteApi, CampaniaApi, HitoApi, TareaApi,
  EntregableApi, VersionEntregableApi (list, get, create, update PATCH, replace PUT, deactivate, remove); AprobacionApi
  (solo list, get, create); UsuarioApi, RolApi, RecursoApi (CRUD); AsignacionRolApi y ConcesionRolApi (list, get, create,
  deactivate, reactivate). NotificationService sobre MessageService.
- core/utils/api-error.ts con toApiMessage (status 0, 400 con errors[], 401, 403, 404, 409).
- shared/ui: PageHeader, EmptyState, StatusTag (computed sobre p-tag para active/inactive y todos los estados del dominio).
- core/services/session-store.ts: signals de tokens, usuario y permisos; computed isAuthenticated, roleNames,
  permissionCount; setTokens, setAccess, clear; can(method, path) con :id como regex y sin query string;
  canPermission('GET /api/clientes'); todo concedido si requireAuth es false; localStorage 'nortecreativo.session.v1'
  con try/catch.
- shared/directives/has-permission.ts: *appHasPermission con effect() y flag rendered.
- layout/shell: header, aside, router-outlet en main#contenido, footer, p-drawer, p-toast, p-confirmdialog.
  NAV con grupo "Operacion" (Panel, Clientes, Campañas, Hitos, Tareas, Entregables, Versiones, Aprobaciones), cada item
  con permission 'GET /api/...'; navGroups computed filtrado con canPermission.
- app.routes.ts: '' carga Shell con loadComponent e hija por defecto dashboard (componente provisional
  features/dashboard/dashboard con un PageHeader); ** a ''. Conserva /construir. provideHttpClient() sin interceptores.

No hagas pantallas CRUD, login, guards ni interceptores. NO toques backend_Express, docs/proceso.md ni
docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos y pasos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | environment | AC-1 | ver docs/proceso.md, sección ISS - 02 | `cat src/environments/environment*.ts` + `grep -n fileReplacements -A4 angular.json` |
|       | servicios desenvueltos | AC-2 | ver docs/proceso.md, sección ISS - 02 | `grep -rn "map(" src/app/features/*/*-api.ts` + `grep -n "update\|remove" src/app/features/aprobaciones/aprobacion-api.ts` (no debe salir nada) |
|       | mensajes de error | AC-3 | ver docs/proceso.md, sección ISS - 02 | apagar el backend y abrir `/dashboard`; revisar `src/app/core/utils/api-error.ts` |
|       | compartidos | AC-4 | ver docs/proceso.md, sección ISS - 02 | `ls src/app/shared/ui` + `grep -n "computed" src/app/shared/ui/status-tag/status-tag.ts` |
|       | Shell y menú | AC-5 | ver docs/proceso.md, sección ISS - 02 | `npm start` + `localhost:4200` y `localhost:4200/construir` |
|       | build | AC-6 | ver docs/proceso.md, sección ISS - 02 | `npx ng build 2>&1 \| tail -15` |

**Commit (hash):** `feat(front-iss-02): nucleo modelos servicios session store y shell Refs #NN`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «Dibuja la cadena plantilla → componente → `ClienteApi` → Express → respuesta → signal, y señala dónde se desenvuelve `{ clientes }`». «¿Por qué el SessionStore existe desde la Fase I si todavía no hay login?». «¿Para qué sirve el flag `rendered` de la directiva?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

la plantilla muestra lo que tenga el signal rows del componente, el componente cuando carga llama a clienteapi.list(), el servicio arma la url con environment.apiUrl mas /clientes y hace el get con httpclient, express responde 200 con el sobre { clientes: [...] }, y en el map del servicio se saca el arreglo del sobre, entonces el componente ya recibe un cliente[] limpio, lo guarda en el signal con rows.set() y la plantilla se repinta sola, el sobre se desenvuelve en el servicio y no en el componente, asi si el backend cambia la envoltura solo se corrige un archivo

el sessionstore existe desde la fase i porque la directiva *appHasPermission y el menu del shell ya le preguntan si se puede hacer algo, con requireAuth en false responde que si a todo y la ui funciona sin login, y cuando llegue la fase ii solo se cambia la bandera y el mismo store empieza a decidir con los permisos reales, no hay que tocar las pantallas, ademas no depende de authservice, solo guarda estado, por eso puede existir antes de que exista el login

el flag rendered sirve para que la directiva no haga dos veces lo mismo, el effect se ejecuta cada vez que cambia cualquier signal que lee, si en cada ejecucion creara la vista el boton saldria duplicado, y si limpiara siempre que no hay cambio podria borrar un boton que si estaba permitido, con rendered la directiva solo crea la vista cuando pasa de no permitido a permitido y solo la borra cuando pasa de permitido a no permitido, eso la hace idempotente

---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
