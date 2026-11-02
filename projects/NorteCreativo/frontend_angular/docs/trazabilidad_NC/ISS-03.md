> **Workspace:** `frontend` (Norte Creativo) · **Pista:** Fase I — Fundamentos y Business (ISS-00 a ISS-07) · **Guía base:** `guia_front.docx` + https://tecnogua.com/academic/site/frontend2026/express/ · **Backend:** `backend_Express` (puerto 3012, `AUTH_ENABLED=false`)

# ISS-03 — CRUD de clientes con Signals

**Naturaleza:** práctico
**Issue GitHub:** `#NN`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-02 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/frontend2026/express/construir/ISS-03-crud-de-clientes/ (guía Word §3.1–3.7)
**Commit esperado:** `feat(front-iss-03): crud de clientes con signals Refs #NN`

---

## 1. SDD

**OBJ:** Al finalizar, se podrá listar, buscar, crear, editar, desactivar y eliminar clientes desde la interfaz, con el estado de la pantalla en signals. Es el patrón que repiten las demás pantallas.

**SPEC (qué debe quedar):**
- Modo práctica: `requireAuth: false` en el front y `AUTH_ENABLED=false` en el backend.
- `npx ng g component features/clientes/cliente-list --skip-tests --defaults` y `features/clientes/cliente-form`.
- **Filtro local (§3.2)**: `core/utils/filter-rows.ts`, una función pura `filterRows(rows, term, (row) => [campos])` que no distingue mayúsculas ni tildes. PrimeNG 22 quitó `globalFilter` de `p-table`, así que se filtra el arreglo y se entrega a `[value]`.
- **ClienteForm (§3.3)**, sin llamadas a la API: `input()` `cliente`, `resetKey`, `saving`; `output()` `saved` y `cancelled`.
  - Usa `NonNullableFormBuilder`. `tipo_documento` es requerido (`p-select` con CC, NIT, CE, TI, PASAPORTE). `numero_documento` y `nombre` son requeridos (`nombre` con máximo 120). `telefono` es opcional y `email` es requerido con formato válido.
  - `effect()` rellena el formulario al editar y `resetKey` lo vacía al reabrirlo. `status` no se edita.
  - Los errores aparecen con `p-message` después de tocar el campo, y el botón de guardar muestra la carga.
- **ClienteList (§3.4–3.5)**:
  - Signals `rows`, `loading`, `saving`, `error`, `filter`, `dialogVisible`, `editing` y `resetKey`.
  - `computed`: `visibleRows` (filtra por `nombre`, `numero_documento`, `email` y `telefono`) y `title` ("Nuevo cliente" / "Editar cliente").
  - Tabla `p-table` paginada y ordenable, con buscador, `StatusTag`, acciones por fila con `aria-label` y `p-dialog` (`w-full max-w-2xl mx-4`).
  - Botones de escritura envueltos con `*appHasPermission`: `'POST /api/clientes'`, `'PATCH /api/clientes/:id'`, `'PATCH /api/clientes/:id/deactivate'` y `'DELETE /api/clientes/:id'`. En la Fase I se muestran todos.
- **Acciones**: crear con `POST`, editar con `PATCH /api/clientes/:id` sin `status`, y las dos bajas con `ConfirmDialog`:
  - Baja lógica (§3.6): `PATCH /:id/deactivate`. Como el backend solo lista los activos, el cliente sale de la tabla.
  - Baja física: `DELETE /:id`. Es irreversible y el mensaje de confirmación lo dice.
- **Estados**:
  - Al cargar: spinner de la tabla.
  - Si falla la carga: `p-message` persistente.
  - Si falla una operación: `p-message` en el diálogo y toast; el diálogo sigue abierto.
  - Sin datos o sin coincidencias en el filtro: `EmptyState`, con un mensaje distinto para cada caso.
  - Al guardar: toast de éxito.
- **Errores del backend** con `toApiMessage`: `numero_documento` repetido → 409; campos vacíos o email inválido → 400 con la lista `errors`.
- **Ruta (§3.7)**: hija `clientes` del `Shell` con `loadComponent`.

**REQ (restricciones):**
- Los guards por permiso son de ISS-09; aquí la directiva ya está puesta, pero deja pasar todo.
- Sin CSS propio; se sigue el patrón visual del docente (PrimeNG Aura + Tailwind).

