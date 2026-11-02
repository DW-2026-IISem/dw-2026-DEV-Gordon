> **Workspace:** `frontend` (Norte Creativo) · **Pista:** Fase I — Fundamentos y Business (ISS-00 a ISS-07) · **Guía base:** `guia_front.docx` + https://tecnogua.com/academic/site/frontend2026/express/ · **Backend:** `backend_Express` (puerto 3012, `AUTH_ENABLED=false`)

# ISS-07 — Aprobaciones (CerrarHito), dashboard y cierre de Fase I

**Naturaleza:** práctico
**Issue GitHub:** `#NN`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-06 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/frontend2026/express/construir/ISS-07-detalle-de-ventas-y-dashboard/ (guía Word §6.3 formulario transaccional con signals, §7.6–7.8 dashboard y cierre)
**Commit esperado:** `feat(front-iss-07): aprobaciones dashboard y cierre fase I Refs #NN`

---

## 1. SDD

**OBJ:** Al finalizar, el frontend tendrá la pantalla para registrar el veredicto sobre una versión (la operación que cierra el hito en una sola transacción), el historial de aprobaciones y un dashboard coherente con los listados, y la Fase I quedará cerrada con todas las pantallas de negocio funcionando.

**SPEC (qué debe quedar):**
- `npx ng g component` (`--skip-tests --defaults`): `features/aprobaciones/aprobacion-list` y `aprobacion-form`. El dashboard provisional de ISS-02 se completa.
- **Historial** (`/aprobaciones`):
  - `forkJoin` de aprobaciones y versiones.
  - Columnas: versión ("Entregable · v<numero_version>"), `estado` con `StatusTag`, `comentario` y `fecha`.
  - Sin editar ni eliminar: el backend solo tiene GET y POST, porque las aprobaciones son registro de auditoría.
- **Registrar veredicto** (`/aprobaciones/nueva`, como `/ventas/nueva` de la guía), formulario con signals en tres bloques:
  1. Versión: `p-select` solo de versiones EN_REVISION, con la etiqueta "Entregable #<id> · v<numero_version> · <total>". CLIENTE_APROBADOR no lee tareas, así que la etiqueta no depende de ellas.
  2. Veredicto: APROBADA o RECHAZADA con `p-selectbutton`, y `comentario`. La UI exige comentario si es RECHAZADA; el backend no lo exige.
  3. Resumen: lo que se va a enviar.
  - Un solo `POST /api/aprobaciones` con `{ version_entregable_id, estado, comentario }`. No envía `aprobador_id`: el backend lo toma del usuario autenticado (RN-05) y responde 400 si viene en el body.
  - Respuesta `{ aprobacion, hito_cerrado, hito_id, fecha_cierre }`. Si `hito_cerrado` es `true`, toast "Hito cerrado" con la fecha; si no, toast del veredicto. Después navega a `/aprobaciones`.
  - Errores: hito ya CERRADO → 409; versión inexistente → 404; sin sesión → 401. Ante cualquier error no queda nada a medias, porque el backend hace todo en una transacción.
  - Acción "Revisar" en las filas EN_REVISION de `/versiones` y del detalle del entregable, que lleva a `/aprobaciones/nueva?version=<id>` con la versión ya elegida.
  - Botón "Registrar veredicto" y acción "Revisar" envueltos con `*appHasPermission="'POST /api/aprobaciones'"`.
- **Modo práctica y RN-05**: `POST /api/aprobaciones` exige JWT incluso con `AUTH_ENABLED=false` (ISS-00).
  - En esta fase, enviar el formulario muestra el 401 explicando que registrar un veredicto requiere sesión de CLIENTE_APROBADOR, que llega en ISS-08.
  - La transacción se demuestra con `curl` y el token de `aprobador`.
- **Dashboard (§7.6–7.7)**:
  - `forkJoin` de clientes, campañas, hitos, versiones y aprobaciones. Cada petición se hace solo si `canPermission('GET /api/...')`; si no, `of([])`.
  - KPIs en `p-card` con `Skeleton` mientras carga: clientes activos, campañas activas, hitos ABIERTOS (`abiertosCount` de ISS-05), hitos CERRADOS y versiones EN_REVISION.
  - `computed`: `pendientes` (las versiones EN_REVISION más antiguas, máximo 5), `ultimasAprobaciones` (por `fecha`, máximo 5) y `hitosPorEstado`.
  - Tablas "Pendientes de revisión" y "Últimas aprobaciones". Los totales se calculan con `toNumber`.
- **Rutas**: `aprobaciones`, `aprobaciones/nueva` y `dashboard` (hija por defecto). "Aprobaciones" y "Panel" quedan en el menú.

**REQ (restricciones):**
- El front nunca envía `aprobador_id` ni cambia por su cuenta el estado del hito o de la versión.
- Sin interceptor, guard, `AuthService` ni cabecera `Authorization` (Fase II).
- Sin CSS propio. Facturación queda fuera.

