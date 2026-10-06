# Verificación de ISS-19 — comandos para terminal y capturas

Feature `refresh-tokens` (sesiones): token opaco con solo el hash en la base, rotación, revocación, detección de reuso y rutas `/api/sesiones` en modalidad JWT.

Cada comando es **una sola línea, sin variables ni funciones**: se copia, se pega en la terminal de WSL y se toma la captura. Las consultas a la base van con `docker exec` directo a `nc-mysql`.

**Requisitos:** estar en `projects/NorteCreativo/backend_Express`, con el servidor corriendo en otra terminal (`npm run dev`, puerto 3012), el contenedor `nc-mysql` activo y la base sembrada (`npm run db:seed`).

## 0. Preparación (una sola vez)

### 0.1 Columnas nuevas de `refresh_tokens` (modifica la base)

ISS-14 creó la tabla sin `family_id` ni `device_info`, y `sync()` no altera tablas existentes. La tabla está vacía, así que basta con este `ALTER`:

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "ALTER TABLE refresh_tokens ADD COLUMN family_id CHAR(36) NOT NULL AFTER user_id, ADD COLUMN device_info VARCHAR(255) NULL AFTER revoked_at, ADD INDEX ix_refresh_tokens_family (family_id)"
```

Comprobar:

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SHOW COLUMNS FROM refresh_tokens"
```

**Esperado:** columnas `id, user_id, family_id, token_hash, expires_at, revoked_at, device_info, status, createdAt, updatedAt`.

Si el `ALTER` da `Duplicate column name`, ya estaban creadas (por ejemplo, si la tabla se recreó) y puedes seguir.

### 0.2 Sesiones de prueba (aún no hay login)

Crea 3 sesiones para `finanzas` y 2 para `admin`:

```bash
npx ts-node scripts/dev-session.ts finanzas 3
```

```bash
npx ts-node scripts/dev-session.ts admin 2
```

Cada sesión imprime `sesion_id`, `family_id`, `expira`, el `refresh_token` **en claro** (solo se muestra ahí) y `hash en la BD`. Guarda el `refresh_token` de la primera sesión de `finanzas` para el AC-1 y apunta los `sesion_id`.

### 0.3 Tokens de acceso

```bash
npx ts-node scripts/dev-token.ts finanzas
```

```bash
npx ts-node scripts/dev-token.ts admin
```

Pega cada token donde dice `<TOKEN_FINANZAS>` o `<TOKEN_ADMIN>`. Duran 15 minutos.

---

## AC-1 — En `refresh_tokens` no hay ningún token en texto plano, solo hashes

Todas las filas tienen un `token_hash` de 64 caracteres hexadecimales (esperado: el mismo número que `total`):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT COUNT(*) AS total, SUM(token_hash REGEXP '^[0-9a-f]{64}$') AS con_hash_sha256 FROM refresh_tokens"
```

El token en claro **no** está en la tabla (sustituye `<REFRESH_TOKEN>` por el que imprimió `dev-session`; esperado `0`):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT COUNT(*) AS filas_con_token_en_claro FROM refresh_tokens WHERE token_hash='<REFRESH_TOKEN>'"
```

Su SHA-256 **sí** está, exactamente una vez (esperado `1`):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT COUNT(*) AS filas_con_su_hash FROM refresh_tokens WHERE token_hash=SHA2('<REFRESH_TOKEN>',256)"
```

Vista de la tabla (nada legible: solo hashes):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT id, user_id, LEFT(family_id,8) AS familia, LEFT(token_hash,16) AS inicio_del_hash, status, device_info FROM refresh_tokens ORDER BY id"
```

**Esperado:** `total` = `con_hash_sha256` (5 con las sesiones del paso 0.2), `0` filas con el token en claro y `1` fila con su SHA-256.

---

## AC-2 — `GET /api/sesiones` lista solo las sesiones del usuario del token

Respuesta completa con el token de `finanzas`:

```bash
curl -s -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/sesiones
```

Cuántas sesiones devuelve (cuenta los `family_id`; esperado `3`):

```bash
curl -s -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/sesiones | grep -o '"family_id"' | wc -l
```

De qué usuario(s) son (debe salir **un solo** `user_id`, el de `finanzas`):

```bash
curl -s -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/sesiones | grep -o '"user_id":[0-9]*' | sort -u
```

Ninguna respuesta trae el hash (esperado `0`):

```bash
curl -s -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/sesiones | grep -c token_hash
```

Con el token de `admin` salen solo las 2 suyas:

```bash
curl -s -H "Authorization: Bearer <TOKEN_ADMIN>" http://localhost:3012/api/sesiones | grep -o '"family_id"' | wc -l
```

Contraste con la base (sesiones activas de `finanzas`; esperado `3`):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT COUNT(*) AS activas_finanzas FROM refresh_tokens WHERE user_id=(SELECT id FROM users WHERE username='finanzas') AND status='active'"
```

Sin token (esperado `401`):

```bash
curl -i http://localhost:3012/api/sesiones
```

**Esperado:** `3` para `finanzas` (todas con su `user_id`), `2` para `admin`, `0` apariciones de `token_hash` y `401` sin token.

---

## AC-3 — `PATCH /api/sesiones/:id/deactivate` revoca esa sesión

Ver los ids de tus sesiones (de `finanzas`):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT id, status, revoked_at FROM refresh_tokens WHERE user_id=(SELECT id FROM users WHERE username='finanzas') ORDER BY id"
```

