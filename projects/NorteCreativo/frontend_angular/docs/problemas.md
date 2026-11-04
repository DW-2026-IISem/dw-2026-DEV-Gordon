# Problemas encontrados y cómo resolverlos

| Problema | Causa / solución |
|---|---|
| CORS | El backend usa `cors()` abierto; si se restringe, permitir `localhost:4200` con `Content-Type` y `Authorization`. |
| 401 en cascada | Tokens viejos en `nortecreativo.session.v1`, reloj del sistema o más de un refresh en vuelo. |
| 401 con `requireAuth=false` | El backend sigue con `AUTH_ENABLED=true`, o quedó un Bearer guardado. |
| 401 en negocio con `requireAuth=true` | Al revés: el backend heredó `AUTH_ENABLED=false` de otra sesión y el negocio quedó abierto (o cerrado). Arrancarlo con la variable explícita: `AUTH_ENABLED=true npm run dev`. |
| 403 con el menú visible | Permisos en caché: «Actualizar permisos» y revisar `GET /api/permisos`. |
| Panel vacío tras login 200 | El login solo devuelve tokens; perfil y permisos se piden después. |
| `apiUrl` con barra final | Rutas `//clientes` → 404; quitar la barra. |
| 400 al aprobar | El body lleva `aprobador_id`, o el form envía `estado` del hito o `numero_version`. |
| 409 al subir versión | Hito CERRADO (RN-06) o versión APROBADA (RN-04): es una regla, no un bug. |
| Totales sumados como texto | El DECIMAL llega como string: usar `toNumber`. |
| `Type 'Menu' has no call signatures` | Referencia `#userMenu` igual a `userMenu()`; usar `#userMenuPanel`. |
| Aviso de licencia PrimeUI | Inofensivo; no inventar claves ni tocar `node_modules`. |
| `ng serve` trabado | `ng cache clean` o liberar el puerto 4200. |
| `p-button` con `routerLink` no navega (PrimeNG 22) | Usar `Router.navigate` en `(onClick)`. |
| Toast que se pierde al cambiar de layout | `p-toast` va en `app.html` (raíz), no dentro del Shell ni del Login. |
| Reusar un refresh token rotado → 401 | El backend revoca toda la familia («Refresh token ya usado»); es la defensa contra robo, hay que volver a iniciar sesión. |
| Aprobaciones y versiones aprobadas no se pueden borrar por API | Para limpiar datos de prueba hace falta `DELETE` en MySQL por ids exactos. |
| `db:seed` inserta una fila nueva en versiones en cada corrida | Comportamiento del seeder; para añadir solo un recurso nuevo basta con correr los seeders de recursos y concesiones. |
