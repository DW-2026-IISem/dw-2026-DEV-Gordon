> **Workspace:** `frontend` (Norte Creativo) · **Pista:** Fase II — Auth con RBAC (ISS-08 a ISS-11) · **Guía base:** `guia_front.docx` + https://tecnogua.com/academic/site/frontend2026/express/ · **Backend:** `backend_Express` (puerto 3012, `AUTH_ENABLED=true`)

# ISS-11 — Build, calidad y resolución de problemas

**Naturaleza:** práctico
**Issue GitHub:** `#NN`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-10 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/frontend2026/express/construir/ISS-11-build-calidad-y-resolucion-de-problemas/ (guía Word §11.1–11.7)
**Commit esperado:** `feat(front-iss-11): build calidad y recorrido final Refs #NN`

---

## 1. SDD

**OBJ:** Al finalizar, el frontend de Norte Creativo será reproducible y desplegable: compila para producción dentro de presupuesto, pasa el formato, cambia entre Fase I y Fase II con una sola bandera, y queda demostrado el recorrido completo de una campaña hasta el cierre del hito con los 5 roles.

**SPEC (qué debe quedar):**
- **Los dos entornos (§11.1)**: `requireAuth: true` en `environment.ts` y `environment.development.ts`. Volver a la Fase I es poner `false` en los dos, `AUTH_ENABLED=false` en el backend y limpiar `nortecreativo.session.v1`. Si solo se cambia uno de los dos lados, aparecen 401.
- **Scripts (§11.2)**: `start`, `build`, `watch`, `test` y `format:check` (`prettier --check "src/**/*.{ts,html,css}"`). Prettier queda como devDependency.
- **Presupuestos (§11.3)**: `initial` de 750 kB (aviso) y 1 MB (error), `anyComponentStyle` de 4 kB / 8 kB. Si el build se pasa, se reduce con `loadComponent` e imports puntuales de PrimeNG (medir con `ng build --stats-json`); no se sube el error sin motivo.
- **Calidad (§11.6)**:
  - Convenciones: signals y `computed`, `inject()`, servicios con sufijo `Api`, modelos sin lógica, `takeUntilDestroyed` en `load()`, kebab-case en archivos y `strict: true` sin `any`.
  - Accesibilidad: todo input con `label` o `aria-label`, botones de icono con `aria-label` y `pTooltip`, y estados legibles como texto en el `p-tag`, no solo por color.
- **`docs/problemas.md` (§11.5)**: tabla de errores reales con su causa, empezando por esta y sumando los que salgan en el recorrido:

| Problema | Causa / solución |
|---|---|
| CORS | El backend usa `cors()` abierto; si se restringe, permitir `localhost:4200` con `Content-Type` y `Authorization`. |
| 401 en cascada | Tokens viejos en `nortecreativo.session.v1`, reloj del sistema o más de un refresh en vuelo. |
| 401 con `requireAuth=false` | El backend sigue con `AUTH_ENABLED=true`, o quedó un Bearer guardado. |
| 403 con el menú visible | Permisos en caché: "Actualizar permisos" y revisar `GET /api/permisos`. |
| Panel vacío tras login 200 | El login solo devuelve tokens; perfil y permisos se piden después. |
| `apiUrl` con barra final | Rutas `//clientes` → 404; quitar la barra. |
| 400 al aprobar | El body lleva `aprobador_id`, o el form envía `estado` del hito o `numero_version`. |
| 409 al subir versión | Hito CERRADO (RN-06) o versión APROBADA (RN-04): es una regla, no un bug. |
| Totales sumados como texto | El DECIMAL llega como string: usar `toNumber`. |
| `Type 'Menu' has no call signatures` | Referencia `#userMenu` igual a `userMenu()`; usar `#userMenuPanel`. |
| Aviso de licencia PrimeUI | Inofensivo; no inventar claves ni tocar `node_modules`. |
| `ng serve` trabado | `ng cache clean` o liberar el puerto 4200. |

- **Publicación (§11.7)**: `npx ng build` → `dist/front-norte-creativo/browser/`, servido con fallback a `index.html` (por ejemplo, `npx serve -s dist/front-norte-creativo/browser`), documentado en el README.
- **`frontend/README.md`**: arranque (backend 3012 + front 4200), usuarios del seeder, interruptores, comandos de calidad y publicación.

**Checklist de humo (§11.4), adaptado a Norte Creativo:**

| # | Acción | Resultado esperado |
|---|---|---|
| 1 | `/dashboard` sin sesión | Redirige a `/login?returnUrl=/dashboard` |
| 2 | Login `admin` | Panel con menú completo (Operación + Seguridad) |
| 3 | CRUD cliente (`admin`) | Crear, editar, desactivar; el buscador filtra |
| 4 | Campaña, hito y tarea (`cuentas`) | Selects por nombre; el hito nace ABIERTO |
| 5 | Entregable y versión 1 (`creativo`) | Total en moneda; versión numerada por el backend |
| 6 | Rechazar la versión 1 (`aprobador`) | El hito sigue ABIERTO |
| 7 | Versión 2 y aprobarla | Toast "Hito cerrado"; el hito pasa a CERRADO |
| 8 | Versión 3 sobre ese hito (`creativo`) | 409 RN-06 visible |
| 9 | Dashboard | Los KPIs coinciden con los listados |
| 10 | RBAC (`admin`) | Crear rol, recurso, asignación y concesión; "Ver permisos" |
| 11 | Logout | `POST /api/sesion/logout`; vuelve a login y no queda token |
| 12 | Login `finanzas` | Menú reducido; `/tareas` y `/admin/*` → `/forbidden` |
| 13 | F5 en `/entregables/<id>` | La sesión persiste |
| 14 | Token expirado | Un solo refresh y reintento |
| 15 | Refresh revocado con `curl` logout | Sesión cerrada con mensaje claro |

