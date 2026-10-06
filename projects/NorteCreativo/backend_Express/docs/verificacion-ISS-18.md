# Verificación de ISS-18 — comandos para terminal y capturas

Middlewares `authenticate` y `authorize`, y las 3 modalidades de acceso (OPEN, JWT, JWT + RBAC).

Cada comando es **una sola línea, sin variables ni funciones**: se copia, se pega en la terminal de WSL y se toma la captura. Las consultas a la base van con `docker exec` directo a `nc-mysql`.

**Requisitos:** estar en `projects/NorteCreativo/backend_Express`, con el servidor corriendo en otra terminal (`npm run dev`, puerto 3012), el contenedor `nc-mysql` activo y la base sembrada (`npm run db:seed`).

## 0. Tokens de prueba

No hay login todavía: el token se firma con el script de desarrollo, que lee `JWT_SECRET` del `.env` y comprueba el usuario en la base.

```bash
npx ts-node scripts/dev-token.ts admin
```

```bash
npx ts-node scripts/dev-token.ts finanzas
```

Cada comando imprime **una línea**: el token (empieza por `eyJ`). Cópialo y pégalo en los comandos de abajo donde dice `<TOKEN_ADMIN>` o `<TOKEN_FINANZAS>`.

- Los tokens duran 15 minutos (`JWT_ACCESS_TTL=900`). Si empiezas a recibir `401 Token inválido o vencido`, genera uno nuevo.
- Si el username no existe o está inactivo, el script lo dice en una línea y sale con error.

Ids de tu base que usa el AC-5 (compruébalos):

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT id, method, path FROM resources WHERE method='GET' AND path='/api/usuarios'"
```

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT id, name FROM roles WHERE name='FINANZAS'"
```

Esperado (con tu base actual): recurso `GET /api/usuarios` = **46** y rol `FINANZAS` = **5**.

---

## AC-1 — Sin token, `GET /api/usuarios` responde 401

```bash
curl -i http://localhost:3012/api/usuarios
```

**Esperado:** `HTTP/1.1 401 Unauthorized` y `{"message":"Falta el token Bearer en la cabecera Authorization"}`.

---

## AC-2 — Con un token mal formado o alterado responde 401

Token mal formado:

```bash
curl -i -H "Authorization: Bearer abc.def.ghi" http://localhost:3012/api/usuarios
```

Token alterado: toma el `<TOKEN_ADMIN>`, **cambia una letra de la parte de en medio** (la segunda sección, entre los dos puntos) y úsalo:

```bash
curl -i -H "Authorization: Bearer <TOKEN_ADMIN_CON_UNA_LETRA_CAMBIADA>" http://localhost:3012/api/usuarios
```

Esquema que no es Bearer:

```bash
curl -i -H "Authorization: Basic <TOKEN_ADMIN>" http://localhost:3012/api/usuarios
```

**Esperado:**
- Mal formado y alterado: `HTTP/1.1 401` con `{"message":"Token inválido o vencido"}`.
- Esquema Basic: `401` con `Falta el token Bearer…`.

---

## AC-3 — Token válido de `finanzas` (sin concesión sobre usuarios) responde 403

```bash
curl -i -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/usuarios
```

También un `POST` (tampoco tiene concesión):

```bash
curl -i -X POST -H "Authorization: Bearer <TOKEN_FINANZAS>" -H "Content-Type: application/json" -d '{}' http://localhost:3012/api/usuarios
```

**Esperado:** `HTTP/1.1 403 Forbidden` y `{"message":"No autorizado: sin concesión para GET /api/usuarios"}` (el `POST` dice `POST /api/usuarios`).

---

## AC-4 — Token válido de `admin` responde 200

```bash
curl -i -H "Authorization: Bearer <TOKEN_ADMIN>" http://localhost:3012/api/usuarios
```

Las otras cuatro rutas de administración, también con `admin`:

```bash
curl -s -o /dev/null -w "roles: %{http_code}\n" -H "Authorization: Bearer <TOKEN_ADMIN>" http://localhost:3012/api/roles
```

