> **Workspace:** `backend_Express` (Norte Creativo) · **Pista:** Refactor por capas + Auth con RBAC (ISS-12 a ISS-21) · **Manual base:** sitio del docente (Express 2026) · **SDD:** `docs/sdd.md`

# ISS-19 — Feature refresh-tokens (sesiones)

**Naturaleza:** práctico
**Issue GitHub:** `#19`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-18 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/backend2026/manual/16-ISS-14-auth-refresh-tokens/
**Commit esperado:** `feat(iss-19): refresh tokens y sesiones Refs #19`

---

## 1. SDD

**OBJ:** Al finalizar, las sesiones se guardarán como refresh tokens opacos y hasheados que el propio usuario puede listar y revocar.

**SPEC (qué debe quedar):**
- `features/auth/refresh-tokens/` por capas: emitir (token opaco aleatorio, en la base solo el **hash**), rotar, revocar y detectar reuso según el docente.
- Rutas modalidad **JWT** (solo las sesiones propias): `GET /api/sesiones`, `GET /api/sesiones/:id`, `PATCH /api/sesiones/:id/deactivate`, `PATCH /api/sesiones/deactivate-all`, `DELETE /api/sesiones`.
- Sin seeder: los refresh tokens los crea el login (ISS-20).

**REQ (restricciones):**
- Un usuario nunca ve ni revoca sesiones de otro (404).

**AC:**
- [x] **AC-1** En la tabla `refresh_tokens` no hay ningún token en texto plano, solo hashes.
- [x] **AC-2** `GET /api/sesiones` con token de un usuario lista solo sus sesiones.
- [x] **AC-3** `PATCH /api/sesiones/:id/deactivate` revoca esa sesión.
- [x] **AC-4** `PATCH /api/sesiones/deactivate-all` revoca todas las sesiones del usuario.
- [x] **AC-5** Pedir la sesión de otro usuario responde 404.
- [x] **AC-6** `npx tsc --noEmit` sin errores.

**Checklist interno (IA, En curso):**
- [x] capas refresh-tokens
- [x] hash del token
- [x] rotación y reuso
- [x] rutas JWT de sesiones

---

## 2. Revisión de AC

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

---

## 3. IA usada

**Herramienta / modelo:** Claude Code - Sonnet 5.5

**Fecha:** 4/10/26

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-19, no del backend entero.

Implementa los AC de docs/trazabilidad_NC/ISS-19.md en projects/NorteCreativo/backend_Express.
Aplica el patron por capas (capas HTTP -> Controller -> Service -> Repository -> Model, DTOs por operacion, BaseController.run/paramId,
AppError, findOrFail) adaptado a Norte Creativo.
Puerto 3012, base norte_creativo_express, rutas en español como el docente.

Construye el feature refresh-tokens del docente en src/features/auth/refresh-tokens: emision de token opaco, solo el hash en la base,
rotacion, revocacion y deteccion de reuso. Rutas modalidad JWT (solo authenticate) para las sesiones propias:
GET /api/sesiones, GET /api/sesiones/:id, PATCH /api/sesiones/:id/deactivate, PATCH /api/sesiones/deactivate-all, DELETE /api/sesiones.
Un usuario nunca accede a sesiones de otro (404). Para poder probarlo antes del login, agrega a scripts/ un generador de una sesion
de prueba para un usuario dado.

NO crees el login (ISS-20). Prohibido: NestJS, force: true, secretos en el codigo (JWT_SECRET solo en .env; .env.example sin valores), cambiar el puerto 3012 o la base norte_creativo_express. NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos exactos); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | hash en BD | AC-1 | ver docs/proceso.md, sección ISS - 19 | `docker exec -it nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT id, user_id, LEFT(token_hash,12) FROM refresh_tokens;"` (ajustar al nombre real de la columna) |
|       | listado propio | AC-2 | ver docs/proceso.md, sección ISS - 19 | `curl -s -H "Authorization: Bearer $TOKEN" localhost:3012/api/sesiones` |
|       | revocar una | AC-3 | ver docs/proceso.md, sección ISS - 19 | `curl -i -X PATCH -H "Authorization: Bearer $TOKEN" localhost:3012/api/sesiones/1/deactivate` |
|       | revocar todas | AC-4 | ver docs/proceso.md, sección ISS - 19 | `curl -i -X PATCH -H "Authorization: Bearer $TOKEN" localhost:3012/api/sesiones/deactivate-all` |
|       | sesión ajena | AC-5 | ver docs/proceso.md, sección ISS - 19 | pedir con otro usuario el id de una sesión ajena |
|       | compilación | AC-6 | ver docs/proceso.md, sección ISS - 19 | `npx tsc --noEmit` |

**Commit (hash):** pendiente — `feat(iss-19): refresh tokens y sesiones` · `Refs #__`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Por qué el refresh token se guarda hasheado?». «¿Qué es la rotación y qué protege la detección de reuso?». «¿Por qué estas rutas son JWT y no JWT + RBAC?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

el refresh token se guarda hasheado porque es una credencial de larga duracion, con ella se pide un access token nuevo sin volver a poner la contraseña, entonces si alguien lee la tabla refresh_tokens, por una fuga de la base o un respaldo, y los tokens estuvieran en texto plano, podria usarlos tal cual para abrir sesiones, con solo el hash no sirve, porque del hash no se puede volver al token, el usuario recibe el token una sola vez y el servidor solo guarda el hash para compararlo cuando llega uno, es la misma razon por la que la contraseña de users se guarda hasheada, el ac-1 lo comprueba mirando la tabla, y que el token plano que dio el script no aparece en ninguna fila

la rotacion es que cada vez que se usa un refresh token se emite uno nuevo y el anterior queda invalido, entonces un token solo sirve una vez, y la deteccion de reuso protege del robo, si llega un token que ya fue usado o revocado es porque hay dos copias, la del usuario y la de quien lo copio, y el servidor no sabe cual es cual, entonces corta las sesiones afectadas y obliga a volver a iniciar sesion, asi un token robado deja de servir en cuanto alguno de los dos lo use despues del otro

estas rutas son jwt y no jwt mas rbac porque son de recursos propios, lo que decide si puedes ver una sesion no es tu rol sino que sea tuya, el filtro sale del user_id del token y no de una concesion, y por eso un usuario ajeno recibe 404 y no 403, para no revelar que esa sesion existe, si fueran con rbac habria que concederle los recursos de sesiones a cada rol, y aun asi un rol con permiso podria mirar sesiones de otros, ademas cualquier usuario autenticado, sin importar el rol, tiene que poder cerrar sus propias sesiones, y por eso estas rutas no estan en resource-catalog.ts

ajuste: queda pendiente confirmar contra el codigo que algoritmo de hash usa y que hace exactamente el servicio cuando detecta un token reusado, si revoca solo ese o todas las sesiones del usuario
---

## 6. Gate

**Estado:** completado
**Conclusión:** completado
**Trazabilidad final:** completado