**REQ (restricciones):**
- No se agregan funcionalidades nuevas: solo calidad, documentación y las correcciones que salgan del recorrido.
- El recorrido se hace con el backend real y MySQL, no con datos simulados.

**AC:**
- [ ] **AC-1** `npx ng build` termina con 0 errores y sin avisos de presupuesto que impidan el despliegue.
- [ ] **AC-2** Los 15 puntos del checklist de humo pasan.
- [ ] **AC-3** Cambiar `requireAuth` en los dos entornos (con `AUTH_ENABLED` igual en el backend) produce el comportamiento de cada fase.
- [ ] **AC-4** Revocar el refresh token con `curl` cierra la sesión de forma controlada, con toast.
- [ ] **AC-5** `npm run format:check` no reporta archivos sin formatear.
- [ ] **AC-6** `dist/` se sirve con fallback SPA y las rutas profundas recargan bien.
- [ ] **AC-7** `docs/problemas.md` y `README.md` del frontend existen y coinciden con lo que pasó en el recorrido.

**Checklist interno (IA, En curso):**
- [ ] scripts, Prettier y presupuestos
- [ ] revisión de convenciones y accesibilidad
- [ ] `docs/problemas.md`
- [ ] README del frontend con publicación

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

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | build | AC-1 | ver docs/proceso.md, sección ISS - 11 | `npx ng build 2>&1 \| tail -20` |
|       | checklist de humo | AC-2 | ver docs/proceso.md, sección ISS - 11 | los 15 puntos, una captura por punto con el usuario visible en el header |
|       | cambio de fase | AC-3 | ver docs/proceso.md, sección ISS - 11 | `requireAuth=false` + `AUTH_ENABLED=false` + storage limpio, y de vuelta a `true` |
|       | refresh revocado | AC-4 | ver docs/proceso.md, sección ISS - 11 | copiar `refreshToken` del storage + `curl -X POST localhost:3012/api/sesion/logout -H 'Content-Type: application/json' -d '{"refresh_token":"<token>"}'` + alterar el access y pulsar cualquier acción |
|       | formato | AC-5 | ver docs/proceso.md, sección ISS - 11 | `npm run format:check` |
|       | fallback SPA | AC-6 | ver docs/proceso.md, sección ISS - 11 | `npx serve -s dist/front-norte-creativo/browser` + F5 en `/entregables/<id>` |
|       | documentación | AC-7 | ver docs/proceso.md, sección ISS - 11 | `docs/problemas.md` y `README.md` del frontend |

**Commit (hash):** `feat(front-iss-11): build calidad y recorrido final Refs #NN`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «En el recorrido, ¿qué pasó en el backend cuando `aprobador` aprobó la versión 2 y por qué el hito se cerró solo?». «¿Por qué cambiar de fase exige tocar los dos lados, el front y el backend?». «¿Por qué una ruta profunda da 404 sin fallback SPA?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

cuando aprobador aprobo la version 2 el backend abrio una transaccion, bloqueo el hito, guardo la aprobacion con el aprobador sacado del token, cambio la version a aprobada y despues reviso con el evaluador si todos los entregables del hito tenian su ultima version aprobada, como ese hito tenia un solo entregable y su ultima version era la 2 la respuesta fue si, entonces cambio el hito a cerrado con su fecha de cierre y respondio hito_cerrado true, la version 1 rechazada no impidio el cierre porque lo que cuenta es la ultima version de cada entregable, y por eso la version 3 ya no se pudo subir, el hito cerrado no admite versiones nuevas por la rn-06

cambiar de fase exige tocar los dos lados porque cada uno protege una cosa distinta, requireAuth del front decide si la ui pide login, si los guards dejan pasar y si el interceptor pone el token, y auth_enabled del backend decide si las rutas de negocio exigen jwt y rbac, si el front esta en false y el backend en true las peticiones salen sin token y todo responde 401, y si el front esta en true y el backend en false la ui pide login para algo que el backend ya deja abierto, ademas hay que limpiar el localStorage porque un token viejo guardado se seguiria mandando

una ruta profunda da 404 sin fallback porque /entregables/5 no existe como archivo en el servidor, solo existe index.html y los js, cuando navego dentro de la app el router de angular cambia la url sin pedir nada al servidor, pero si recargo con f5 el navegador le pide al servidor /entregables/5 de verdad, y un servidor estatico normal no lo encuentra, con fallback el servidor devuelve index.html para cualquier ruta que no sea un archivo, angular arranca, lee la url y pinta la pantalla correcta

---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