```bash
curl -s -o /dev/null -w "recursos: %{http_code}\n" -H "Authorization: Bearer <TOKEN_ADMIN>" http://localhost:3012/api/recursos
```

```bash
curl -s -o /dev/null -w "asignaciones-rol: %{http_code}\n" -H "Authorization: Bearer <TOKEN_ADMIN>" http://localhost:3012/api/asignaciones-rol
```

```bash
curl -s -o /dev/null -w "concesiones-rol: %{http_code}\n" -H "Authorization: Bearer <TOKEN_ADMIN>" http://localhost:3012/api/concesiones-rol
```

**Esperado:** `200` con `{"usuarios":[…]}` y `200` en las cuatro rutas. Con el token de `finanzas`, esas mismas cuatro dan `403`.

---

## AC-5 — Dar o retirar una concesión cambia el resultado en la siguiente petición, sin reiniciar el servidor

Usa `finanzas` (rol 5) y el recurso `GET /api/usuarios` (46). Ejecutar en orden, **sin reiniciar el servidor**:

**1. Antes: `finanzas` no puede**

```bash
curl -s -w "\nHTTP %{http_code}\n" -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/usuarios
```

**2. `admin` concede `GET /api/usuarios` al rol FINANZAS** (201 si es nueva, 200 si estaba inactiva y se reactivó)

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST -H "Authorization: Bearer <TOKEN_ADMIN>" -H "Content-Type: application/json" -d '{"role_id":5,"resource_id":46}' http://localhost:3012/api/concesiones-rol
```

**3. Después: el mismo token de `finanzas` ya puede**

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/usuarios
```

**4. Ver el id de esa concesión**

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT id, role_id, resource_id, status FROM resource_roles WHERE role_id=5 AND resource_id=46"
```

**5. `admin` la retira** (sustituye `<ID_CONCESION>` por el id del paso 4)

```bash
curl -s -w "\nHTTP %{http_code}\n" -X PATCH -H "Authorization: Bearer <TOKEN_ADMIN>" http://localhost:3012/api/concesiones-rol/<ID_CONCESION>/deactivate
```

**6. Vuelve a ser 403 en la siguiente petición**

```bash
curl -s -w "\nHTTP %{http_code}\n" -H "Authorization: Bearer <TOKEN_FINANZAS>" http://localhost:3012/api/usuarios
```

**Esperado**
- Paso 1: `HTTP 403`.
- Paso 2: `HTTP 201` y `"status":"active"`.
- Paso 3: **`HTTP 200`** (mismo token, sin reiniciar).
- Paso 5: `HTTP 200` y `"status":"inactive"`.
- Paso 6: **`HTTP 403`** otra vez.

Opcional, para ver la fila en la base:

```bash
docker exec -i nc-mysql mysql -uroot -p'NorteCreativo2026*' norte_creativo_express -e "SELECT id, role_id, resource_id, status FROM resource_roles WHERE role_id=5 AND resource_id=46"
```

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

## Extra — las 3 modalidades

Rutas **OPEN** (sin token, deben dar 200):

```bash
curl -s -o /dev/null -w "health: %{http_code}\n" http://localhost:3012/api/health
```

```bash
curl -s -o /dev/null -w "docs.json: %{http_code}\n" http://localhost:3012/api/docs.json
```

Rutas de **negocio** (siguen sin protección hasta ISS-21; sin token deben dar 200):

```bash
curl -s -o /dev/null -w "clientes: %{http_code}\n" http://localhost:3012/api/clientes
```

Swagger con el esquema Bearer y la protección en las rutas de administración (abrir en el navegador y buscar el botón **Authorize**):

```text
http://localhost:3012/api/docs
```

Un usuario desactivado pierde el acceso al instante (`401 Usuario inexistente o inactivo`), aunque su token siga vigente. No hace falta probarlo en tu base; la prueba automática lo cubrió con `PATCH /api/usuarios/:id/deactivate`.
