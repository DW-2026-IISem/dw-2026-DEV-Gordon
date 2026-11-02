> **Workspace:** `frontend` (Norte Creativo) · **Pista:** Fase I — Fundamentos y Business (ISS-00 a ISS-07) · **Guía base:** `guia_front.docx` + https://tecnogua.com/academic/site/frontend2026/express/ · **Backend:** `backend_Express` (puerto 3012, `AUTH_ENABLED=false`)

# ISS-04 — CRUD de campañas y relación con cliente

**Naturaleza:** práctico
**Issue GitHub:** `#NN`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-03 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/frontend2026/express/construir/ISS-04-crud-de-tipos-de-producto/ (guía Word §4; carga en paralelo de §5.4)
**Commit esperado:** `feat(front-iss-04): crud de campanias con cliente Refs #NN`

---

## 1. SDD

**OBJ:** Al finalizar, se podrán gestionar las campañas de cada cliente desde la interfaz, viendo el nombre del cliente en lugar de su id y sin poder abrir campañas para clientes inactivos.

**SPEC (qué debe quedar):**
- En el backend, Campania ocupa el lugar de ProductType (ver `backend_Express/docs/trazabilidad_NC/README.md`). En el frontend se replica el patrón de ISS-03 y se agrega la relación con cliente.
- `npx ng g component features/campanias/campania-list --skip-tests --defaults` y `features/campanias/campania-form`.
- **CampaniaList**: mismo patrón de `ClienteList` (signals, `computed`, `filterRows`, `p-dialog`, `ConfirmDialog`, estados de carga, vacío y error).
  - `forkJoin` carga campañas y clientes en paralelo. La petición de clientes solo se hace si `session.canPermission('GET /api/clientes')`; si no, se usa `of([])` (CREATIVO y CLIENTE_APROBADOR no leen clientes en la Fase II).
  - `computed` `clientesPorId`: un `Map` id → nombre que se arma una sola vez y da la columna "Cliente".
  - El buscador filtra por nombre de campaña, descripción y nombre del cliente. Hay además un filtro por cliente (`p-select` con "Todos"), y los dos se combinan en `visibleRows`.
  - Las acciones van con `*appHasPermission` (`POST`, `PATCH /:id`, `PATCH /:id/deactivate` y `DELETE /:id` de `/api/campanias`).
- **CampaniaForm**, sin API: `input()` `campania`, `clientes`, `resetKey` y `saving`; `output()` `saved` y `cancelled`.
  - `cliente_id` con `p-select` (`optionValue="id"`, `optionLabel="nombre"`, con filtro), solo de clientes activos, requerido.
  - `nombre` requerido con máximo 120 y `descripcion` opcional con `Textarea`. `status` no se edita.
- **Acciones**: `POST`, `PATCH /:id` sin `status`, y baja lógica y física con confirmación.
- **Errores visibles**: cliente inactivo → 409 ("No se crea campaña para un cliente inactivo"); cliente inexistente → 404.
- **Ruta**: hija `campanias` del `Shell` con `loadComponent`.

**REQ (restricciones):**
- Modo práctica (`requireAuth=false` y `AUTH_ENABLED=false`).
- Sin CSS propio. No se adelantan hitos ni tareas (ISS-05).

**AC:**
- [ ] **AC-1** La tabla lista las campañas activas con el nombre del cliente (no el id), y Network muestra `GET /api/campanias` y `GET /api/clientes` en paralelo.
- [ ] **AC-2** Crear y editar validan cliente obligatorio y nombre obligatorio con máximo 120; el select solo ofrece clientes activos.
- [ ] **AC-3** Crear una campaña para un cliente que se desactivó en otra pestaña muestra el 409 y el diálogo sigue abierto.
- [ ] **AC-4** Editar hace `PATCH` sin `status` y conserva el cliente elegido (`cliente_id` numérico); la baja lógica oculta la campaña del listado.
- [ ] **AC-5** El buscador y el filtro por cliente funcionan juntos sin peticiones nuevas.
- [ ] **AC-6** `/campanias` abre por URL directa (no solo por el menú) y `ng build` termina sin errores.

**Checklist interno (IA, En curso):**
- [ ] `CampaniaForm` con select de clientes activos
- [ ] `CampaniaList` con `forkJoin` y `Map`
- [ ] filtro por cliente
- [ ] acciones con `*appHasPermission`, 409 / 404
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

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | listado + Network | AC-1 | ver docs/proceso.md, sección ISS - 04 | `/campanias` con Network abierta + `curl -s localhost:3012/api/campanias \| head -c 300` |
|       | validación y select | AC-2 | ver docs/proceso.md, sección ISS - 04 | "Nueva campaña" sin cliente ni nombre; desplegar el select de clientes |
|       | 409 | AC-3 | ver docs/proceso.md, sección ISS - 04 | desactivar un cliente en `/clientes` (otra pestaña) y, sin recargar, crearle una campaña |
|       | PATCH y baja | AC-4 | ver docs/proceso.md, sección ISS - 04 | editar + Network → Payload; desactivar una campaña |
|       | filtros | AC-5 | ver docs/proceso.md, sección ISS - 04 | combinar el filtro por cliente y el buscador con Network abierta |
|       | URL directa y build | AC-6 | ver docs/proceso.md, sección ISS - 04 | escribir `localhost:4200/campanias` + `npx ng build 2>&1 \| tail -15` |

**Commit (hash):** `feat(front-iss-04): crud de campanias con cliente Refs #NN`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué el nombre del cliente sale de un `Map` en un `computed` y no de un `find` por fila?». «¿Por qué se cargan campañas y clientes con `forkJoin` y por qué clientes solo si hay permiso?». «Si el select ya filtra clientes activos, ¿por qué el backend vuelve a validar y responde 409?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

el nombre del cliente sale de un map en un computed porque el map se arma una sola vez cuando llegan los clientes, y despues cada fila busca su cliente por id directo, si usara un find por fila la tabla recorreria toda la lista de clientes por cada campaña, y eso se repite cada vez que angular repinta, con pocos datos no se nota pero con muchas campañas si, ademas al ser computed el map se rehace solo si cambia la lista de clientes, no en cada repintado

se cargan con forkjoin porque las dos peticiones no dependen una de la otra, salen al mismo tiempo y la tabla se pinta cuando llegan las dos, asi no aparece primero la campaña con el id y despues el nombre, y clientes solo se pide si hay permiso porque en la fase ii roles como creativo o cliente_aprobador pueden ver campañas pero no tienen get /api/clientes, si se pidiera igual el backend responderia 403 y forkjoin fallaria entero, dejando la pantalla vacia por un dato que solo era decorativo, con of([]) la tabla sale igual, solo sin el nombre del cliente

el backend vuelve a validar porque el front no es la seguridad, el select muestra los clientes activos en el momento en que se cargo la pantalla, pero alguien pudo desactivar ese cliente en otra pestaña o en otro computador antes de que yo guarde, o alguien puede mandar la peticion con curl saltandose la ui, la regla de que un cliente inactivo no admite campañas vive en el service del backend y es la que decide, el front solo ayuda a no equivocarse

---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
