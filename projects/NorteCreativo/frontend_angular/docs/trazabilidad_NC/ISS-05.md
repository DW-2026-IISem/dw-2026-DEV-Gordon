> **Workspace:** `frontend` (Norte Creativo) · **Pista:** Fase I — Fundamentos y Business (ISS-00 a ISS-07) · **Guía base:** `guia_front.docx` + https://tecnogua.com/academic/site/frontend2026/express/ · **Backend:** `backend_Express` (puerto 3012, `AUTH_ENABLED=false`)

# ISS-05 — Hitos y tareas (campaña → hito → tarea)

**Naturaleza:** práctico
**Issue GitHub:** `#NN`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-04 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/frontend2026/express/construir/ISS-05-crud-de-productos/ (guía Word §5.1–5.8)
**Commit esperado:** `feat(front-iss-05): hitos y tareas Refs #NN`

---

## 1. SDD

**OBJ:** Al finalizar, se podrá planear cada campaña en hitos y cada hito en tareas desde la interfaz, viendo el estado del hito (ABIERTO, CERRADO, FACTURADO) sin poder cambiarlo a mano.

**SPEC (qué debe quedar):**
- Hito ocupa el lugar de Product en el backend (relación + estado); Tarea repite el patrón un nivel más abajo.
- `npx ng g component features/hitos/hito-list|hito-form` y `features/tareas/tarea-list|tarea-form` (`--skip-tests --defaults`).
- **Reglas del backend (§5.1)**:
  - El hito nace ABIERTO y solo lo cierra una aprobación (RN-02).
  - Si el body trae `estado`, el backend responde 400.
  - Si la campaña está inactiva, responde 409 (RN-08); si no existe, 404.
- **Hitos (§5.4–5.7)**:
  - Carga hitos y campañas con `forkJoin`. Las campañas solo se piden con `canPermission('GET /api/campanias')`; si no, `of([])`.
  - `computed` `campaniasPorId` da la columna "Campaña".
  - Columna `estado` con `StatusTag` (ABIERTO verde, CERRADO gris, FACTURADO azul) y `fecha_cierre` formateada cuando exista.
  - `computed` `abiertosCount` se muestra arriba de la tabla y se reutiliza en el dashboard (ISS-07), igual que el `lowStockCount` de la guía.
  - Filtros por campaña y por estado, combinados con el buscador.
  - `HitoForm`:
    - `campania_id`: `p-select` de campañas activas, requerido.
    - `nombre`: requerido, máximo 120.
    - `descripcion`: opcional.
    - No tiene campo `estado` ni `fecha_cierre`.
- **Tareas**:
  - Carga tareas e hitos con `forkJoin`; `computed` `hitosPorId` da la columna "Hito". Filtro por hito.
  - `TareaForm`:
    - `hito_id`: `p-select` de hitos activos, con la etiqueta "Campaña · Hito", requerido.
    - `nombre`: requerido.
    - `descripcion`: opcional.
- **Acciones en los dos**:
  - `POST`, `PATCH /:id` sin `status`, y bajas lógica y física con `ConfirmDialog`.
  - Botones envueltos con `*appHasPermission` sobre `/api/hitos` y `/api/tareas`.
- **Navegación entre niveles**:
  - En la fila de campaña, "Ver hitos" → `/hitos?campania=<id>`.
  - En la fila de hito, "Ver tareas" → `/tareas?hito=<id>`.
  - El filtro se inicializa desde el query param con `input()` (por `withComponentInputBinding`).
- **Rutas**: hijas `hitos` y `tareas` del `Shell` con `loadComponent`.

**REQ (restricciones):**
- El backend no filtra listados por padre: el filtrado es local con `visibleRows`.
- El front nunca envía `estado` ni `fecha_cierre` de un hito.
- Sin CSS propio. No se adelantan entregables (ISS-06).

