> **Workspace:** `frontend` (Norte Creativo) · **Pista:** Fase II — Auth con RBAC (ISS-08 a ISS-11) · **Guía base:** `guia_front.docx` + https://tecnogua.com/academic/site/frontend2026/express/ · **Backend:** `backend_Express` (puerto 3012, `AUTH_ENABLED=true`)

# ISS-10 — Administración RBAC: usuarios, roles, recursos y pivotes

**Naturaleza:** práctico
**Issue GitHub:** `#NN`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-09 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/frontend2026/express/construir/ISS-10-administracion-rbac/ (guía Word §10.1–10.9)
**Commit esperado:** `feat(front-iss-10): administracion rbac Refs #NN`

---

## 1. SDD

**OBJ:** Al finalizar, ADMIN podrá gestionar usuarios, roles y recursos, asignar roles a usuarios, conceder recursos a roles y ver los permisos efectivos de cualquier usuario desde la interfaz, sin reiniciar el backend para que los cambios surtan efecto.

**SPEC (qué debe quedar):**
- **Regla de oro (§10.1)**: un usuario puede hacer `MÉTODO /ruta` solo si la cadena `role_users` → `roles` → `resource_roles` → `resources` está activa en todos sus eslabones. Si falta uno, la respuesta es 403.
- **Ajuste mínimo del backend para "Ver permisos"**: la guía lo pide (criterio 2) y Norte Creativo no tiene ese endpoint.
  - Se agrega `GET /api/usuarios/:id/permisos` (JWT + RBAC), que reutiliza `findEffectiveForUser` de `resource-roles.repository.ts` y responde `{ total, permisos }` con la misma forma que `/api/permisos`.
  - Se registra en `resource-catalog.ts`: el catálogo pasa de 86 a 87, ADMIN de 85 a 86 permisos tras `npm run db:seed`, y `check-resource-catalog.ts` debe quedar en OK.
- **Generar con CLI (§10.2)** en `features/admin/` (`--skip-tests --defaults`): `usuarios/usuario-list|usuario-form`, `roles/rol-list|rol-form`, `recursos/recurso-list|recurso-form`, `asignaciones/asignacion-list` y `concesiones/concesion-list`. Los servicios ya existen desde ISS-02.
- **Usuarios (§10.3)**:
  - Crear con `username`, `email`, `password` (`p-password` con `toggleMask`) y `status`. Editar solo `username` y `email` (`PATCH`; el backend no acepta más campos). La contraseña y el estado solo se envían al crear.
  - Desactivar y eliminar con confirmación. Para el propio usuario (`isSelf`) esas dos acciones quedan deshabilitadas.
  - El 409 de username o email repetido se muestra en pantalla.
  - "Ver permisos" abre un diálogo con `GET /api/usuarios/:id/permisos`: método, ruta y roles que lo conceden.
- **Roles (§10.4)**: `name` y `description`; el backend guarda el nombre en MAYÚSCULAS. CRUD con baja lógica y 409 si el nombre se repite.
- **Recursos (§10.5)**: `method` (`p-select` GET, POST, PUT, PATCH, DELETE), `path` (validador en el form: empieza por `/api/`) y `description`. CRUD; 409 si `(method, path)` se repite; buscador por método y ruta.
- **Asignaciones usuario ↔ rol (§10.6)**:
  - Tabla con usuario y rol por nombre (`forkJoin` + `Map`) y `StatusTag`; filtro por usuario.
  - Crear con dos selects. Sin DELETE: se retira con `PATCH /:id/deactivate` y se reactiva con `PATCH /:id/reactivate`. Duplicar el vínculo no está permitido.
- **Concesiones rol ↔ recurso (§10.7)**:
  - Tabla con rol y "MÉTODO ruta"; filtro por rol.
  - Crear con un select de rol y un select filtrable de recurso que muestra "MÉTODO ruta". Se retira y reactiva igual que las asignaciones.
- **Rutas (§10.8)**, cada una con `permissionGuard`:

| Ruta | Permiso |
|---|---|
| `/admin/usuarios` | `GET /api/usuarios` |
| `/admin/roles` | `GET /api/roles` |
| `/admin/recursos` | `GET /api/recursos` |
| `/admin/asignaciones` | `GET /api/asignaciones-rol` |
| `/admin/permisos` | `GET /api/concesiones-rol` |

  Grupo "Seguridad" en `NAV` con esas 5 entradas. Las acciones van envueltas con `*appHasPermission`.
- **Flujo recomendado (§10.9)**, documentado en el README:
  1. Confirmar el recurso.
  2. Conceder al rol.
  3. "Ver permisos" del usuario.
  4. Entrar como ese usuario y pulsar "Actualizar permisos".
  - Crear un recurso no crea una pantalla: solo habilita una ruta que ya existe en `NAV`.

**REQ (restricciones):**
- Los pivotes no tienen DELETE físico.
- Cambio de contraseña fuera de alcance: el backend de Norte Creativo no tiene ese endpoint.
- Sesiones propias (`/api/sesiones`) fuera de alcance; la guía las marca como opcionales.
- Mismo patrón visual y de estados de las pantallas de la Fase I.

