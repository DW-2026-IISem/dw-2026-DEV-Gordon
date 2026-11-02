> **Workspace:** `frontend` (Norte Creativo) · **Pista:** Fase I — Fundamentos y Business (ISS-00 a ISS-07) · **Guía base:** `guia_front.docx` + https://tecnogua.com/academic/site/frontend2026/express/ · **Backend:** `backend_Express` (puerto 3012, `AUTH_ENABLED=false`)

# ISS-06 — Entregables y versiones

**Naturaleza:** práctico
**Issue GitHub:** `#NN`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-05 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/frontend2026/express/construir/ISS-06-ventas-y-detalle/ (guía Word §6; cabecera + líneas de §7.5)
**Commit esperado:** `feat(front-iss-06): entregables y versiones Refs #NN`

---

## 1. SDD

**OBJ:** Al finalizar, se podrán registrar los entregables de cada tarea y subir versiones para revisión, viendo en el detalle del entregable su historial de versiones, con el número de versión asignado por el backend y sin poder tocar una versión aprobada.

**SPEC (qué debe quedar):**
- En StoreLab este ISS es la venta con sus líneas. En Norte Creativo la relación cabecera + líneas es entregable + versiones; la operación transaccional (la aprobación) va en ISS-07.
- `npx ng g component` (`--skip-tests --defaults`): `features/entregables/entregable-list`, `entregable-form`, `entregable-detail`; `features/versiones/version-list`, `version-form`.
- **Entregables** (`/entregables`):
  - `forkJoin` de entregables y tareas (con `canPermission` + `of([])`).
  - Columnas: "Tarea" por nombre, `fecha_inicio`, `fecha_fin`, `total` en moneda COP con `toNumber`, y `estado` con `StatusTag` (EN_PROCESO, ENTREGADO).
  - Filtros por tarea y por estado.
  - `EntregableForm`:
    - `tarea_id`: `p-select` de tareas activas con la etiqueta "Hito · Tarea".
    - `fecha_inicio` y `fecha_fin` con `DatePicker`; un validador de grupo exige fin ≥ inicio.
    - `total` con `InputNumber` en modo moneda, mínimo 0; se convierte con `Number()` antes de enviar (guía §5.6).
    - `estado` (EN_PROCESO / ENTREGADO, por defecto EN_PROCESO) y `observaciones` opcional.
  - CRUD completo como en ISS-03, con `*appHasPermission` sobre `/api/entregables`.
  - Acción "Ver detalle" → `/entregables/:id`.
- **Detalle del entregable** (`/entregables/:id`), componente de ruta que lee `id` con `input()` y llama `EntregableApi.get`:
  - Cabecera con tarea, fechas, total y estado.
  - Tabla de sus versiones (`VersionEntregableApi.list()` filtrada por `entregable_id` y ordenada por `numero_version` descendente), con `StatusTag` (EN_REVISION, APROBADA, RECHAZADA).
  - `computed` `ultimaVersion` y `pendientes` (versiones EN_REVISION).
  - Botón "Nueva versión" (`*appHasPermission="'POST /api/version-entregables'"`), que abre `VersionForm` con el `entregable_id` fijo.
- **Versiones** (`/versiones`):
  - Listado global con columna "Entregable" ("Tarea · total", o "#<id> · total" si el rol no lee tareas), filtros por entregable y estado, y las mismas acciones.
  - `VersionForm`: `fecha_inicio`, `fecha_fin` (fin ≥ inicio), `total` (moneda, mínimo 0) y `observaciones`. No tiene `numero_version` ni `estado`.
  - Una versión APROBADA no muestra editar, desactivar ni eliminar. Si el backend responde 409 (RN-04), se muestra el mensaje.
  - Crear una versión para un entregable cuyo hito está CERRADO muestra el 409 de RN-06.
- **Rutas**: hijas `entregables`, `entregables/:id` y `versiones` del `Shell` con `loadComponent`.

**REQ (restricciones):**
- El front nunca envía `numero_version`, el `estado` de la versión ni `status`.
- Los totales se convierten con `toNumber` antes de mostrarse o sumarse.
- No se adelantan aprobaciones (ISS-07). Sin CSS propio.

