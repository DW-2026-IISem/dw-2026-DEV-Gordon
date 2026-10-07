# Verificación de ISS-21 — comandos para terminal y capturas

Cierre de la Fase II: negocio con JWT + RBAC, RN-05, Swagger con bearer, errorHandling, orden de seeders y smoke test.

Cada comando es **una sola línea, sin variables**. Sustituye `<TOKEN_…>` por el `access_token` del login correspondiente.

**Requisitos:** estar en `projects/NorteCreativo/backend_Express`, con `nc-mysql` activo y, para los comandos con `curl`, el servidor corriendo en otra terminal (`npm run dev`, puerto 3012).

## 0. Preparación de tu base (una sola vez)

Tu base ya existía antes de la RN-05, así que `sync()` no le añade la llave foránea y `ADMIN` conserva una concesión que ya no debe tener.

**0.1 FK de `aprobaciones.aprobador_id → users`** (modifica la tabla; todos los `aprobador_id` actuales apuntan al usuario 1, que existe):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "ALTER TABLE aprobaciones ADD CONSTRAINT fk_aprobaciones_aprobador FOREIGN KEY (aprobador_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE"
```

**0.2 Reconciliar la matriz** (`ADMIN` pierde `POST /api/aprobaciones`) — también es el AC-7:

```bash
npm run db:seed
```

**0.3 Reinicia el servidor** (`Ctrl+C` y `npm run dev`) para que cargue el código nuevo.

---

## AC-1 — Sin token, `GET /api/clientes` responde 401

```bash
curl -i http://localhost:3012/api/clientes
```

**Esperado:** `HTTP/1.1 401` y `{"message":"Falta el token Bearer en la cabecera Authorization"}`.

## AC-2 — `creativo` en `POST /api/aprobaciones` da 403; `aprobador` da 201 con su propio id como `aprobador_id`

Logins (copia el `access_token` de cada uno):

```bash
curl -s -X POST http://localhost:3012/api/sesion/login -H "Content-Type: application/json" -d '{"identifier":"creativo","password":"Creativo123!"}'
```

```bash
curl -s -X POST http://localhost:3012/api/sesion/login -H "Content-Type: application/json" -d '{"identifier":"aprobador","password":"Aprobador123!"}'
```

Una versión sobre la que probar (sustituye `<VERSION_ID>` por el id que devuelva):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT id FROM version_entregables WHERE estado='EN_REVISION' ORDER BY id LIMIT 1"
```

`creativo` intenta aprobar (esperado `403`):

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3012/api/aprobaciones -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN_CREATIVO>" -d '{"version_entregable_id":<VERSION_ID>,"estado":"RECHAZADA","comentario":"prueba AC-2"}'
```

`admin` tampoco puede, porque solo `CLIENTE_APROBADOR` aprueba (esperado `403`; usa el token de `admin`):

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3012/api/aprobaciones -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN_ADMIN>" -d '{"version_entregable_id":<VERSION_ID>,"estado":"RECHAZADA","comentario":"prueba AC-2"}'
```

`aprobador` aprueba (esperado `201`; un rechazo no cierra el hito):

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3012/api/aprobaciones -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN_APROBADOR>" -d '{"version_entregable_id":<VERSION_ID>,"estado":"RECHAZADA","comentario":"prueba AC-2"}'
```

El `aprobador_id` guardado es el del usuario `aprobador` (los dos ids deben coincidir):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT a.id, a.aprobador_id, u.username FROM aprobaciones a JOIN users u ON u.id=a.aprobador_id ORDER BY a.id DESC LIMIT 1"
```

Quién tiene concedido `POST /api/aprobaciones` (esperado: solo `CLIENTE_APROBADOR`):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT r.name AS rol FROM resource_roles rr JOIN roles r ON r.id=rr.role_id JOIN resources s ON s.id=rr.resource_id WHERE s.method='POST' AND s.path='/api/aprobaciones' AND rr.status='active'"
```

**Esperado:** `403`, `403`, `201`; `username=aprobador` con su id; una sola fila: `CLIENTE_APROBADOR`.

## AC-3 — Enviar `aprobador_id` en el body responde 400

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3012/api/aprobaciones -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN_APROBADOR>" -d '{"version_entregable_id":<VERSION_ID>,"estado":"RECHAZADA","aprobador_id":1}'
```

