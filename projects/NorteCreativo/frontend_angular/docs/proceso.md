## PROCESO.MD
### BITACORA GENERAL DE LA CONSTRUCCION DEL FRONTEND ANGULAR DE NORTE CREATIVO
### ESTUDIANTE: CARLOS H. ZARATE
### HERRAMIENTAS: Claude Code
---

## Índice

- [ISS - 00](#iss---00)
- [ISS - 01](#iss---01)
- [ISS - 02](#iss---02)
- [ISS - 03](#iss---03)
- [ISS - 04](#iss---04)
- [ISS - 05](#iss---05)
- [ISS - 06](#iss---06)
- [ISS - 07](#iss---07)
- [ISS - 08](#iss---08)
- [ISS - 09](#iss---09)
- [ISS - 10](#iss---10)
- [ISS - 11](#iss---11)


## FASE 0 - REQUISITOS PREVIOS Y PREPARACION

Empezamos verificando las versiones de nodejs, npm y angular cli que tenemos en el wsl, la guia del docente pide node 22 o superior, npm 10 o superior y angular cli 22, el frontend se crea con ng new dentro de projects/NorteCreativo/frontend, que solo tiene la carpeta docs, y consume el backend_Express de la fase anterior, en el puerto 3012 y con la base norte_creativo_express.

Organizamos los ISS igual que la guia del docente, del ISS-00 al ISS-11, pero con el dominio de norte creativo, el mismo mapeo del backend: tipo de producto pasa a ser campaña, producto pasa a ser hito y la venta transaccional pasa a ser la aprobacion que cierra el hito. Quedan asi: ISS-00 requisitos, ISS-01 bootstrap de angular con tailwind y primeng, ISS-02 nucleo (environment, modelos, servicios, sessionstore, directiva de permisos y shell), ISS-03 clientes, ISS-04 campañas, ISS-05 hitos y tareas, ISS-06 entregables y versiones, ISS-07 aprobaciones, dashboard y cierre de la fase i, ISS-08 login con jwt y refresh, ISS-09 guards y rbac en la ui, ISS-10 administracion del rbac e ISS-11 build y calidad. Facturacion queda por fuera.

La guia construye la fase i contra el backend antes de que tuviera los middlewares de auth, pero nuestro backend ya tiene jwt y rbac en todas las rutas, entonces en el ISS-00 le agregamos el interruptor AUTH_ENABLED que usa el docente en su sitio, con false las rutas de negocio quedan abiertas para construir las pantallas sin login, y en el front requireAuth va en false en los dos environments, en la fase ii los dos vuelven a true. La unica ruta de negocio que no se abre es post /api/aprobaciones, porque por la rn-05 el aprobador sale del token.

Seguimos con claude code via cli, sin skills, con el modelo Sonnet 5.5 en esfuerzo alto, y los commits los hago yo despues de verificar cada ac.

Comandos:
```bash
node -v && npm -v && npx @angular/cli@22 version
cd projects/NorteCreativo/backend_Express && npm run db:seed && npm run dev
curl -s localhost:3012/api/health | jq
ls -A projects/NorteCreativo/frontend_angular
```

Salida (el backend corre en otra terminal; aqui se comprueba con el health):

![Fase 0: versiones, backend arriba y carpeta del frontend solo con docs](images/iss-00-fase-0.png)

## FASE 1 - FUNDAMENTOS Y BUSINESS (SIN LOGIN)

## ISS - 00

### OBJ

**OBJ:** Al finalizar, el equipo tendrá Node, npm y Angular CLI 22 verificados, el backend Express de Norte Creativo sembrado y respondiendo en el 3012, y un modo práctica para construir la Fase I del frontend sin login.

### AC

**AC:**
- [ ] **AC-1** `node -v` ≥ 22, `npm -v` ≥ 10 y `npx @angular/cli@22 version` muestra Angular CLI 22.x.
- [ ] **AC-2** `npm run db:seed && npm run dev` deja el 3012 escuchando con la base sincronizada.
- [ ] **AC-3** Con `AUTH_ENABLED=true`, `curl -i localhost:3012/api/clientes` responde 401; con `AUTH_ENABLED=false` responde 200 con `{ clientes }`.
- [ ] **AC-4** Con `AUTH_ENABLED=false`, `GET /api/usuarios` y `POST /api/aprobaciones` sin token siguen en 401.
- [ ] **AC-5** Con `AUTH_ENABLED=true`, el login de `admin` devuelve solo el par de tokens, y `GET /api/permisos` con ese token devuelve `total: 85`; con `finanzas`, `total: 11`.
- [ ] **AC-6** `frontend/` no contiene `src/` ni `package.json`, y `npx tsc --noEmit` del backend no da errores.

### Procedimiento

1. pegamos el prompt 

``` text
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

2. comprobamos AC-1 (versiones): `node -v && npm -v && npx @angular/cli@22 version`

![AC-1: versiones de node, npm y angular cli](images/iss-00-ac-1.png)

3. comprobamos AC-2 (backend arriba): `npm run db:seed && npm run dev` en `backend_Express`

![AC-2: seed y backend escuchando en el 3012](images/iss-00-ac-2.png)

4. comprobamos AC-3 (401 / 200 según interruptor): `curl -s -o /dev/null -w "HTTP %{http_code}\n" localhost:3012/api/clientes` con `AUTH_ENABLED=true` y luego `false`, mas `curl -s localhost:3012/api/clientes | jq 'keys'` para ver que la respuesta es `{ clientes }`

![AC-3: 401 con AUTH_ENABLED=true y 200 con false](images/iss-00-ac-3.png)

5. comprobamos AC-4 (admin y aprobaciones protegidos): `curl -s -i -w "\n" localhost:3012/api/usuarios` y `curl -s -i -w "\n" -X POST localhost:3012/api/aprobaciones -H 'Content-Type: application/json' -d '{}'` con `AUTH_ENABLED=false`

![AC-4: usuarios y POST aprobaciones siguen en 401 en modo practica](images/iss-00-ac-4.png)

6. comprobamos AC-5 (login y permisos), con `AUTH_ENABLED=true`: el login de `admin` con `jq 'keys'` para ver que solo devuelve el par de tokens, y despues el login encadenado a `/api/permisos` en una sola linea con `xargs`, sin variables: `curl -s -X POST localhost:3012/api/sesion/login -H 'Content-Type: application/json' -d '{"identifier":"admin","password":"Admin123!"}' | jq -r .access_token | xargs -I{} curl -s localhost:3012/api/permisos -H "Authorization: Bearer {}" | jq .total` (repetido con `finanzas` / `Finanzas123!`)

![AC-5: login con par de tokens y total de permisos de admin y finanzas](images/iss-00-ac-5.png)

7. comprobamos AC-6 (carpeta sin código y compilación): `ls -A projects/NorteCreativo/frontend_angular` + `npx tsc --noEmit` en `backend_Express`

![AC-6: frontend_angular solo con docs y backend compilando sin errores](images/iss-00-ac-6.png)


## ISS - 01

### OBJ

**OBJ:** Al finalizar, existirá el proyecto Angular 22 de Norte Creativo con Tailwind y PrimeNG (Aura), un ejemplo de signals, el esqueleto Header/Aside/contenido/Footer y el menú del dominio, sin llamadas a la API.

### AC

**AC:**
- [ ] **AC-1** `package.json`, `angular.json` y `src/` quedan en la raíz de `frontend/`, sin subcarpeta, y `docs/` sigue intacto.
- [ ] **AC-2** `npm ls primeng @primeuix/themes primeicons @angular/cdk --depth=0` muestra PrimeNG 22.x y themes 3.x, sin `invalid` ni `UNMET`; `styles.css` importa Tailwind y PrimeIcons; `providePrimeNG` usa Aura y `.app-dark`.
- [ ] **AC-3** Con el ejemplo montado, los botones cambian total, total con IVA, estado y nombre sin recargar, y la consola registra cada cambio desde el `effect`.
- [ ] **AC-4** A 1280 px se ven Header, Aside con las 8 opciones, contenido y Footer; el botón oculta el Aside sin abrir el Drawer.
- [ ] **AC-5** A 390 px el Aside no se ve, el botón abre el Drawer, elegir una opción cambia el título y lo cierra, y no hay scroll horizontal.
- [ ] **AC-6** `ng build` termina con código 0, la pestaña dice "Norte Creativo · Angular 22", la consola no muestra errores rojos y Network no muestra peticiones `/api`.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-01 (con 01A y 01B) del frontend, no del frontend entero.

Implementa los AC de projects/NorteCreativo/frontend/docs/trazabilidad_NC/ISS-01.md dentro de
projects/NorteCreativo/frontend/ (la carpeta ya tiene docs/, no la borres).
Sigue la guia del docente (https://tecnogua.com/academic/site/frontend2026/express/construir/ISS-01-bootstrap-angular-22/)
adaptada a Norte Creativo.

1) Bootstrap: ng new front-norte-creativo --directory . --style=tailwind --routing --ssr=false --skip-git
   --package-manager=npm --defaults ; luego npm install primeng @primeuix/themes primeicons @angular/cdk.
   styles.css con capas theme, base, primeng, utilities + tailwindcss + primeicons. app.config.ts con
   withComponentInputBinding, providePrimeNG (preset Aura, darkModeSelector .app-dark, capa primeng),
   MessageService y ConfirmationService. index.html lang="es" y titulo "Norte Creativo · Angular 22".
   Presupuesto initial de produccion 750kB aviso / 1MB error.
   Componente src/app/demo/ejemplo: tarjeta de entregable "Video de lanzamiento 30 s", total 1500000;
   signal para el objeto, computed total con IVA 19%, effect que registra en consola; botones +-100000,
   estado EN_PROCESO/ENTREGADO, nombre y reiniciar.
2) 01A: ng generate component layout/header, layout/aside, layout/footer (--skip-tests --defaults).
   flex min-h-screen flex-col, header h-16 con title "Norte Creativo", aside w-64 shrink-0 con nav aria-label,
   main id="contenido" min-w-0, footer "Norte Creativo · Agencia de campañas". CSS de layout vacios.
3) 01B: ng generate component features/construir (--skip-tests --defaults). El esqueleto pasa a Construir y
   app.html queda en <router-outlet />. p-panelmenu en el aside y p-drawer en movil con: Inicio, Clientes,
   Campañas, Hitos, Tareas, Entregables, Versiones, Aprobaciones. Construir es el unico con estado
   (signals mobileOpen, sidebarCollapsed, title); items al aside con input(); header emite menuRequested y
   aside emite navigated con output(). La URL no cambia.
   app.routes.ts: /construir con loadComponent; '' y ** redirigen a /construir.

Sin llamadas a /api, sin PrimeFlex, sin ::ng-deep, sin selectores .p-* ni CSS propio. No adelantes environment,
modelos, servicios ni Shell (ISS-02). Verifica con ng build.
NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos y pasos exactos en el
navegador); que quedo fuera de alcance.
```

2. comprobamos AC-1 (estructura en la raíz): `ls -A projects/NorteCreativo/frontend_angular` y `ls -A projects/NorteCreativo/frontend_angular/docs`
haz
![AC-1: package.json, angular.json y src en la raiz, docs intacto](images/iss-01-ac-1.png)

3. comprobamos AC-2 (dependencias y tema): `npm ls primeng @primeuix/themes primeicons @angular/cdk --depth=0` + `grep -rnE "tailwindcss|primeicons|Aura|app-dark" src --include=styles.css --include=app.config.ts`

![AC-2: PrimeNG 22.1.4, themes 3.1.0, Tailwind, PrimeIcons, Aura y .app-dark](images/iss-01-ac-2.png)

4. comprobamos AC-3 (ejemplo signals): montar `<app-ejemplo />` en `/construir` un momento, `npm start`, pulsar los botones (+ 100.000 dos veces, Cambiar estado y Cambiar nombre) y revisar la consola con `playwright-cli --raw console | grep ejemplo | sed 's/ @ .*//'`

![AC-3: el ejemplo tras pulsar los botones, total, total con IVA, estado y nombre cambiados](images/iss-01-ac-3-pagina.png)

![AC-3: la consola registra cada cambio desde el effect](images/iss-01-ac-3-consola.png)

5. comprobamos AC-4 (escritorio): `npm start` + `localhost:4200` a 1280 px, con el Header, el Aside con las 8 opciones, el contenido y el Footer, y luego el botón de menú para ocultar el Aside (sin abrir el Drawer)

![AC-4: escritorio a 1280 px con Aside visible](images/iss-01-ac-4-escritorio.png)

![AC-4: el botón oculta el Aside y no abre el Drawer](images/iss-01-ac-4-aside-oculto.png)

6. comprobamos AC-5 (móvil): navegador a 390 px, el Aside no se ve, el botón abre el Drawer, elegir "Clientes" cambia el título a Clientes y cierra el Drawer, la URL sigue en `/construir` y `scrollWidth` = `clientWidth` = 390 (sin scroll horizontal)

![AC-5: móvil a 390 px sin Aside](images/iss-01-ac-5-movil.png)

![AC-5: el botón abre el Drawer con las 8 opciones](images/iss-01-ac-5-drawer.png)

![AC-5: tras elegir Clientes cambia el título y se cierra el Drawer](images/iss-01-ac-5-opcion.png)

7. comprobamos AC-6 (build, consola y Network): `npx ng build; echo $?`, el título de la pestaña con `playwright-cli --raw eval "document.title"`, la consola con `playwright-cli --raw console error` y Network con `playwright-cli --raw requests --static | grep "/api/"`

![AC-6: build con código 0, título, consola sin errores y sin peticiones a /api](images/iss-01-ac-6.png)


## ISS - 02

### OBJ

**OBJ:** Al finalizar, el frontend tendrá la capa de infraestructura de Norte Creativo (environment, contrato REST tipado, servicios HTTP, utilidades, componentes compartidos, SessionStore, directiva de permisos y Shell con menú), lista para montar las pantallas de negocio.

### AC

**AC:**
- [ ] **AC-1** `environment.apiUrl === 'http://localhost:3012/api'`, sin barra final, y `requireAuth: false` en los dos archivos.
- [ ] **AC-2** Los servicios devuelven arreglos u objetos desenvueltos, no la envoltura (por ejemplo, `ClienteApi.list()` → `Cliente[]`), y `AprobacionApi` no expone update ni delete.
- [ ] **AC-3** `toApiMessage` distingue `status 0` (backend caído) de un 403 y muestra la lista `errors` de un 400.
- [ ] **AC-4** `PageHeader`, `EmptyState` y `StatusTag` compilan como standalone, y `StatusTag` cambia de color cuando cambia su input.
- [ ] **AC-5** `localhost:4200` carga el `Shell` de forma diferida con el menú de 8 entradas (todo visible, porque `requireAuth` es `false`) y redirige a `/dashboard`; `/construir` sigue funcionando.
- [ ] **AC-6** `npx ng build` termina con "Application bundle generation complete", sin `✘ [ERROR]` y con el chunk `shell` aparte.

### Procedimiento

1. pegamos el prompt 

``` text
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

2. comprobamos AC-1 (environment): `cat src/environments/environment.ts src/environments/environment.development.ts` + `grep -n fileReplacements -A6 angular.json`

![AC-1: apiUrl sin barra final, requireAuth false en los dos environments y fileReplacements](images/iss-02-ac-1.png)

3. comprobamos AC-2 (servicios desenvueltos): `grep -n "map(" src/app/features/clientes/cliente-api.ts src/app/features/aprobaciones/aprobacion-api.ts` + `grep -c "map(" src/app/features/*/*-api.ts` + `grep -nE "update|remove" src/app/features/aprobaciones/aprobacion-api.ts || echo "sin update ni remove"` (no debe salir nada) + prueba unitaria `cliente-api.spec.ts` que comprueba que `ClienteApi.list()` devuelve `Cliente[]` y que `AprobacionApi` no expone update, replace, deactivate ni remove

![AC-2: servicios que desenvuelven el sobre y AprobacionApi sin update ni remove](images/iss-02-ac-2.png)

4. comprobamos AC-3 (mensajes de error): como el panel provisional no hace llamadas a la API, no hay un backend caído que mostrar en `/dashboard`; se comprueba `toApiMessage` con la prueba `api-error.spec.ts` (status 0 contra un 403 y la lista `errors` de un 400) y los `case` de `src/app/core/utils/api-error.ts`

![AC-3: toApiMessage distingue status 0 de un 403 y muestra la lista errors de un 400](images/iss-02-ac-3.png)

5. comprobamos AC-4 (compartidos): `ls src/app/shared/ui` + `grep -n "computed" src/app/shared/ui/status-tag/status-tag.ts` + prueba `status-tag.spec.ts`, que cambia el input de `active` a `inactive` y comprueba que cambia el color del `p-tag`

![AC-4: PageHeader, EmptyState y StatusTag; StatusTag cambia de color con su input](images/iss-02-ac-4.png)

6. comprobamos AC-5 (Shell y menú): `npm start` + `localhost:4200`, que redirige a `/dashboard` y carga el Shell con el menú de 8 entradas, y `localhost:4200/construir`, que sigue funcionando

![AC-5: localhost:4200 carga el Shell diferido con el menú Operación y 8 entradas en /dashboard](images/iss-02-ac-5-shell.png)

![AC-5: /construir sigue funcionando](images/iss-02-ac-5-construir.png)

![AC-5: la ruta final es /dashboard, el menú tiene las 8 entradas y la consola no tiene errores](images/iss-02-ac-5.png)

7. comprobamos AC-6 (build): `npx ng build 2>&1 | tail -15`

![AC-6: build completo sin errores y con el chunk shell aparte](images/iss-02-ac-6.png)


## ISS - 03

### OBJ

**OBJ:** Al finalizar, se podrá listar, buscar, crear, editar, desactivar y eliminar clientes desde la interfaz, con el estado de la pantalla en signals. Es el patrón que repiten las demás pantallas.

### AC

**AC:**
- [ ] **AC-1** `GET /api/clientes` pinta la tabla con los clientes activos del seeder, paginada.
- [ ] **AC-2** "Nuevo cliente" abre el diálogo, valida (email inválido o campos vacíos bloquean el envío) y crea con `POST`; la fila aparece sin recargar.
- [ ] **AC-3** Editar abre el mismo formulario con los datos cargados y hace `PATCH /api/clientes/:id` con 200 y sin `status` en el body.
- [ ] **AC-4** El buscador filtra sin recargar y sin peticiones nuevas en Network.
- [ ] **AC-5** Después de la baja lógica el cliente desaparece de la tabla; después de la física, también, y `GET /api/clientes/:id` responde 404.
- [ ] **AC-6** Un `numero_documento` repetido muestra el 409 en `p-message` y en un toast, y el diálogo sigue abierto.
- [ ] **AC-7** `ng serve` y `ng build` no muestran errores.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-03 del frontend, no del frontend entero.

Implementa los AC de projects/NorteCreativo/frontend/docs/trazabilidad_NC/ISS-03.md en projects/NorteCreativo/frontend.
Sigue la guia del docente (secciones 3.1 a 3.7) y su patron visual
(https://tecnogua.com/academic/site/frontend2026/express/construir/patron-visual/), adaptados a Norte Creativo.
Usa los modelos, ClienteApi, NotificationService, toApiMessage, PageHeader, EmptyState, StatusTag y *appHasPermission de ISS-02.
Contrato real en projects/NorteCreativo/backend_Express/src/features/business/clientes.

- core/utils/filter-rows.ts: funcion pura filterRows(rows, term, (row) => [campos]), sin mayusculas ni tildes.
- npx ng g component features/clientes/cliente-list y cliente-form (--skip-tests --defaults).
- ClienteForm sin llamadas a la API: input() cliente, resetKey, saving; output() saved y cancelled.
  NonNullableFormBuilder: tipo_documento (CC, NIT, CE, TI, PASAPORTE) requerido, numero_documento requerido,
  nombre requerido max 120, telefono opcional, email requerido y valido. effect() para rellenar; status no editable.
  Errores con p-message tras tocar el campo.
- ClienteList: signals rows, loading, saving, error, filter, dialogVisible, editing, resetKey; computed visibleRows
  (nombre, numero_documento, email, telefono) y title. p-table paginada y ordenable, buscador, StatusTag, acciones con
  aria-label, p-dialog (styleClass "w-full max-w-2xl mx-4").
  Botones de escritura con *appHasPermission: 'POST /api/clientes', 'PATCH /api/clientes/:id',
  'PATCH /api/clientes/:id/deactivate', 'DELETE /api/clientes/:id'.
- Crear POST, editar PATCH sin status, baja logica PATCH /:id/deactivate y baja fisica DELETE /:id, ambas con ConfirmDialog
  (el mensaje de la fisica dice que es irreversible). Recarga la lista despues de cada operacion.
- Estados: spinner, p-message persistente si falla la carga, p-message en el dialogo + toast si falla una operacion
  (el dialogo sigue abierto), EmptyState distinto sin datos y sin coincidencias, toast de exito.
- Ruta hija clientes del Shell con loadComponent.

Convenciones de la guia: inject() en vez de constructor, takeUntilDestroyed(destroyRef) en load(), computed en vez de getters.
Sin guards (ISS-09). Sin CSS propio, ::ng-deep ni selectores .p-*.
NO toques backend_Express, docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos y pasos exactos en el navegador);
que quedo fuera de alcance.
```

2. comprobamos AC-1 (listado + Network): backend con `AUTH_ENABLED=false` + `npm start` + `/clientes` con Network abierta; la primera petición es `GET /api/clientes` (200), el backend devuelve 36 clientes activos y la tabla pinta 10 por página en 4 páginas

![AC-1: la tabla de clientes, paginada, con el buscador y las acciones por fila](images/iss-03-ac-1-tabla.png)

![AC-1: GET /api/clientes con 200, 36 clientes activos y 10 filas por página](images/iss-03-ac-1.png)

3. comprobamos AC-2 (alta y validación): "Nuevo cliente" con los campos vacíos, luego con un email sin `@` y luego con datos válidos; en Network solo sale el `POST` cuando el formulario es válido, y la fila aparece sin recargar la página (el `POST` devuelve 201 y la lista se vuelve a pedir con un `GET`)

![AC-2: con los campos vacíos el formulario bloquea el envío y muestra los errores](images/iss-03-ac-2-vacios.png)

![AC-2: con un email inválido el formulario bloquea el envío](images/iss-03-ac-2-email-invalido.png)

![AC-2: con datos válidos el POST crea el cliente y aparece el toast de éxito](images/iss-03-ac-2-creado.png)

![AC-2: la fila del cliente nuevo aparece en la tabla sin recargar](images/iss-03-ac-2-fila.png)

![AC-2: pruebas del formulario y la petición POST con su cuerpo y su respuesta 201](images/iss-03-ac-2.png)

4. comprobamos AC-3 (PATCH): editar un cliente + Network → la petición PATCH → Payload y respuesta; el diálogo se abre con los datos cargados, el `PATCH /api/clientes/:id` devuelve 200 y el cuerpo no lleva `status`

![AC-3: el formulario de edición abre con los datos del cliente cargados](images/iss-03-ac-3-dialogo.png)

![AC-3: el cliente editado con su nuevo nombre y teléfono](images/iss-03-ac-3-editado.png)

![AC-3: PATCH con 200 y el cuerpo sin status](images/iss-03-ac-3.png)

5. comprobamos AC-4 (filtro): escribir en el buscador (por ejemplo `benitez`, sin tilde ni mayúsculas) y comprobar que Network no registra peticiones nuevas: la lista de peticiones es la misma antes y después de escribir

![AC-4: el buscador filtra la tabla sin recargar](images/iss-03-ac-4-filtro.png)

![AC-4: pruebas de filterRows y Network sin peticiones nuevas antes y después de escribir](images/iss-03-ac-4.png)

6. comprobamos AC-5 (bajas): desactivar un cliente y eliminar otro creado para la prueba, cada uno con su diálogo de confirmación (el de la baja física avisa que es irreversible) + `curl -s -i -w "\n" localhost:3012/api/clientes/<id>`; el cliente desactivado y el eliminado salen de la tabla, y el eliminado responde 404

![AC-5: antes de las bajas hay dos clientes de prueba en la tabla](images/iss-03-ac-5-antes.png)

![AC-5: confirmación de la baja lógica](images/iss-03-ac-5-confirmar-baja.png)

![AC-5: después de la baja lógica el cliente desaparece de la tabla](images/iss-03-ac-5-baja-logica.png)

![AC-5: confirmación de la baja física, que dice que es irreversible](images/iss-03-ac-5-confirmar-fisica.png)

![AC-5: después de la baja física el cliente también desaparece](images/iss-03-ac-5-despues.png)

![AC-5: el desactivado queda inactive, ya no sale en la lista y el eliminado responde 404](images/iss-03-ac-5.png)

7. comprobamos AC-6 (409): crear un cliente con un `numero_documento` del seeder; el mensaje sale en el `p-message` del diálogo y en un toast, y el diálogo sigue abierto

![AC-6: el 409 en el p-message del diálogo y en el toast, con el diálogo abierto](images/iss-03-ac-6-409.png)

![AC-6: POST con 409 y el mensaje del backend](images/iss-03-ac-6.png)

8. comprobamos AC-7 (build): `npx ng build 2>&1 | tail -15` + consola del navegador; `ng serve` también arrancó sin errores

![AC-7: build completo sin errores y consola del navegador sin errores](images/iss-03-ac-7.png)


## ISS - 04

### OBJ

**OBJ:** Al finalizar, se podrán gestionar las campañas de cada cliente desde la interfaz, viendo el nombre del cliente en lugar de su id y sin poder abrir campañas para clientes inactivos.

### AC

**AC:**
- [ ] **AC-1** La tabla lista las campañas activas con el nombre del cliente (no el id), y Network muestra `GET /api/campanias` y `GET /api/clientes` en paralelo.
- [ ] **AC-2** Crear y editar validan cliente obligatorio y nombre obligatorio con máximo 120; el select solo ofrece clientes activos.
- [ ] **AC-3** Crear una campaña para un cliente que se desactivó en otra pestaña muestra el 409 y el diálogo sigue abierto.
- [ ] **AC-4** Editar hace `PATCH` sin `status` y conserva el cliente elegido (`cliente_id` numérico); la baja lógica oculta la campaña del listado.
- [ ] **AC-5** El buscador y el filtro por cliente funcionan juntos sin peticiones nuevas.
- [ ] **AC-6** `/campanias` abre por URL directa (no solo por el menú) y `ng build` termina sin errores.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-04 del frontend, no del frontend entero.

Implementa los AC de projects/NorteCreativo/frontend/docs/trazabilidad_NC/ISS-04.md en projects/NorteCreativo/frontend.
Copia el patron EXACTO de src/app/features/clientes (ISS-03) y agrega la relacion many-to-one con cliente como en la
seccion 5.4 de la guia (carga en paralelo con forkJoin y Map en computed). Contrato real en
projects/NorteCreativo/backend_Express/src/features/business/campanias.

- npx ng g component features/campanias/campania-list y campania-form (--skip-tests --defaults).
- CampaniaList: forkJoin de CampaniaApi.list() y ClienteApi.list(); clientes solo se pide si
  session.canPermission('GET /api/clientes'), si no of([]). computed clientesPorId (Map id -> nombre) para la columna
  Cliente. Buscador por nombre, descripcion y nombre del cliente + filtro por cliente (p-select con "Todos") combinados
  en visibleRows. Acciones con *appHasPermission sobre /api/campanias.
- CampaniaForm sin API: input() campania, clientes, resetKey, saving; output() saved y cancelled.
  cliente_id con p-select (optionValue id, optionLabel nombre, filter) solo de clientes active, requerido;
  nombre requerido max 120; descripcion opcional (Textarea). status no editable.
- POST, PATCH sin status, PATCH /:id/deactivate y DELETE /:id con ConfirmDialog. Recarga tras cada operacion.
- Muestra con toApiMessage el 409 de cliente inactivo y el 404 de cliente inexistente; el dialogo sigue abierto.
- Ruta hija campanias del Shell con loadComponent.

No adelantes hitos ni tareas. Sin CSS propio.
NO toques backend_Express, docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos y pasos exactos en el navegador);
que quedo fuera de alcance.
```

2. comprobamos AC-1 (listado + Network): `/campanias` con Network abierta + `curl -s localhost:3012/api/campanias | head -c 300`

![AC-1: la tabla de campañas con el nombre del cliente en lugar del id](images/iss-04-ac-1-tabla.png)

![AC-1: GET /api/campanias y GET /api/clientes salen juntos al cargar, ambos con 200](images/iss-04-ac-1.png)

Abajo, el contenido real de la API: 1 campaña activa en la base y su `cliente_id`. La columna «Cliente» sale del `Map` id → nombre; si el cliente ya no está entre los activos, la tabla muestra `Cliente #id`.

3. comprobamos AC-2 (validación y select): "Nueva campaña" sin cliente ni nombre; desplegar el select de clientes

![AC-2: con cliente y nombre vacíos el formulario bloquea el envío y muestra los dos errores](images/iss-04-ac-2-vacios.png)

![AC-2: el select filtrado por «FRONT Cliente» solo ofrece Alfa y Beta; el cliente desactivado no aparece](images/iss-04-ac-2-select.png)

![AC-2: pruebas del formulario (cliente y nombre obligatorios, máximo 120, solo clientes activos, payload sin status)](images/iss-04-ac-2.png)

4. comprobamos AC-3 (409): desactivar un cliente en `/clientes` (otra pestaña) y, sin recargar, crearle una campaña

![AC-3: 409 en el p-message del diálogo y en el toast, con el diálogo abierto](images/iss-04-ac-3-409.png)

![AC-3: el mismo POST contra el backend responde 409 «No se crea campaña para un cliente inactivo»](images/iss-04-ac-3.png)

El cliente se desactivó por la API con el diálogo ya abierto (equivale a hacerlo en otra pestaña): el formulario aún lo ofrecía porque la lista de clientes se cargó antes.

5. comprobamos AC-4 (PATCH y baja): editar + Network → Payload; desactivar una campaña

![AC-4: el formulario de edición abre con cliente, nombre y descripción cargados](images/iss-04-ac-4-dialogo.png)

![AC-4: la campaña editada con su nuevo nombre y el mismo cliente](images/iss-04-ac-4-editado.png)

![AC-4: confirmación de la baja lógica](images/iss-04-ac-4-confirmar-baja.png)

![AC-4: tras la baja lógica la campaña ya no está en la tabla y sale el toast](images/iss-04-ac-4-baja.png)

![AC-4: la API ya no lista la campaña desactivada, pero el registro sigue existiendo](images/iss-04-ac-4.png)

El `PATCH /api/campanias/76` salió con el cuerpo `{"cliente_id":48,"nombre":"FRONT Lanzamiento Alfa v2","descripcion":"Campaña de prueba"}` (sin `status`, `cliente_id` numérico) y respondió 200; la baja fue `PATCH /api/campanias/77/deactivate` con 200.

6. comprobamos AC-5 (filtros): combinar el filtro por cliente y el buscador con Network abierta

![AC-5: filtro por cliente «FRONT Cliente Alfa» y buscador «carnaval» combinados dan cero resultados](images/iss-04-ac-5-combinado.png)

![AC-5: con el mismo cliente y el buscador «lanzamiento» queda solo la campaña de Alfa, no la de Beta](images/iss-04-ac-5-coincide.png)

![AC-5: Network después de filtrar y buscar solo tiene las dos peticiones de la carga inicial](images/iss-04-ac-5.png)

7. comprobamos AC-6 (URL directa y build): escribir `localhost:4200/campanias` + `npx ng build 2>&1 | tail -15`

![AC-6: URL directa, consola sin errores y build completo (chunk campania-list aparte)](images/iss-04-ac-6.png)


## ISS - 05

### OBJ

**OBJ:** Al finalizar, se podrá planear cada campaña en hitos y cada hito en tareas desde la interfaz, viendo el estado del hito (ABIERTO, CERRADO, FACTURADO) sin poder cambiarlo a mano.

### AC

**AC:**
- [ ] **AC-1** `/hitos` muestra la campaña por nombre y el estado con su color; `/tareas` muestra el hito por nombre.
- [ ] **AC-2** El formulario solo ofrece campañas activas y no tiene campo de estado; crear un hito responde 201 y aparece en ABIERTO.
- [ ] **AC-3** Crear un hito para una campaña inactiva falla con el 409 de RN-08 y el error se muestra al usuario.
- [ ] **AC-4** Editar conserva la campaña elegida (`campania_id` numérico) y el formulario bloquea el envío sin campaña.
- [ ] **AC-5** `abiertosCount()` coincide con las filas ABIERTO de la tabla.
- [ ] **AC-6** "Ver hitos" abre `/hitos?campania=<id>` ya filtrado y "Ver tareas" abre `/tareas?hito=<id>` ya filtrado.
- [ ] **AC-7** El CRUD de tareas funciona con confirmación y toast, y `ng build` no da errores ni avisos de presupuesto.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-05 del frontend, no del frontend entero.

Implementa los AC de projects/NorteCreativo/frontend/docs/trazabilidad_NC/ISS-05.md en projects/NorteCreativo/frontend.
Copia el patron EXACTO de src/app/features/campanias (ISS-04): forkJoin condicionado por canPermission, Map en computed,
filtros combinados en visibleRows, form sin API con input()/output(), ConfirmDialog, toApiMessage, *appHasPermission.
Contrato real en projects/NorteCreativo/backend_Express/src/features/business/hitos y tareas.

- npx ng g component features/hitos/hito-list, hito-form, features/tareas/tarea-list, tarea-form (--skip-tests --defaults).
- Hitos: columna Campaña por nombre, StatusTag para estado (ABIERTO, CERRADO, FACTURADO), fecha_cierre formateada.
  computed abiertosCount visible sobre la tabla. Filtros por campaña y estado + buscador.
  HitoForm: campania_id (campañas active, requerido), nombre requerido max 120, descripcion opcional.
  SIN campo estado ni fecha_cierre: el hito nace ABIERTO y lo cierra una aprobacion (el backend da 400 si se envia estado).
  Muestra 409 de campaña inactiva (RN-08) y 404.
- Tareas: columna Hito por nombre, filtro por hito. TareaForm: hito_id (hitos active, etiqueta "Campaña · Hito"),
  nombre requerido, descripcion opcional.
- POST, PATCH sin status, PATCH /:id/deactivate, DELETE /:id con confirmacion y *appHasPermission en ambos.
- Accion "Ver hitos" en la fila de campaña -> /hitos?campania=<id>; "Ver tareas" en la fila de hito -> /tareas?hito=<id>.
  El filtro se inicializa desde el query param con input() (withComponentInputBinding ya esta activo).
- Rutas hijas hitos y tareas del Shell con loadComponent.

No adelantes entregables. Sin CSS propio.
NO toques backend_Express, docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos y pasos exactos en el navegador);
que quedo fuera de alcance.
```

2. comprobamos AC-1 (listados): `/hitos` y `/tareas` + `curl -s localhost:3012/api/hitos | head -c 400`

![AC-1: /hitos con la campaña por nombre y el estado con su color (Abierto verde, Cerrado gris, Facturado azul)](images/iss-05-ac-1-hitos.png)

![AC-1: /tareas con el hito por nombre](images/iss-05-ac-1-tareas.png)

![AC-1: contenido real de la API de hitos y tareas, y las peticiones en paralelo](images/iss-05-ac-1.png)

Las campañas de otros hitos que ya no están activas salen como `Campaña #id`, igual que `Cliente #id` en ISS-04. En `/hitos` salen `GET /api/hitos` y `GET /api/campanias` en paralelo; en `/tareas`, `GET /api/tareas`, `GET /api/hitos` y `GET /api/campanias`.

3. comprobamos AC-2 (alta de hito): "Nuevo hito" + Network → respuesta con `estado: ABIERTO`

![AC-2: el select de campañas filtrado por «FRONT05» ofrece solo las campañas activas](images/iss-05-ac-2-select.png)

![AC-2: formulario con campaña, nombre y descripción; sin campo de estado](images/iss-05-ac-2-form.png)

![AC-2: el hito creado aparece con el toast de éxito](images/iss-05-ac-2-creado.png)

![AC-2: pruebas del formulario y el 400 del backend si se envía estado](images/iss-05-ac-2.png)

El `POST /api/hitos` salió con `{"campania_id":79,"nombre":"FRONT05 Hito Brief","descripcion":null}` y respondió 201 con `"estado":"ABIERTO"` y `"fecha_cierre":null`.

4. comprobamos AC-3 (409 RN-08): desactivar una campaña en otra pestaña y, sin recargar, crearle un hito

![AC-3: el 409 de RN-08 en el p-message del diálogo y en el toast, con el diálogo abierto](images/iss-05-ac-3-409.png)

![AC-3: el mismo POST contra el backend responde 409](images/iss-05-ac-3.png)

La campaña se desactivó por la API con el diálogo ya abierto (equivale a hacerlo en otra pestaña); el mensaje es «No se crea hito para una campaña inactiva».

5. comprobamos AC-4 (edición y validación): editar un hito + Payload; intentar guardar sin campaña

![AC-4: el formulario de edición abre con la campaña elegida y los datos del hito](images/iss-05-ac-4-dialogo.png)

![AC-4: sin campaña el formulario bloquea el envío y no hace ningún POST](images/iss-05-ac-4-sin-campania.png)

![AC-4: el hito guardado y las pruebas del formulario de tareas](images/iss-05-ac-4.png)

El `PATCH /api/hitos/103` salió con `{"campania_id":79,"nombre":"FRONT05 Hito Brief v2","descripcion":null}` (`campania_id` numérico, sin estado ni status) y respondió 200 con el hito aún en ABIERTO.

6. comprobamos AC-5 (conteo): comparar `abiertosCount` con el filtro de estado ABIERTO

![AC-5: con el filtro de estado ABIERTO la tabla muestra 7 filas, igual que el contador](images/iss-05-ac-5-abiertos.png)

![AC-5: contador, filas, conteo de la API y Network sin peticiones nuevas al filtrar](images/iss-05-ac-5.png)

7. comprobamos AC-6 (navegación): "Ver hitos" desde `/campanias` y "Ver tareas" desde `/hitos`, mostrando la URL

![AC-6: en /campanias, el botón «Ver hitos» de cada fila](images/iss-05-ac-6-campanias.png)

![AC-6: /hitos?campania=79 abre ya filtrado por esa campaña](images/iss-05-ac-6-hitos.png)

![AC-6: /tareas?hito=103 abre ya filtrado por ese hito](images/iss-05-ac-6-tareas.png)

![AC-6: la URL con su query param y la consola sin errores](images/iss-05-ac-6.png)

Los botones usan `Router.navigate` con `queryParams`; el componente recibe el parámetro como `input()` (`withComponentInputBinding`) y lo vuelve filtro.

8. comprobamos AC-7 (tareas y build): crear, editar, desactivar y eliminar una tarea + `npx ng build 2>&1 | tail -15`

![AC-7: el select de hitos muestra la etiqueta «Campaña · Hito»](images/iss-05-ac-7-select.png)

![AC-7: tarea creada](images/iss-05-ac-7-creada.png)

![AC-7: tarea editada](images/iss-05-ac-7-editada.png)

![AC-7: confirmación de la baja lógica](images/iss-05-ac-7-confirmar-baja.png)

![AC-7: tras la baja lógica la tarea ya no está en la tabla](images/iss-05-ac-7-baja.png)

![AC-7: confirmación de la baja física, irreversible](images/iss-05-ac-7-confirmar-fisica.png)

![AC-7: tras la baja física la tarea también desaparece](images/iss-05-ac-7-eliminada.png)

![AC-7: la API, el 404 de la tarea eliminada y el build sin errores ni avisos de presupuesto](images/iss-05-ac-7.png)

Peticiones del CRUD: `POST /api/tareas` 201, `PATCH /api/tareas/104` 200, `PATCH /api/tareas/104/deactivate` 200 y `DELETE /api/tareas/105` 200.


## ISS - 06

### OBJ

**OBJ:** Al finalizar, se podrán registrar los entregables de cada tarea y subir versiones para revisión, viendo en el detalle del entregable su historial de versiones, con el número de versión asignado por el backend y sin poder tocar una versión aprobada.

### AC

**AC:**
- [ ] **AC-1** `/entregables` muestra la tarea por nombre, el total en formato moneda y el estado con color.
- [ ] **AC-2** El formulario no deja guardar sin tarea, con `fecha_fin` anterior a `fecha_inicio` ni con total negativo.
- [ ] **AC-3** En `/entregables/:id`, "Nueva versión" crea una versión con 201 y aparece en la tabla con el `numero_version` siguiente y en EN_REVISION, sin que el formulario los pidiera.
- [ ] **AC-4** Una versión APROBADA no ofrece editar, desactivar ni eliminar; si se fuerza un PATCH con `curl`, el backend responde 409 (RN-04).
- [ ] **AC-5** Crear una versión para un entregable de un hito CERRADO muestra el 409 de RN-06 y no se crea ninguna fila.
- [ ] **AC-6** Recargar `/entregables/:id` en el navegador carga el detalle, y `ng build` no da errores.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-06 del frontend, no del frontend entero.

Implementa los AC de projects/NorteCreativo/frontend/docs/trazabilidad_NC/ISS-06.md en projects/NorteCreativo/frontend.
Copia el patron EXACTO de src/app/features/hitos y tareas (ISS-05). Para el detalle enrutado usa la idea de
cabecera + lineas de la guia (seccion 7.5). Contrato real en projects/NorteCreativo/backend_Express/src/features/business/
entregables y version-entregables (sobres { entregables } / { entregable }, { versiones } / { version }).

- npx ng g component features/entregables/entregable-list, entregable-form, entregable-detail;
  features/versiones/version-list, version-form (--skip-tests --defaults).
- Entregables: columna Tarea por nombre, fechas, total en moneda COP con toNumber, StatusTag EN_PROCESO/ENTREGADO,
  filtros por tarea y estado. Form: tarea_id (tareas active, etiqueta "Hito · Tarea") requerido, DatePicker de inicio y fin
  con validador de grupo fin >= inicio, total InputNumber moneda min 0 convertido con Number(), estado EN_PROCESO/ENTREGADO,
  observaciones. CRUD completo con *appHasPermission.
- Detalle /entregables/:id (lee id con input(), EntregableApi.get): cabecera + tabla de sus versiones (filtradas por
  entregable_id, orden numero_version desc) + computed ultimaVersion y pendientes + boton "Nueva version" con
  *appHasPermission="'POST /api/version-entregables'" y entregable_id fijo.
- /versiones: listado global con columna Entregable ("Tarea · total", o "#<id> · total" si no hay permiso de tareas) y filtros. VersionForm SIN numero_version ni estado.
  Version APROBADA sin acciones de editar/desactivar/eliminar; muestra 409 RN-04 y 409 RN-06 con toApiMessage.
- Rutas hijas entregables, entregables/:id y versiones del Shell con loadComponent.

No adelantes aprobaciones (ISS-07). Sin CSS propio.
NO toques backend_Express, docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (pasos exactos en el navegador y curl para forzar
el 409); que quedo fuera de alcance.
```

2. comprobamos AC-1 (listado): `/entregables`

![AC-1: /entregables con la tarea por nombre, el total en pesos y el estado con color](images/iss-06-ac-1-lista.png)

![AC-1: contenido real de la API (el total llega como número y se formatea con toNumber)](images/iss-06-ac-1.png)

En la lista salen `GET /api/entregables`, `GET /api/tareas` y `GET /api/hitos` en paralelo. Las tareas que ya no están activas se muestran como `Tarea #id`.

3. comprobamos AC-2 (validaciones): guardar sin tarea, con fecha fin anterior a la de inicio y con total negativo

![AC-2: sin tarea el formulario bloquea el envío y muestra el error](images/iss-06-ac-2-sin-tarea.png)

![AC-2: con fin anterior a inicio y total negativo, dos errores y ningún POST](images/iss-06-ac-2-invalidos.png)

![AC-2: con datos válidos el formulario está listo para guardar](images/iss-06-ac-2-valido.png)

![AC-2: el entregable creado aparece en la tabla con el toast de éxito](images/iss-06-ac-2-creado.png)

![AC-2: pruebas del formulario (tarea requerida, solo activas con «Hito · Tarea», fechas, total, número)](images/iss-06-ac-2.png)

El `POST /api/entregables` salió con `{"tarea_id":107,"fecha_inicio":"2026-10-10T05:00:00.000Z","fecha_fin":"2026-10-20T05:00:00.000Z","total":1500000,"estado":"EN_PROCESO","observaciones":null}` (total numérico) y respondió 201.

4. comprobamos AC-3 (nueva versión): `/entregables/<id>` → "Nueva versión" + Network → Payload (sin `numero_version`) y respuesta (con `numero_version`)

![AC-3: el detalle de un entregable sin versiones](images/iss-06-ac-3-detalle-vacio.png)

![AC-3: el formulario de «Nueva versión» solo pide fechas, total y observaciones](images/iss-06-ac-3-form.png)

![AC-3: tras crear dos versiones, v2 y v1 en EN_REVISION con el resumen en la cabecera](images/iss-06-ac-3-detalle.png)

![AC-3: las versiones en la API y las pruebas de VersionForm](images/iss-06-ac-3.png)

Primer POST: cuerpo `{"entregable_id":107,"fecha_inicio":null,"fecha_fin":null,"total":800000,"observaciones":null}` (sin `numero_version` ni `estado`), respuesta 201 con `"numero_version":1` y `"estado":"EN_REVISION"`. Segundo POST: respuesta 201 con `"numero_version":2`.

5. comprobamos AC-4 (RN-04): fila APROBADA sin acciones + `curl -i -X PATCH localhost:3012/api/version-entregables/<id> -H 'Content-Type: application/json' -d '{"observaciones":"x"}'`

![AC-4: en el entregable #1 la versión APROBADA no tiene acciones, solo el candado](images/iss-06-ac-4-aprobada.png)

![AC-4: el PATCH forzado con curl a la versión 6 responde 409 (RN-04)](images/iss-06-ac-4.png)

6. comprobamos AC-5 (RN-06): nueva versión sobre un entregable de un hito CERRADO + `curl -s localhost:3012/api/version-entregables | jq '.versiones | length'` antes y después

![AC-5: crear una versión para un entregable de un hito CERRADO muestra el 409 de RN-06 con el diálogo abierto](images/iss-06-ac-5-409.png)

![AC-5: el conteo de versiones es 107 antes y después, y el mismo POST con curl da 409](images/iss-06-ac-5.png)

7. comprobamos AC-6 (recarga y build): F5 en `/entregables/<id>` + `npx ng build 2>&1 | tail -15`

![AC-6: /entregables/107 recargado con F5 carga el detalle completo](images/iss-06-ac-6-recarga.png)

![AC-6: el listado global /versiones con la columna «Tarea · total» y las APROBADAS con candado](images/iss-06-versiones.png)

![AC-6: la URL tras recargar, la consola sin errores y el build completo](images/iss-06-ac-6.png)

Al recargar, el detalle pide `GET /api/entregables/107`, `GET /api/tareas/107` y `GET /api/version-entregables`.


## ISS - 07

### OBJ

**OBJ:** Al finalizar, el frontend tendrá la pantalla para registrar el veredicto sobre una versión (la operación que cierra el hito en una sola transacción), el historial de aprobaciones y un dashboard coherente con los listados, y la Fase I quedará cerrada con todas las pantallas de negocio funcionando.

### AC

**AC:**
- [ ] **AC-1** `/aprobaciones` lista el historial con la versión resuelta por nombre y sin acciones de editar ni eliminar.
- [ ] **AC-2** El select solo ofrece versiones EN_REVISION, RECHAZADA sin comentario no deja enviar, y el body no lleva `aprobador_id` (Network → Payload).
- [ ] **AC-3** En modo práctica, enviar el formulario muestra el mensaje del 401 de RN-05 y no se crea ninguna fila.
- [ ] **AC-4** Con `curl` y el token de `aprobador`, aprobar la única versión EN_REVISION de un hito con un solo entregable responde 201 con `hito_cerrado: true`; al recargar, `/hitos` muestra el hito CERRADO y `/aprobaciones` la fila nueva.
- [ ] **AC-5** Con `curl`, otra aprobación sobre una versión de ese hito responde 409 y nada cambia en la UI.
- [ ] **AC-6** El dashboard carga sin errores, los KPIs coinciden con los listados y se recalculan al volver después de crear o desactivar registros.
- [ ] **AC-7** Cierre de la Fase I: los endpoints de negocio responden 200 sin token, el recorrido visual pasa sin errores en consola y `ng build` termina sin errores.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-07 del frontend, no del frontend entero.

Implementa los AC de projects/NorteCreativo/frontend/docs/trazabilidad_NC/ISS-07.md en projects/NorteCreativo/frontend.
Copia el patron de src/app/features/versiones (ISS-06). Para el formulario transaccional sigue la idea de /ventas/nueva
de la guia (formulario con signals en tres bloques, un solo POST, navegar al listado al guardar) y para el dashboard
las secciones 7.6 y 7.7.
Contrato en projects/NorteCreativo/backend_Express/src/features/business/aprobaciones: solo GET y POST;
POST responde 201 { aprobacion, hito_cerrado, hito_id, fecha_cierre }; aprobador_id en el body da 400 (RN-05);
hito cerrado da 409; exige JWT incluso con AUTH_ENABLED=false.

- npx ng g component features/aprobaciones/aprobacion-list y aprobacion-form (--skip-tests --defaults).
- Historial /aprobaciones: forkJoin aprobaciones + versiones, columna "Entregable · v<numero_version>", StatusTag,
  comentario, fecha. Sin editar ni eliminar.
- /aprobaciones/nueva: bloque version (solo EN_REVISION, etiqueta "Entregable #<id> · v<numero_version> · <total>",
  sin depender de tareas porque CLIENTE_APROBADOR no las lee), bloque veredicto
  (APROBADA/RECHAZADA con p-selectbutton, comentario requerido en la UI si RECHAZADA), bloque resumen. Un solo POST con
  { version_entregable_id, estado, comentario }, nunca aprobador_id. hito_cerrado true -> toast "Hito cerrado" con fecha;
  si no, toast del veredicto; luego navega a /aprobaciones. Errores 401 (explica que requiere sesion de CLIENTE_APROBADOR,
  llega en ISS-08), 404 y 409 con toApiMessage. Lee ?version=<id> con input() para preseleccionar.
- Accion "Revisar" en filas EN_REVISION de /versiones y del detalle del entregable -> /aprobaciones/nueva?version=<id>.
  Boton y accion con *appHasPermission="'POST /api/aprobaciones'".
- Dashboard (completa el provisional de ISS-02): forkJoin de clientes, campanias, hitos, versiones, aprobaciones, cada
  peticion solo si canPermission('GET /api/...'), si no of([]). KPIs en p-card con Skeleton (clientes activos, campañas
  activas, hitos ABIERTOS, hitos CERRADOS, versiones EN_REVISION). computed pendientes (5), ultimasAprobaciones (5),
  hitosPorEstado. Tablas de pendientes y ultimas aprobaciones.
- Rutas aprobaciones y aprobaciones/nueva en el Shell; dashboard sigue como hija por defecto.

No agregues interceptor, guard, AuthService ni Authorization (Fase II). Sin CSS propio.
NO toques backend_Express, docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (pasos en el navegador y curl exactos con login
de aprobador para el cierre de hito); que quedo fuera de alcance.
```

2. comprobamos AC-1 (historial): `/aprobaciones`

![AC-1: el historial de aprobaciones con «Entregable #id · vN», el veredicto con color y sin acciones de editar ni eliminar](images/iss-07-ac-1-historial.png)

![AC-1: contenido real de la API de aprobaciones](images/iss-07-ac-1.png)

Salen `GET /api/aprobaciones` y `GET /api/version-entregables` en paralelo. Una versión que ya no está activa se muestra como `Versión #id`.

3. comprobamos AC-2 (payload): abrir `/aprobaciones/nueva`, elegir RECHAZADA sin comentario; luego enviar una válida y revisar Network → Payload

![AC-2: el select de versiones solo ofrece las EN_REVISION, con la etiqueta «Entregable #id · vN · total»](images/iss-07-ac-2-select.png)

![AC-2: RECHAZADA sin comentario no deja enviar y muestra el error; ningún POST](images/iss-07-ac-2-sin-comentario.png)

![AC-2: formulario válido con los tres bloques y el resumen](images/iss-07-ac-2-valido.png)

![AC-2: pruebas del formulario (solo EN_REVISION, preselección por ?version, comentario obligatorio, payload sin aprobador_id)](images/iss-07-ac-2.png)

![«Revisar» en el detalle del entregable lleva al formulario](images/iss-07-revisar-detalle.png)

![El formulario abre con la versión ya elegida en /aprobaciones/nueva?version=112](images/iss-07-revisar-form.png)

El cuerpo del POST fue `{"version_entregable_id":113,"estado":"RECHAZADA","comentario":"Falta ajustar el logo"}`: sin `aprobador_id`.

4. comprobamos AC-3 (401 RN-05): enviar el formulario con el backend en `AUTH_ENABLED=false`

![AC-3: el 401 de RN-05 en el mensaje del formulario y en el toast, explicando que requiere sesión de CLIENTE_APROBADOR](images/iss-07-ac-3-401.png)

![AC-3: el POST sin token responde 401 y el conteo de aprobaciones no cambia](images/iss-07-ac-3.png)

5. comprobamos AC-4 (cierre de hito): `TOKEN=$(curl -s -X POST localhost:3012/api/sesion/login -H 'Content-Type: application/json' -d '{"identifier":"aprobador","password":"Aprobador123!"}' | jq -r .access_token)` + `curl -i -X POST localhost:3012/api/aprobaciones -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"version_entregable_id":<id>,"estado":"APROBADA"}'` + recargar `/hitos` y `/aprobaciones`

![AC-4: antes del veredicto el hito de prueba sigue ABIERTO](images/iss-07-ac-4-hito-antes.png)

![AC-4: el POST con el token de aprobador responde 201 con hito_cerrado true y el hito queda CERRADO](images/iss-07-ac-4.png)

![AC-4: al recargar, /hitos muestra el hito CERRADO con su fecha y el contador baja a 6](images/iss-07-ac-4-hito-despues.png)

![AC-4: /aprobaciones muestra la fila nueva](images/iss-07-ac-4-historial.png)

Los datos fueron un hito con un solo entregable y dos versiones; se aprobó la última (v2), que es la que evalúa el cierre.

6. comprobamos AC-5 (409 hito cerrado): repetir el POST sobre otra versión del hito ya CERRADO

![AC-5: otra aprobación sobre una versión del hito ya cerrado responde 409 y el conteo no cambia](images/iss-07-ac-5.png)

7. comprobamos AC-6 (dashboard): comparar KPIs con los listados; crear o desactivar un registro y volver

![AC-6: el panel con los cinco KPIs, las versiones pendientes y las últimas aprobaciones](images/iss-07-ac-6-dashboard.png)

![AC-6: tras crear un cliente y volver al panel, «Clientes activos» sube de 37 a 38](images/iss-07-ac-6-mas-uno.png)

![AC-6: los KPIs del panel frente a los conteos de la API](images/iss-07-ac-6.png)

El panel pide `GET /api/clientes`, `campanias`, `hitos`, `version-entregables` y `aprobaciones` en paralelo. Al desactivar el cliente de prueba y volver, el KPI regresó a 37.

8. comprobamos AC-7 (cierre Fase I): `for p in clientes campanias hitos tareas entregables version-entregables aprobaciones; do echo "== $p"; curl -s -o /dev/null -w "%{http_code}\n" localhost:3012/api/$p; done` + recorrido por `/dashboard`, `/clientes`, `/campanias`, `/hitos`, `/tareas`, `/entregables`, `/entregables/<id>`, `/versiones`, `/aprobaciones` + `npx ng build 2>&1 | tail -20`

![AC-7: los siete endpoints de negocio responden 200 sin token, el recorrido de diez pantallas sin errores de consola y el build completo](images/iss-07-ac-7.png)


## FASE 2 - AUTH CON RBAC

Para la fase ii ponemos requireAuth en true en los dos environments y AUTH_ENABLED en true en el .env del backend, y limpiamos nortecreativo.session.v1 del localStorage. El login del backend solo devuelve el par de tokens, el perfil y los permisos se piden despues con forkjoin, y los roles no viajan en el jwt, la ui decide que mostrar con get /api/permisos y el backend vuelve a validar cada peticion. Probamos con los 5 usuarios del seeder, admin, cuentas, creativo, aprobador y finanzas, para ver el menu y los botones de cada rol y los 401 y 403.

## ISS - 08

### OBJ

**OBJ:** Al finalizar, cada usuario de Norte Creativo podrá iniciar sesión, ver su perfil y sus permisos efectivos y cerrar sesión, y la aplicación renovará el access token sin que lo note con el refresh token rotativo del backend.

### AC

**AC:**
- [ ] **AC-1** Con `requireAuth: true`, `/dashboard` sin sesión redirige a `/login?returnUrl=%2Fdashboard`.
- [ ] **AC-2** Login con `admin` / `Admin123!` guarda los tokens y carga perfil y permisos; `/perfil` muestra ADMIN y 85 permisos. Con `finanzas` muestra FINANZAS y 11.
- [ ] **AC-3** En Application → Local Storage está `nortecreativo.session.v1` con `accessToken`, `refreshToken`, `usuario` y `permisos`.
- [ ] **AC-4** Cada petición protegida lleva `Authorization: Bearer <access>`; `login` y `refresh` no.
- [ ] **AC-5** Con el access vencido o alterado, navegar a `/clientes` muestra en Network: `GET /api/clientes` → 401, un solo `POST /api/sesion/refresh` → 200, y el reintento → 200.
- [ ] **AC-6** "Cerrar sesión" borra el storage y vuelve a `/login`; ese refresh ya no sirve (`curl` → 401). Reusar un refresh ya rotado responde 401 y el front limpia la sesión.
- [ ] **AC-7** Con `aprobador`, el formulario de ISS-07 registra un veredicto con 201, y `ng serve` / `ng build` no muestran errores.

### Procedimiento

1. pegamos el prompt 

``` text
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

2. comprobamos AC-1 (redirección): storage vacío + abrir `localhost:4200/dashboard`

![AC-1: sin sesión, /dashboard redirige a /login con returnUrl](images/iss-08-ac-1-login.png)

Con el storage vacío, `localhost:4200/dashboard` terminó en `http://localhost:4200/login?returnUrl=%2Fdashboard`.

3. comprobamos AC-2 (perfil): login de `admin` y de `finanzas` + `/perfil`

![AC-2: formulario de login con el usuario y la contraseña de admin](images/iss-08-ac-2-form.png)

![AC-2: /perfil de admin con rol ADMIN y 85 permisos](images/iss-08-ac-2-perfil-admin.png)

![AC-2: el menú de usuario del encabezado (Mi sesión, Actualizar permisos, Cerrar sesión)](images/iss-08-menu-usuario.png)

![AC-2: /perfil de finanzas con rol FINANZAS y 11 permisos](images/iss-08-ac-2-perfil-finanzas.png)

![AC-2: pruebas del guard de autenticación](images/iss-08-ac-2.png)

El login hizo `POST /api/sesion/login` → `GET /api/sesion/perfil` → `GET /api/permisos`, los tres con 200, y redirigió al `returnUrl`.

4. comprobamos AC-3 (storage): DevTools → Application → Local Storage

![AC-3: la clave nortecreativo.session.v1 con accessToken, refreshToken, usuario y permisos](images/iss-08-ac-3.png)

5. comprobamos AC-4 (cabeceras): Network → `clientes` → Headers; y `login` → Headers

![AC-4: login sin Authorization; GET /api/clientes con Bearer; pruebas del interceptor](images/iss-08-ac-4.png)

6. comprobamos AC-5 (refresh único): alterar `accessToken` en el storage + ir a `/clientes` + Network filtrando `clientes|refresh`

![AC-5: con el access alterado, /clientes se carga sin que el usuario note nada](images/iss-08-ac-5-clientes.png)

![AC-5: GET clientes 401, un solo POST refresh 200 y el reintento 200](images/iss-08-ac-5.png)

La prueba `varios 401 a la vez comparten un solo refresh` cubre además el caso de varias peticiones simultáneas.

7. comprobamos AC-6 (logout y reuse): copiar el `refreshToken` antes de salir + `curl -i -X POST localhost:3012/api/sesion/refresh -H 'Content-Type: application/json' -d '{"refresh_token":"<token>"}'`

![AC-6: «Cerrar sesión» vuelve a /login](images/iss-08-ac-6-logout.png)

![AC-6: el storage queda vacío y el refresh de esa sesión ya no sirve (401)](images/iss-08-ac-6.png)

![AC-6: el refresh ya rotado, reusado con curl, responde 401 y revoca la familia](images/iss-08-ac-6-reuso-curl.png)

![AC-6: al reusarse, el siguiente refresh del front da 401: se limpia la sesión y sale el aviso «Sesión expirada»](images/iss-08-ac-6-reuso.png)

8. comprobamos AC-7 (veredicto y build): login de `aprobador` + `/aprobaciones/nueva` + `npx ng build 2>&1 | tail -15`

![AC-7: tras entrar con aprobador, el menú solo muestra lo que su rol puede leer](images/iss-08-ac-7-aprobador.png)

![AC-7: el formulario de veredicto con la versión preseleccionada](images/iss-08-ac-7-form.png)

![AC-7: POST /api/aprobaciones responde 201, el toast «Hito cerrado» y la fila nueva en el historial](images/iss-08-ac-7-resultado.png)

![AC-7: el POST con 201 y el build sin errores](images/iss-08-ac-7.png)


## ISS - 09

### OBJ

**OBJ:** Al finalizar, cada uno de los 5 roles de Norte Creativo verá solo las pantallas y acciones que su matriz le concede, llegará a `/forbidden` si entra por URL a una que no le corresponde, y el menú cambiará sin recargar cuando cambien sus permisos.

### AC

**AC:**
- [ ] **AC-1** Sin sesión, cualquier ruta protegida lleva a `/login` con `returnUrl`; con sesión, `/login` lleva a `/dashboard`.
- [ ] **AC-2** El menú de cada uno de los 5 usuarios coincide con la columna "Menú visible" de la matriz.
- [ ] **AC-3** `finanzas` escribe `/tareas` en la URL y llega a `/forbidden`, donde se lee `GET /api/tareas`.
- [ ] **AC-4** Los botones de escritura desaparecen cuando falta el POST, PATCH o DELETE: `cuentas` no los ve en `/clientes` y sí en `/campanias`; `creativo` en `/versiones` ve crear y editar, pero no desactivar ni eliminar; `aprobador` ve "Revisar" y `admin` no.
- [ ] **AC-5** Después de conceder `GET /api/tareas` a FINANZAS con `curl` (token de admin), `finanzas` pulsa "Actualizar permisos" y aparece Tareas en el menú sin recargar; al retirar la concesión y actualizar otra vez, desaparece.
- [ ] **AC-6** `finanzas` hace desde la consola un `fetch` a `/api/usuarios` con su token y obtiene 403 (el backend manda); sin token el resultado es 401.
- [ ] **AC-7** `ng serve` y `ng build` no muestran errores.

### Procedimiento

1. pegamos el prompt 

``` text
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

2. comprobamos AC-1 (redirecciones): sin sesión abrir `/hitos`; con sesión abrir `/login`

Sin sesión, `/hitos` terminó en `/login?returnUrl=%2Fhitos`:

![AC-1 sin sesión](images/iss-09-ac-1-sin-sesion.png)

Con sesión, `/login` terminó en `/dashboard`:

![AC-1 con sesión](images/iss-09-ac-1-con-sesion.png)

3. comprobamos AC-2 (menú ×5): login con `admin`, `cuentas`, `creativo`, `aprobador` y `finanzas`

El menú coincide con la matriz de cada rol (nota: el usuario `cuentas` del seed también tiene el rol CREATIVO, por eso `/api/permisos` le da 42 y no 36).

`admin` (85 permisos), 8 ítems:

![admin](images/iss-09-ac-2-menu-admin.png)

`cuentas`, 8 ítems:

![cuentas](images/iss-09-ac-2-menu-cuentas.png)

`creativo` (sin Clientes ni Aprobaciones):

![creativo](images/iss-09-ac-2-menu-creativo.png)

`aprobador` (sin Clientes ni Tareas):

![aprobador](images/iss-09-ac-2-menu-aprobador.png)

`finanzas` (solo Clientes, Campañas y Hitos):

![finanzas](images/iss-09-ac-2-menu-finanzas.png)

4. comprobamos AC-3 (forbidden): `finanzas` + escribir `localhost:4200/tareas`

`finanzas` escribió `localhost:4200/tareas` y la URL quedó en `/forbidden?permission=GET%20%2Fapi%2Ftareas`, con el permiso requerido visible y el botón «Volver al panel»:

![AC-3 forbidden](images/iss-09-ac-3-forbidden.png)

5. comprobamos AC-4 (botones): `cuentas` en `/clientes` y `/campanias`; `creativo`, `aprobador` y `admin` en `/versiones`

`cuentas` en `/clientes`: sin botón «Nuevo» ni columna «Acciones» (solo tiene GET):

![cuentas clientes](images/iss-09-ac-4-cuentas-clientes.png)

`cuentas` en `/campanias`: Nueva campaña, Ver hitos, Editar, Desactivar y Eliminar:

![cuentas campañas](images/iss-09-ac-4-cuentas-campanias.png)

`creativo` en `/versiones`: solo Editar (sin Desactivar ni Eliminar):

![creativo versiones](images/iss-09-ac-4-creativo-versiones.png)

`creativo` en el detalle de un entregable: aparece «Nueva versión» (el botón de crear vive en el detalle, donde la lista tiene `entregableId`):

![creativo detalle](images/iss-09-ac-4-creativo-detalle.png)

`aprobador` en `/versiones`: solo «Revisar»:

![aprobador versiones](images/iss-09-ac-4-aprobador-versiones.png)

`admin` en `/versiones`: Editar, Desactivar y Eliminar, pero no «Revisar» (POST /api/aprobaciones es solo de CLIENTE_APROBADOR):

![admin versiones](images/iss-09-ac-4-admin-versiones.png)

6. comprobamos AC-5 (actualizar permisos): `curl -s -X POST localhost:3012/api/concesiones-rol -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"role_id":<FINANZAS>,"resource_id":<GET /api/tareas>}'` + "Actualizar permisos" + `PATCH /api/concesiones-rol/<id>/deactivate`

`finanzas` antes (sin Tareas):

![antes](images/iss-09-ac-5-1-antes.png)

Concesión con el token de admin (role 5 = FINANZAS, recurso 22 = `GET /api/tareas`):

![curl concesión](images/iss-09-ac-5-curl.png)

Menú de usuario con «Actualizar permisos»:

![menú usuario](images/iss-09-ac-5-2-menu-usuario.png)

Tras pulsarlo, Tareas aparece sin recargar:

![concedido](images/iss-09-ac-5-3-concedido.png)

Retiro de la concesión:

![curl retiro](images/iss-09-ac-5-curl-retiro.png)

Tras «Actualizar permisos» otra vez, Tareas desaparece:

![retirado](images/iss-09-ac-5-4-retirado.png)

7. comprobamos AC-6 (403 vs 401): `fetch('http://localhost:3012/api/usuarios',{headers:{Authorization:'Bearer '+JSON.parse(localStorage.getItem('nortecreativo.session.v1')).accessToken}}).then(r=>console.log(r.status))` y el mismo sin cabecera

Con token, 403; sin token, 401:

![AC-6](images/iss-09-ac-6.png)

8. comprobamos AC-7 (build): `npx ng build 2>&1 | tail -15`

5 pruebas de guards y el build sin errores:

![AC-7](images/iss-09-ac-7.png)


## ISS - 10

### OBJ

**OBJ:** Al finalizar, ADMIN podrá gestionar usuarios, roles y recursos, asignar roles a usuarios, conceder recursos a roles y ver los permisos efectivos de cualquier usuario desde la interfaz, sin reiniciar el backend para que los cambios surtan efecto.

### AC

**AC:**
- [ ] **AC-1** `admin` lista, crea y edita usuarios; la contraseña y el estado solo se envían al crear (Network → Payload) y la respuesta nunca trae `password`. El propio `admin` no puede desactivarse ni eliminarse desde la UI.
- [ ] **AC-2** "Ver permisos" de `finanzas` muestra sus 11 permisos con método, ruta y rol; `GET /api/usuarios/:id/permisos` aparece en el catálogo y `check-resource-catalog.ts` da OK.
- [ ] **AC-3** Roles: CRUD con baja lógica; un rol creado como "auditor" se guarda como "AUDITOR".
- [ ] **AC-4** Recursos: crear, editar, desactivar y eliminar; un `path` sin `/api/` no deja enviar y un par repetido muestra el 409.
- [ ] **AC-5** Asignaciones: crear el vínculo usuario-rol y retirarlo; repetir uno activo muestra el 409 y crear uno retirado lo reactiva sin duplicar la fila. Al retirar FINANZAS de un usuario, su siguiente petición a `/api/clientes` responde 403 sin reiniciar el backend.
- [ ] **AC-6** Concesiones: el select muestra "MÉTODO ruta"; una concesión retirada desaparece del menú del rol afectado tras "Actualizar permisos".
- [ ] **AC-7** `cuentas` no ve el grupo Seguridad y `/admin/usuarios` por URL lo lleva a `/forbidden`; `ng serve` y `ng build` no muestran errores.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-10 del frontend, no del frontend entero.

Implementa los AC de projects/NorteCreativo/frontend/docs/trazabilidad_NC/ISS-10.md.
Sigue la guia del docente (secciones 10.1 a 10.9). Contrato real en projects/NorteCreativo/backend_Express/src/features/auth
(users, roles, resources, role-users, resource-roles). Campos aceptados: usuario create username, email, password, status /
update username, email; rol name, description; recurso method, path, description; asignacion user_id, role_id;
concesion role_id, resource_id. Sobres { usuarios } / { usuario }, { roles } / { rol }, { recursos } / { recurso },
{ asignaciones } / { asignacion }, { concesiones } / { concesion }.

1) Backend (minimo): agrega GET /api/usuarios/:id/permisos con authenticate + authorize, reutilizando
   findEffectiveForUser de resource-roles.repository.ts y respondiendo { total, permisos: [{ method, path, roles }] }
   igual que /api/permisos. Registralo en resource-catalog.ts y en Swagger. Verifica con npx tsc --noEmit y
   npx ts-node scripts/check-resource-catalog.ts. No toques la matriz de roles.
2) Frontend: npx ng g component features/admin/usuarios/usuario-list, usuario-form, roles/rol-list, rol-form,
   recursos/recurso-list, recurso-form, asignaciones/asignacion-list, concesiones/concesion-list (--skip-tests --defaults).
   Patron EXACTO de las pantallas de la Fase I.
   - Usuarios: password (p-password toggleMask) y status solo al crear; PATCH solo username y email; isSelf deshabilita
     desactivar/eliminar; 409 visible; "Ver permisos" en dialogo con GET /api/usuarios/:id/permisos.
   - Roles: name y description, baja logica, 409. Recursos: method p-select, path con validador que empiece por /api/,
     description, 409.
   - Asignaciones y concesiones: nombres con forkJoin + Map, SIN DELETE, deactivate y reactivate, filtros por usuario y
     por rol, select de recurso con etiqueta "METHOD path".
   - Rutas /admin/usuarios, /admin/roles, /admin/recursos, /admin/asignaciones, /admin/permisos con permissionGuard y
     data.permission (GET /api/usuarios, roles, recursos, asignaciones-rol, concesiones-rol). Grupo "Seguridad" en NAV.
   - Acciones con *appHasPermission.

Sin cambio de contrasena ni sesiones propias. Prohibido en el backend: force: true, alter, cambiar puerto o base.
NO toques docs/proceso.md ni docs/trazabilidad_NC/ de ningun proyecto. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (pasos en el navegador con cada usuario y curl
exactos); que quedo fuera de alcance.
```

Salida:
<!-- pegar captura del resumen que entrega claude code -->

2. comprobamos AC-1 (usuarios): crear `prueba_front` + Network → Payload y respuesta; editarlo; fila de `admin` sin bajas

<!-- pegar captura -->

3. comprobamos AC-2 (ver permisos): "Ver permisos" de `finanzas` + `npx ts-node scripts/check-resource-catalog.ts` en `backend_Express`

<!-- pegar captura -->

4. comprobamos AC-3 (roles): crear "auditor" y ver la fila

<!-- pegar captura -->

5. comprobamos AC-4 (recursos): path `clientes` sin `/api/`; repetir `GET /api/clientes`

<!-- pegar captura -->

6. comprobamos AC-5 (asignaciones y 403): asignar FINANZAS a `prueba_front`, entrar con él, retirar la asignación desde `admin` y recargar `/clientes` con `prueba_front`

<!-- pegar captura -->

7. comprobamos AC-6 (concesiones): retirar una concesión de FINANZAS + "Actualizar permisos" con `finanzas`; luego reactivarla

<!-- pegar captura -->

8. comprobamos AC-7 (forbidden y build): `cuentas` + `localhost:4200/admin/usuarios` + `npx ng build 2>&1 | tail -15`

<!-- pegar captura -->


## ISS - 11

### OBJ

**OBJ:** Al finalizar, el frontend de Norte Creativo será reproducible y desplegable: compila para producción dentro de presupuesto, pasa el formato, cambia entre Fase I y Fase II con una sola bandera, y queda demostrado el recorrido completo de una campaña hasta el cierre del hito con los 5 roles.

### AC

**AC:**
- [ ] **AC-1** `npx ng build` termina con 0 errores y sin avisos de presupuesto que impidan el despliegue.
- [ ] **AC-2** Los 15 puntos del checklist de humo pasan.
- [ ] **AC-3** Cambiar `requireAuth` en los dos entornos (con `AUTH_ENABLED` igual en el backend) produce el comportamiento de cada fase.
- [ ] **AC-4** Revocar el refresh token con `curl` cierra la sesión de forma controlada, con toast.
- [ ] **AC-5** `npm run format:check` no reporta archivos sin formatear.
- [ ] **AC-6** `dist/` se sirve con fallback SPA y las rutas profundas recargan bien.
- [ ] **AC-7** `docs/problemas.md` y `README.md` del frontend existen y coinciden con lo que pasó en el recorrido.

### Procedimiento

1. pegamos el prompt 

``` text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-11 del frontend, no del frontend entero.

Implementa los AC de projects/NorteCreativo/frontend/docs/trazabilidad_NC/ISS-11.md en projects/NorteCreativo/frontend.
Sigue la guia del docente (secciones 11.1 a 11.7).

- requireAuth true en los dos environments.
- package.json: scripts start, build, watch, test y format:check (prettier --check "src/**/*.{ts,html,css}");
  instala prettier como devDependency si falta y formatea con prettier --write.
- angular.json: presupuesto initial 750kB/1MB y anyComponentStyle 4kB/8kB. Si el build se pasa, reduce con
  loadComponent e imports puntuales de PrimeNG; no subas el error.
- Revisa todas las pantallas sin cambiar funcionalidad: inject(), takeUntilDestroyed en load(), computed en vez de getters,
  sin any, label o aria-label en inputs, aria-label + pTooltip en botones de icono, estados legibles como texto.
- Crea docs/problemas.md con la tabla del ISS-11 y README.md del frontend (arranque backend 3012 + front 4200, usuarios
  del seeder, interruptores requireAuth / AUTH_ENABLED, comandos de calidad, publicacion de dist con fallback SPA).
- Deja npm run build y npm run format:check en verde.

No agregues funcionalidades nuevas. NO toques backend_Express, docs/proceso.md ni docs/trazabilidad_NC/.
NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos y los 15 puntos del checklist
con el usuario de cada paso); que quedo fuera de alcance.
```

Salida:
<!-- pegar captura del resumen que entrega claude code -->

2. comprobamos AC-1 (build): `npx ng build 2>&1 | tail -20`

<!-- pegar captura -->

3. comprobamos AC-2 (checklist de humo): los 15 puntos, una captura por punto con el usuario visible en el header

<!-- pegar captura -->

4. comprobamos AC-3 (cambio de fase): `requireAuth=false` + `AUTH_ENABLED=false` + storage limpio, y de vuelta a `true`

<!-- pegar captura -->

5. comprobamos AC-4 (refresh revocado): copiar `refreshToken` del storage + `curl -X POST localhost:3012/api/sesion/logout -H 'Content-Type: application/json' -d '{"refresh_token":"<token>"}'` + alterar el access y pulsar cualquier acción

<!-- pegar captura -->

6. comprobamos AC-5 (formato): `npm run format:check`

<!-- pegar captura -->

7. comprobamos AC-6 (fallback SPA): `npx serve -s dist/front-norte-creativo/browser` + F5 en `/entregables/<id>`

<!-- pegar captura -->

8. comprobamos AC-7 (documentación): `docs/problemas.md` y `README.md` del frontend

<!-- pegar captura -->