Revocar una (sustituye `<SESION_ID_FINANZAS>` por uno de esos ids):

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/sesiones/<SESION_ID_FINANZAS>/deactivate
```

Comprobar en la base:

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT id, status, revoked_at FROM refresh_tokens WHERE user_id=(SELECT id FROM users WHERE username='finanzas') ORDER BY id"
```

Ya no sale en el listado (esperado `2`):

```bash
curl -s -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/sesiones | grep -o '"family_id"' | wc -l
```

Revocarla otra vez (esperado `409`):

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/sesiones/<SESION_ID_FINANZAS>/deactivate
```

**Esperado:** `HTTP 200` con `"message":"Sesión revocada"` y `"status":"inactive"`; en la base `status=inactive` y `revoked_at` con fecha; el listado baja a `2`; la segunda vez `HTTP 409`.

---

## AC-4 — `PATCH /api/sesiones/deactivate-all` revoca todas las sesiones del usuario

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/sesiones/deactivate-all
```

Las de `finanzas` quedan todas inactivas (esperado `0` activas):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT COUNT(*) AS activas_finanzas FROM refresh_tokens WHERE user_id=(SELECT id FROM users WHERE username='finanzas') AND status='active'"
```

Las de `admin` no se tocan (esperado `2` activas):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT COUNT(*) AS activas_admin FROM refresh_tokens WHERE user_id=(SELECT id FROM users WHERE username='admin') AND status='active'"
```

Listado de `finanzas` vacío:

```bash
curl -s -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/sesiones
```

**Esperado:** `HTTP 200` con `{"message":"Sesiones revocadas","revocadas":2}` (las 2 que quedaban activas), `0` activas de `finanzas`, `2` activas de `admin` y `{"sesiones":[]}`.

---

## AC-5 — Pedir la sesión de otro usuario responde 404

Id de una sesión de `admin`:

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT id, user_id, status FROM refresh_tokens WHERE user_id=(SELECT id FROM users WHERE username='admin') ORDER BY id"
```

`finanzas` pide esa sesión (sustituye `<SESION_ID_ADMIN>`; esperado `404`):

```bash
curl -s -w "\nHTTP %{http_code}\n" -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/sesiones/<SESION_ID_ADMIN>
```

`finanzas` intenta revocarla (esperado `404`):

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/sesiones/<SESION_ID_ADMIN>/deactivate
```

Sigue activa en la base (esperado `active`):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT id, status FROM refresh_tokens WHERE id=<SESION_ID_ADMIN>"
```

Contraste: `admin` sí la ve (esperado `200`):

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" -H "Authorization: Bearer <TOKEN_ADMIN>" http://localhost:3012/api/sesiones/<SESION_ID_ADMIN>
```

**Esperado:** `404` (`{"message":"Sesión no encontrada"}`) para `finanzas` en ambas, la sesión de `admin` sigue `active`, y `200` para `admin`. La respuesta es idéntica a la de un id inexistente: no se revela que la sesión existe.

---

## AC-6 — `npx tsc --noEmit` sin errores

```bash
npx tsc --noEmit
```

```bash
echo $?
```

**Esperado:** sin líneas de error y `0`.

---

## Extra 1 — Rotación, reuso, vencimiento y concurrencia (service)

La rotación la usará el login/refresh de ISS-20, por eso no tiene ruta HTTP todavía. Este script la prueba directamente y **borra sus propias sesiones de prueba** al terminar:

```bash
npx ts-node scripts/check-refresh-rotation.ts
```

**Esperado:** 15 líneas `OK` y `TODO OK`. Cubre: emisión con solo el hash, rotación (el viejo queda inactivo y nace uno nuevo de la misma familia), **reuso** de un token ya rotado (se revoca toda la familia, incluido el token legítimo), token desconocido (`invalid`), token vencido (`expired`), dos rotaciones simultáneas (solo una emite) y `revokeByToken` idempotente.

## Extra 2 — Purga de sesiones revocadas o vencidas

```bash
curl -s -w "\nHTTP %{http_code}\n" -X DELETE -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/sesiones
```

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT COUNT(*) AS filas_finanzas FROM refresh_tokens WHERE user_id=(SELECT id FROM users WHERE username='finanzas')"
```

**Esperado:** `{"message":"Sesiones revocadas o vencidas eliminadas","eliminadas":3}` y `filas_finanzas=0`. Las de `admin` no se tocan.

## Extra 3 — Swagger y catálogo

```text
http://localhost:3012/api/docs
```

Debe aparecer el tag **Sesiones** con 5 operaciones, candado (Bearer) y solo respuesta 401 (sin 403: no pasan por RBAC).

```bash
npx ts-node scripts/check-resource-catalog.ts
```

**Esperado:** `Endpoints reales (rutas RBAC): 76` y `OK`. `/api/sesiones` queda fuera del catálogo a propósito: es modalidad JWT, no RBAC.

## Limpieza opcional

Para dejar la base sin las sesiones de prueba: `PATCH /api/sesiones/deactivate-all` y luego `DELETE /api/sesiones` con el token de cada usuario (`finanzas` y `admin`).