**AC:**
- [ ] **AC-1** `GET /api/clientes` pinta la tabla con los clientes activos del seeder, paginada.
- [ ] **AC-2** "Nuevo cliente" abre el diálogo, valida (email inválido o campos vacíos bloquean el envío) y crea con `POST`; la fila aparece sin recargar.
- [ ] **AC-3** Editar abre el mismo formulario con los datos cargados y hace `PATCH /api/clientes/:id` con 200 y sin `status` en el body.
- [ ] **AC-4** El buscador filtra sin recargar y sin peticiones nuevas en Network.
- [ ] **AC-5** Después de la baja lógica el cliente desaparece de la tabla; después de la física, también, y `GET /api/clientes/:id` responde 404.
- [ ] **AC-6** Un `numero_documento` repetido muestra el 409 en `p-message` y en un toast, y el diálogo sigue abierto.
- [ ] **AC-7** `ng serve` y `ng build` no muestran errores.

**Checklist interno (IA, En curso):**
- [ ] `filter-rows`
- [ ] `ClienteForm` con validaciones
- [ ] `ClienteList` con signals y computed
- [ ] acciones con `*appHasPermission` y ConfirmDialog
- [ ] estados de carga, vacío y error
- [ ] ruta

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

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | listado + Network | AC-1 | ver docs/proceso.md, sección ISS - 03 | backend con `AUTH_ENABLED=false` + `npm start` + `/clientes` con Network abierta |
|       | alta y validación | AC-2 | ver docs/proceso.md, sección ISS - 03 | "Nuevo cliente" con email sin `@` y luego con datos válidos + `curl -s localhost:3012/api/clientes \| head -c 400` |
|       | PATCH | AC-3 | ver docs/proceso.md, sección ISS - 03 | editar un cliente + Network → la petición PATCH → Payload y respuesta |
|       | filtro | AC-4 | ver docs/proceso.md, sección ISS - 03 | escribir en el buscador y comprobar que Network no registra peticiones nuevas |
|       | bajas | AC-5 | ver docs/proceso.md, sección ISS - 03 | desactivar un cliente y eliminar otro creado para la prueba + `curl -i localhost:3012/api/clientes/<id>` |
|       | 409 | AC-6 | ver docs/proceso.md, sección ISS - 03 | crear un cliente con un `numero_documento` del seeder |
|       | build | AC-7 | ver docs/proceso.md, sección ISS - 03 | `npx ng build 2>&1 \| tail -15` + consola del navegador |

**Commit (hash):** `feat(front-iss-03): crud de clientes con signals Refs #NN`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué `visibleRows` es un `computed` y no un método `applyFilter()`?». «¿Por qué `ClienteForm` no llama a la API y quién decide qué hacer con `saved`?». «¿Qué diferencia hay entre la baja lógica y la física, y cuál usarías en el día a día?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

visibleRows es un computed porque depende de dos signals, rows y filter, y angular lo recalcula solo cada vez que cambia cualquiera de los dos, si fuera un metodo applyFilter() tendria que acordarme de llamarlo cuando escribo en el buscador, cuando llega la lista del backend y cuando borro o creo un cliente, y si se me olvida en un lugar la tabla queda mostrando datos viejos, con computed eso no puede pasar, ademas el filtro es local, no hace peticiones, solo trabaja sobre lo que ya llego

clienteform no llama a la api porque es un componente de presentacion, solo sabe pintar el formulario, validar y avisar con saved que hay un payload listo o con cancelled que se cerro, el que decide que hacer es clientelist, que sabe si esta creando o editando, llama a post o a patch, maneja el saving, muestra el toast y recarga la tabla, asi el mismo formulario sirve para crear y para editar, y si cambia la forma de guardar solo se toca la lista

la baja logica es el patch /:id/deactivate, el cliente sigue en la base con status inactive, desaparece del listado porque el backend solo lista los activos, pero no se pierde su historia, sus campañas siguen apuntando a el, la baja fisica es el delete, borra la fila para siempre y no se puede deshacer, en el dia a dia usaria la logica, porque un cliente de una agencia tiene campañas, hitos y entregables colgando, y borrarlo fisicamente o falla por las llaves foraneas o deja sin rastro trabajo que ya se hizo, la fisica la dejo para registros creados por error

---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