**AC:**
- [ ] **AC-1** `admin` lista, crea y edita usuarios; la contraseña y el estado solo se envían al crear (Network → Payload) y la respuesta nunca trae `password`. El propio `admin` no puede desactivarse ni eliminarse desde la UI.
- [ ] **AC-2** "Ver permisos" de `finanzas` muestra sus 11 permisos con método, ruta y rol; `GET /api/usuarios/:id/permisos` aparece en el catálogo y `check-resource-catalog.ts` da OK.
- [ ] **AC-3** Roles: CRUD con baja lógica; un rol creado como "auditor" se guarda como "AUDITOR".
- [ ] **AC-4** Recursos: crear, editar, desactivar y eliminar; un `path` sin `/api/` no deja enviar y un par repetido muestra el 409.
- [ ] **AC-5** Asignaciones: crear el vínculo usuario-rol y retirarlo; repetir uno activo muestra el 409 y crear uno retirado lo reactiva sin duplicar la fila. Al retirar FINANZAS de un usuario, su siguiente petición a `/api/clientes` responde 403 sin reiniciar el backend.
- [ ] **AC-6** Concesiones: el select muestra "MÉTODO ruta"; una concesión retirada desaparece del menú del rol afectado tras "Actualizar permisos".
- [ ] **AC-7** `cuentas` no ve el grupo Seguridad y `/admin/usuarios` por URL lo lleva a `/forbidden`; `ng serve` y `ng build` no muestran errores.

**Checklist interno (IA, En curso):**
- [ ] endpoint `GET /api/usuarios/:id/permisos` + catálogo
- [ ] usuarios con `isSelf` y "Ver permisos"
- [ ] roles y recursos
- [ ] asignaciones y concesiones con deactivate / reactivate
- [ ] rutas `/admin`, grupo Seguridad

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

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | usuarios | AC-1 | ver docs/proceso.md, sección ISS - 10 | crear `prueba_front` + Network → Payload y respuesta; editarlo; fila de `admin` sin bajas |
|       | ver permisos | AC-2 | ver docs/proceso.md, sección ISS - 10 | "Ver permisos" de `finanzas` + `npx ts-node scripts/check-resource-catalog.ts` en `backend_Express` |
|       | roles | AC-3 | ver docs/proceso.md, sección ISS - 10 | crear "auditor" y ver la fila |
|       | recursos | AC-4 | ver docs/proceso.md, sección ISS - 10 | path `clientes` sin `/api/`; repetir `GET /api/clientes` |
|       | asignaciones y 403 | AC-5 | ver docs/proceso.md, sección ISS - 10 | asignar FINANZAS a `prueba_front`, entrar con él, retirar la asignación desde `admin` y recargar `/clientes` con `prueba_front` |
|       | concesiones | AC-6 | ver docs/proceso.md, sección ISS - 10 | retirar una concesión de FINANZAS + "Actualizar permisos" con `finanzas`; luego reactivarla |
|       | forbidden y build | AC-7 | ver docs/proceso.md, sección ISS - 10 | `cuentas` + `localhost:4200/admin/usuarios` + `npx ng build 2>&1 \| tail -15` |

**Commit (hash):** `feat(front-iss-10): administracion rbac Refs #NN`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué retirar una asignación surte efecto en la siguiente petición sin reiniciar el backend ni pedir un token nuevo?». «¿Por qué los pivotes se desactivan y no se borran?». «¿Por qué crear un recurso nuevo no crea una pantalla nueva?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

surte efecto en la siguiente peticion porque los roles no van dentro del jwt, el token solo dice quien soy, en cada peticion authorize consulta en la base la cadena role_users, roles, resource_roles y resources, y si al usuario le quitaron la asignacion esa consulta ya no encuentra el permiso y responde 403, por eso no hay que reiniciar el backend ni esperar a que venza el token, si los roles viajaran en el token el usuario seguiria con permisos viejos hasta que el access token expire, lo unico que queda desactualizado es la ui, que se corrige con actualizar permisos

los pivotes se desactivan y no se borran porque asi queda la historia de quien tuvo que rol y que rol tuvo que permiso, con un status inactive el vinculo deja de contar para authorize pero se puede reactivar con un patch, sin crear otra fila, ademas el indice unico de role_users y resource_roles impide duplicar el vinculo, entonces si se borrara y se volviera a crear se perderia el id original, y la consulta de permisos ya filtra solo los activos, por eso el backend no expone delete en estas dos rutas

crear un recurso no crea una pantalla porque el recurso es solo un par method mas path que la matriz usa para autorizar, las pantallas son componentes y rutas de angular que ya estan escritos en el codigo y en el nav del shell, si creo un recurso para una ruta que no existe en la api o en el front no pasa nada visible, lo que hace el recurso es habilitar o no una ruta que ya existe, para tener una pantalla nueva hay que programarla y desplegarla, la administracion solo decide quien puede usar lo que ya esta construido

---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