**AC:**
- [ ] **AC-1** `/aprobaciones` lista el historial con la versión resuelta por nombre y sin acciones de editar ni eliminar.
- [ ] **AC-2** El select solo ofrece versiones EN_REVISION, RECHAZADA sin comentario no deja enviar, y el body no lleva `aprobador_id` (Network → Payload).
- [ ] **AC-3** En modo práctica, enviar el formulario muestra el mensaje del 401 de RN-05 y no se crea ninguna fila.
- [ ] **AC-4** Con `curl` y el token de `aprobador`, aprobar la única versión EN_REVISION de un hito con un solo entregable responde 201 con `hito_cerrado: true`; al recargar, `/hitos` muestra el hito CERRADO y `/aprobaciones` la fila nueva.
- [ ] **AC-5** Con `curl`, otra aprobación sobre una versión de ese hito responde 409 y nada cambia en la UI.
- [ ] **AC-6** El dashboard carga sin errores, los KPIs coinciden con los listados y se recalculan al volver después de crear o desactivar registros.
- [ ] **AC-7** Cierre de la Fase I: los endpoints de negocio responden 200 sin token, el recorrido visual pasa sin errores en consola y `ng build` termina sin errores.

**Checklist interno (IA, En curso):**
- [ ] historial de aprobaciones
- [ ] formulario de veredicto en tres bloques, sin `aprobador_id`
- [ ] manejo de `hito_cerrado` y de 401 / 404 / 409
- [ ] acción "Revisar" desde versiones y detalle
- [ ] dashboard con peticiones condicionadas y `computed`
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

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | historial | AC-1 | ver docs/proceso.md, sección ISS - 07 | `/aprobaciones` |
|       | payload | AC-2 | ver docs/proceso.md, sección ISS - 07 | abrir `/aprobaciones/nueva`, elegir RECHAZADA sin comentario; luego enviar una válida y revisar Network → Payload |
|       | 401 RN-05 | AC-3 | ver docs/proceso.md, sección ISS - 07 | enviar el formulario con el backend en `AUTH_ENABLED=false` |
|       | cierre de hito | AC-4 | ver docs/proceso.md, sección ISS - 07 | `TOKEN=$(curl -s -X POST localhost:3012/api/sesion/login -H 'Content-Type: application/json' -d '{"identifier":"aprobador","password":"Aprobador123!"}' \| jq -r .access_token)` + `curl -i -X POST localhost:3012/api/aprobaciones -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"version_entregable_id":<id>,"estado":"APROBADA"}'` + recargar `/hitos` y `/aprobaciones` |
|       | 409 hito cerrado | AC-5 | ver docs/proceso.md, sección ISS - 07 | repetir el POST sobre otra versión del hito ya CERRADO |
|       | dashboard | AC-6 | ver docs/proceso.md, sección ISS - 07 | comparar KPIs con los listados; crear o desactivar un registro y volver |
|       | cierre Fase I | AC-7 | ver docs/proceso.md, sección ISS - 07 | `for p in clientes campanias hitos tareas entregables version-entregables aprobaciones; do echo "== $p"; curl -s -o /dev/null -w "%{http_code}\n" localhost:3012/api/$p; done` + recorrido por `/dashboard`, `/clientes`, `/campanias`, `/hitos`, `/tareas`, `/entregables`, `/entregables/<id>`, `/versiones`, `/aprobaciones` + `npx ng build 2>&1 \| tail -20` |

**Commit (hash):** `feat(front-iss-07): aprobaciones dashboard y cierre fase I Refs #NN`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué el formulario no envía `aprobador_id` y de dónde lo saca el backend?». «¿Por qué registrar un veredicto es una sola petición y qué garantiza que el hito no quede a medias si algo falla?». «¿Por qué el dashboard pide cada listado solo si hay permiso, si en esta fase todo está permitido?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

el formulario no envia aprobador_id porque eso seria dejar que el cliente diga quien es, cualquiera podria mandar el id de otro usuario y aprobar a su nombre, por la rn-05 el aprobador sale del token, el middleware authenticate valida el jwt y deja el usuario en la peticion, y el service de aprobaciones usa ese id, si llega aprobador_id en el body responde 400, por eso esta ruta pide token aunque el modo practica este activo, sin token no hay a quien atribuir la aprobacion

es una sola peticion porque registrar el veredicto no es solo guardar una fila, el backend crea la aprobacion, cambia el estado de la version y revisa si todos los entregables del hito tienen su ultima version aprobada, y si es asi cierra el hito con su fecha de cierre, todo eso pasa dentro de una transaccion con el hito bloqueado, si algo falla en cualquier paso se hace rollback y no queda ni la aprobacion ni el cambio de estado, si el front hiciera tres peticiones separadas una podria fallar a la mitad y dejar una version aprobada con el hito abierto

el dashboard pide cada listado solo si hay permiso porque esta pantalla tambien la va a ver gente con otros roles en la fase ii, creativo no tiene get /api/clientes y finanzas no tiene versiones ni aprobaciones, si se pidieran igual el backend responderia 403 y el forkjoin fallaria completo, dejando el panel vacio, en la fase i canPermission responde que si a todo y el codigo funciona igual, entonces queda listo desde ya y en la fase ii no hay que tocarlo

---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