**AC:**
- [ ] **AC-1** `/entregables` muestra la tarea por nombre, el total en formato moneda y el estado con color.
- [ ] **AC-2** El formulario no deja guardar sin tarea, con `fecha_fin` anterior a `fecha_inicio` ni con total negativo.
- [ ] **AC-3** En `/entregables/:id`, "Nueva versión" crea una versión con 201 y aparece en la tabla con el `numero_version` siguiente y en EN_REVISION, sin que el formulario los pidiera.
- [ ] **AC-4** Una versión APROBADA no ofrece editar, desactivar ni eliminar; si se fuerza un PATCH con `curl`, el backend responde 409 (RN-04).
- [ ] **AC-5** Crear una versión para un entregable de un hito CERRADO muestra el 409 de RN-06 y no se crea ninguna fila.
- [ ] **AC-6** Recargar `/entregables/:id` en el navegador carga el detalle, y `ng build` no da errores.

**Checklist interno (IA, En curso):**
- [ ] entregables: lista y formulario con validador de fechas
- [ ] detalle enrutado con versiones
- [ ] versiones: lista global y formulario sin número ni estado
- [ ] bloqueo de versiones APROBADAS
- [ ] 409 RN-04 / RN-06 visibles
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

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | listado | AC-1 | ver docs/proceso.md, sección ISS - 06 | `/entregables` |
|       | validaciones | AC-2 | ver docs/proceso.md, sección ISS - 06 | guardar sin tarea, con fecha fin anterior a la de inicio y con total negativo |
|       | nueva versión | AC-3 | ver docs/proceso.md, sección ISS - 06 | `/entregables/<id>` → "Nueva versión" + Network → Payload (sin `numero_version`) y respuesta (con `numero_version`) |
|       | RN-04 | AC-4 | ver docs/proceso.md, sección ISS - 06 | fila APROBADA sin acciones + `curl -i -X PATCH localhost:3012/api/version-entregables/<id> -H 'Content-Type: application/json' -d '{"observaciones":"x"}'` |
|       | RN-06 | AC-5 | ver docs/proceso.md, sección ISS - 06 | nueva versión sobre un entregable de un hito CERRADO + `curl -s localhost:3012/api/version-entregables \| jq '.versiones \| length'` antes y después |
|       | recarga y build | AC-6 | ver docs/proceso.md, sección ISS - 06 | F5 en `/entregables/<id>` + `npx ng build 2>&1 \| tail -15` |

**Commit (hash):** `feat(front-iss-06): entregables y versiones Refs #NN`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué el formulario de versión no pide `numero_version` ni `estado` y quién los pone?». «Si la UI ya oculta las acciones de una versión APROBADA, ¿por qué el backend sigue respondiendo 409?». «¿Qué gana el detalle al ser una ruta `/entregables/:id` y no un diálogo?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

el formulario no pide numero_version porque el backend lo calcula, toma la ultima version de ese entregable y le suma uno, si lo mandara el front dos personas subiendo version al mismo tiempo podrian mandar el mismo numero, y el indice unico lo rechazaria, o peor, se podria saltar o repetir un numero, y el estado tampoco porque toda version nace en en_revision y solo cambia a aprobada o rechazada cuando el cliente_aprobador registra su veredicto en aprobaciones, el front solo manda fechas, total y observaciones

el backend sigue respondiendo 409 porque ocultar el boton es comodidad, no proteccion, cualquiera puede abrir devtools o mandar un patch con curl directo a la api, la regla rn-04 dice que una version aprobada es inmutable, porque es lo que el cliente aprobo y sobre eso se cierra el hito, si se pudiera editar despues se perderia la trazabilidad de que fue lo que se aprobo, entonces la regla vive en el service del backend y el front solo la refleja para que el usuario no se encuentre con el error

al ser ruta el detalle tiene url propia, se puede recargar con f5, se puede compartir el enlace o abrirlo en otra pestaña, y el boton atras del navegador funciona, ademas el componente lee el id de la url y pide el entregable al backend, entonces no depende de que la lista ya este cargada, en un dialogo todo eso se pierde al recargar, y como el detalle tiene su propia tabla de versiones y su propio formulario se maneja mejor como pantalla aparte

---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