**AC:**
- [ ] **AC-1** `/hitos` muestra la campaña por nombre y el estado con su color; `/tareas` muestra el hito por nombre.
- [ ] **AC-2** El formulario solo ofrece campañas activas y no tiene campo de estado; crear un hito responde 201 y aparece en ABIERTO.
- [ ] **AC-3** Crear un hito para una campaña inactiva falla con el 409 de RN-08 y el error se muestra al usuario.
- [ ] **AC-4** Editar conserva la campaña elegida (`campania_id` numérico) y el formulario bloquea el envío sin campaña.
- [ ] **AC-5** `abiertosCount()` coincide con las filas ABIERTO de la tabla.
- [ ] **AC-6** "Ver hitos" abre `/hitos?campania=<id>` ya filtrado y "Ver tareas" abre `/tareas?hito=<id>` ya filtrado.
- [ ] **AC-7** El CRUD de tareas funciona con confirmación y toast, y `ng build` no da errores ni avisos de presupuesto.

**Checklist interno (IA, En curso):**
- [ ] hitos: lista, formulario sin estado, filtros, `abiertosCount`
- [ ] tareas: lista, formulario, filtro
- [ ] navegación con query params
- [ ] 409 / 404 visibles
- [ ] rutas

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

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | listados | AC-1 | ver docs/proceso.md, sección ISS - 05 | `/hitos` y `/tareas` + `curl -s localhost:3012/api/hitos \| head -c 400` |
|       | alta de hito | AC-2 | ver docs/proceso.md, sección ISS - 05 | "Nuevo hito" + Network → respuesta con `estado: ABIERTO` |
|       | 409 RN-08 | AC-3 | ver docs/proceso.md, sección ISS - 05 | desactivar una campaña en otra pestaña y, sin recargar, crearle un hito |
|       | edición y validación | AC-4 | ver docs/proceso.md, sección ISS - 05 | editar un hito + Payload; intentar guardar sin campaña |
|       | conteo | AC-5 | ver docs/proceso.md, sección ISS - 05 | comparar `abiertosCount` con el filtro de estado ABIERTO |
|       | navegación | AC-6 | ver docs/proceso.md, sección ISS - 05 | "Ver hitos" desde `/campanias` y "Ver tareas" desde `/hitos`, mostrando la URL |
|       | tareas y build | AC-7 | ver docs/proceso.md, sección ISS - 05 | crear, editar, desactivar y eliminar una tarea + `npx ng build 2>&1 \| tail -15` |

**Commit (hash):** `feat(front-iss-05): hitos y tareas Refs #NN`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué el formulario del hito no tiene campo de estado y quién lo cambia?». «¿Cómo llega el id de la campaña desde la URL hasta el filtro de la lista?». «Si el backend no filtra por padre, ¿cuándo dejaría de ser buena idea filtrar en el navegador?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

el formulario del hito no tiene estado porque el estado no lo decide el usuario, el hito nace abierto y pasa a cerrado solo cuando se aprueban sus entregables, eso lo hace el backend dentro de la transaccion de aprobaciones, rn-02, y facturado llega con la facturacion, si dejara un select de estado alguien podria cerrar un hito sin aprobaciones o reabrir uno cerrado, por eso el backend responde 400 si llega estado en el body, y el front ni siquiera lo manda, el estado del hito es una consecuencia del negocio, no un dato que se edita

el id llega por la url como query param, ?campania=5, en app.config esta withComponentInputBinding, eso hace que el router pase los query params como inputs del componente de la ruta, entonces hitolist tiene un input campania, y con ese valor se inicializa el signal del filtro por campaña, como visibleRows es computed y lee ese signal la tabla sale ya filtrada, y si despues cambio el filtro a mano funciona igual porque es el mismo signal

filtrar en el navegador funciona mientras la lista completa sea pequeña, porque igual hay que descargarla toda, si la agencia tuviera miles de hitos cada pantalla bajaria todo para mostrar diez, y ahi conviene que el backend reciba ?campania_id= y pagine, ademas cuando entre ownership, que un usuario solo vea lo suyo, ese filtro tiene que hacerlo el backend si o si, porque lo que llega al navegador ya lo puede ver cualquiera con devtools

---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
