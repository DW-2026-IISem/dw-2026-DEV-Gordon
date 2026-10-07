# Verificación de ISS-20 — comandos para terminal y capturas

Feature `session`: login, refresh con rotación, logout, perfil y permisos.

## Opción recomendada: un solo comando

Genera todo lo necesario (no hay tokens que pegar ni que caduquen), ejecuta cada AC mostrando la petición y su respuesta, y termina con un veredicto por AC. Los tokens salen recortados en pantalla.

**Requisitos:** estar en `projects/NorteCreativo/backend_Express`, con el servidor corriendo en otra terminal (`npm run dev`, puerto 3012), el contenedor `nc-mysql` activo y la base sembrada (`npm run db:seed`).

```bash
bash scripts/evidencia-iss20.sh
```

Dura 1 o 2 minutos. Deja la base como estaba: elimina las sesiones que crea (`device_info = 'evidencia-iss20'`) y el usuario inactivo de prueba. La captura del resultado completo puede ocupar varias pantallas; el `RESUMEN` del final debe mostrar `CUMPLE` en AC1 a AC6 y EXTRA.

---

## Opción manual: comandos sueltos

Una sola línea cada uno, sin variables. Sustituye `<ACCESS_TOKEN>` y `<REFRESH_TOKEN>` por lo que devuelva el login.

### AC-1 — Login de `admin` con la contraseña correcta responde 200 con `access_token` y `refresh_token`

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3012/api/sesion/login -H "Content-Type: application/json" -d '{"identifier":"admin","password":"Admin123!"}'
```

También con el email (sin distinguir mayúsculas):

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3012/api/sesion/login -H "Content-Type: application/json" -d '{"identifier":"ADMIN@norte-creativo.example","password":"Admin123!"}'
```

**Esperado:** `HTTP 200` con `access_token`, `token_type":"Bearer"`, `expires_in":900`, `refresh_token` y `refresh_expires_in":604800`.

### AC-2 — Contraseña mala y usuario inexistente responden 401 con el mismo mensaje

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3012/api/sesion/login -H "Content-Type: application/json" -d '{"identifier":"admin","password":"contraseña-mala"}'
```

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3012/api/sesion/login -H "Content-Type: application/json" -d '{"identifier":"no-existe","password":"Admin123!"}'
```

**Esperado:** los dos `HTTP 401` con exactamente `{"message":"Credenciales inválidas"}`. (Un usuario `inactive` con la contraseña correcta también da ese mismo 401; el script de evidencia lo comprueba creando uno de prueba.)

### AC-3 — Refresh entrega un par nuevo; reusar el refresh anterior responde 401

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3012/api/sesion/refresh -H "Content-Type: application/json" -d '{"refresh_token":"<REFRESH_TOKEN>"}'
```

Repite exactamente el mismo comando (reuso del token ya rotado):

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3012/api/sesion/refresh -H "Content-Type: application/json" -d '{"refresh_token":"<REFRESH_TOKEN>"}'
```

**Esperado:** el primero `HTTP 200` con un `refresh_token` distinto; el segundo `HTTP 401` con `Refresh token ya usado: la sesión fue revocada`. Además se revoca toda la familia: el refresh nuevo que acababas de recibir también da 401.

### AC-4 — Después de `logout`, el refresh token ya no sirve

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3012/api/sesion/logout -H "Content-Type: application/json" -d '{"refresh_token":"<REFRESH_TOKEN>"}'
```

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3012/api/sesion/refresh -H "Content-Type: application/json" -d '{"refresh_token":"<REFRESH_TOKEN>"}'
```

**Esperado:** `logout` `HTTP 200` (`Sesión cerrada`, y repetirlo también da 200: es idempotente); el `refresh` posterior `HTTP 401`.

### AC-5 — Perfil (usuario + roles) y permisos; sin token, 401

```bash
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3012/api/sesion/perfil -H "Authorization: Bearer <ACCESS_TOKEN>"
```

```bash
curl -s http://localhost:3012/api/permisos -H "Authorization: Bearer <ACCESS_TOKEN>" | grep -o '"total":[0-9]*'
```

```bash
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3012/api/sesion/perfil
```

```bash
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3012/api/permisos
```

**Esperado:** perfil `HTTP 200` con `username":"admin"` y `roles` con `ADMIN`, sin `password`; permisos `"total":76` para `admin` (6 para `finanzas`); los dos últimos `HTTP 401`.

### AC-6 — `npx tsc --noEmit` sin errores

```bash
npx tsc --noEmit
```

```bash
echo $?
```

**Esperado:** sin líneas de error y `0`.

---

## Extra — el refresh token no se guarda en claro

Sustituye `<REFRESH_TOKEN>` por uno recién emitido (esperado: `0` filas con el token en claro y `1` con su SHA-256):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT (SELECT COUNT(*) FROM refresh_tokens WHERE token_hash='<REFRESH_TOKEN>') AS en_claro, (SELECT COUNT(*) FROM refresh_tokens WHERE token_hash=SHA2('<REFRESH_TOKEN>',256)) AS con_su_hash"
```

Swagger: en `http://localhost:3012/api/docs` el tag **Autenticación** muestra `login`, `refresh` y `logout` sin candado (`security: []`) y `perfil` y `permisos` con candado Bearer.