**Esperado:** `HTTP 400` con `aprobador_id no se acepta en el body: lo toma el sistema del usuario autenticado (RN-05)`.

## AC-4 — `finanzas` lee clientes (200) pero no los crea (403)

```bash
curl -s -X POST http://localhost:3012/api/sesion/login -H "Content-Type: application/json" -d '{"identifier":"finanzas","password":"Finanzas123!"}'
```

```bash
curl -s -o /dev/null -w "GET /clientes: HTTP %{http_code}\n" http://localhost:3012/api/clientes -H "Authorization: Bearer <TOKEN_FINANZAS>"
```

```bash
curl -s -w "\nPOST /clientes: HTTP %{http_code}\n" -X POST http://localhost:3012/api/clientes -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN_FINANZAS>" -d '{"tipo_documento":"NIT","numero_documento":"999","nombre":"x"}'
```

**Esperado:** `GET` `200`; `POST` `403` con `No autorizado: sin concesión para POST /api/clientes`.

## AC-5 — Swagger muestra Authorize, y login/refresh/logout aparecen sin candado

Abre en el navegador:

```text
http://localhost:3012/api/docs
```

Debe verse el botón **Authorize** arriba; las operaciones de negocio con candado; y `POST /api/sesion/login`, `/refresh` y `/logout` **sin** candado. Comprobación por consola (esperado `[]` en los tres):

```bash
curl -s http://localhost:3012/api/docs.json | node -pe "const p=JSON.parse(require('fs').readFileSync(0)).paths; JSON.stringify(['login','refresh','logout'].map(x=>p['/api/sesion/'+x].post.security))"
```

Seguridad por defecto y respuestas reutilizables (esperado `[{"bearerAuth":[]}]` y `Unauthorized,Forbidden`):

```bash
curl -s http://localhost:3012/api/docs.json | node -pe "const j=JSON.parse(require('fs').readFileSync(0)); JSON.stringify(j.security)+' '+Object.keys(j.components.responses)"
```

## AC-6 — Un cuerpo JSON mal formado responde 400 en JSON, sin HTML ni rutas del servidor

```bash
curl -i -X POST http://localhost:3012/api/sesion/login -H "Content-Type: application/json" -d '{"identifier":'
```

**Esperado:** `HTTP/1.1 400`, `Content-Type: application/json` y `{"message":"El cuerpo de la petición no es un JSON válido"}`; nada de `<html>`, `node_modules` ni números de línea.

## AC-7 — `npm run db:seed` siembra primero seguridad y después negocio, sin errores

```bash
npm run db:seed
```

**Esperado**, en este orden y sin errores: `Roles` → `Recursos` → `Usuarios` → `Asignaciones de rol` → `Concesiones` (`ADMIN=75, CUENTAS=29, CREATIVO=16, CLIENTE_APROBADOR=11, FINANZAS=6`) → `Clientes` → `Campañas` → `Hitos` → `Tareas` → `Entregables` → `Versiones de entregable` → `Seeders finalizados`. Al repetirlo no duplica nada.

## AC-8 — `bash scripts/smoke-rbac.sh` termina en verde y `npx tsc --noEmit` sin errores

```bash
bash scripts/smoke-rbac.sh
```

```bash
echo $?
```

**Esperado:** 44 líneas `PASS`, `SMOKE RBAC: TODO OK (44 comprobaciones)` y `0`. Si algo falla, el script imprime `FAIL` y sale con `1`. Deja desactivada su cadena de prueba y una aprobación `RECHAZADA` con comentario `smoke-rbac` (las aprobaciones no se borran).

```bash
npx tsc --noEmit
```

```bash
echo $?
```

**Esperado:** sin líneas de error y `0`.

---

## Extra — matriz y permisos de `admin`

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT r.name, SUM(rr.status='active') AS activas FROM resource_roles rr JOIN roles r ON r.id=rr.role_id GROUP BY r.id ORDER BY r.id"
```

**Esperado:** `ADMIN 75`, `CUENTAS 29`, `CREATIVO 16`, `CLIENTE_APROBADOR 11`, `FINANZAS 6`.
